package ma.zoubaa.smartstudyplanner.plan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.zoubaa.smartstudyplanner.schedule.Schedule;
import ma.zoubaa.smartstudyplanner.schedule.ScheduleRepository;
import ma.zoubaa.smartstudyplanner.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;

@Service
public class StudyPlanService {

    private static final Logger logger = LoggerFactory.getLogger(StudyPlanService.class);
    private final StudyPlanRepository repository;
    private final ScheduleRepository scheduleRepository;
    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ma.zoubaa.smartstudyplanner.task.StudyTaskRepository taskRepository;

    @Value("${spring.ai.openai.api-key}")
    private String nvidiaApiKey;

    public StudyPlanService(StudyPlanRepository repository,
                            ScheduleRepository scheduleRepository,
                            ChatClient.Builder chatClientBuilder,
                            ma.zoubaa.smartstudyplanner.task.StudyTaskRepository taskRepository) {
        this.repository = repository;
        this.scheduleRepository = scheduleRepository;
        this.chatClient = chatClientBuilder.build();
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.taskRepository = taskRepository;
    }

    @Transactional
    public StudyPlan generatePlan(Long scheduleId, String goals, User user) {
        logger.info("Generating study plan for schedule {} and user {}", scheduleId, user.getEmail());
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        String aiResponse;

        try {
            if (schedule.getFileType() != null && schedule.getFileType().contains("pdf")) {
                logger.info("Detected PDF file. Extracting text with PDFBox...");
                aiResponse = generateFromPdf(schedule, goals);
            } else {
                logger.info("Detected Image file ({}). Calling NVIDIA Vision API directly...", schedule.getFileType());
                aiResponse = generateFromImageDirect(schedule, goals);
            }
        } catch (Exception e) {
            logger.error("AI Generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate study plan: " + e.getMessage(), e);
        }

        // Clean AI response: extract only the JSON part
        aiResponse = extractJson(aiResponse);
        logger.info("Cleaned AI response (first 200 chars): {}", aiResponse.substring(0, Math.min(200, aiResponse.length())));

        StudyPlan plan = new StudyPlan(
            "Plan for " + schedule.getFileName(),
            aiResponse,
            goals,
            schedule,
            user
        );

        StudyPlan savedPlan = repository.save(plan);
        
        // --- NEW: Convert AI sessions to actual StudyTasks ---
        try {
            createTasksFromPlan(savedPlan, user);
            logger.info("Successfully created tasks from plan {}", savedPlan.getId());
        } catch (Exception e) {
            logger.error("Failed to create tasks from plan: {}", e.getMessage());
            // Non-fatal for the plan itself, but user won't see tasks yet
        }

        return savedPlan;
    }

    private void createTasksFromPlan(StudyPlan plan, User user) throws IOException {
        JsonNode root = objectMapper.readTree(plan.getContent());
        JsonNode weeklyPlan = root.path("weeklyPlan");
        
        if (!weeklyPlan.isArray()) return;

        java.time.LocalDate today = java.time.LocalDate.now();
        
        for (JsonNode dayNode : weeklyPlan) {
            String dayName = dayNode.path("day").asText();
            JsonNode sessions = dayNode.path("sessions");
            
            if (!sessions.isArray()) continue;

            // Find the date for this day of the week
            java.time.LocalDate taskDate = getNextOccurrence(today, dayName);

            for (JsonNode session : sessions) {
                String subject = session.path("subject").asText();
                String timeStr = session.path("time").asText();
                String topic = session.path("topic").asText();

                // Parse "HH:mm - HH:mm"
                try {
                    String[] times = timeStr.split("-");
                    java.time.LocalTime startTime = java.time.LocalTime.parse(times[0].trim());
                    java.time.LocalTime endTime = java.time.LocalTime.parse(times[1].trim());

                    ma.zoubaa.smartstudyplanner.task.StudyTask task = new ma.zoubaa.smartstudyplanner.task.StudyTask(
                        subject, subject, topic,
                        taskDate.atTime(startTime),
                        taskDate.atTime(endTime),
                        user, plan
                    );
                    taskRepository.save(task);
                } catch (Exception e) {
                    logger.warn("Could not parse time '{}' for task: {}", timeStr, e.getMessage());
                }
            }
        }
    }

    private java.time.LocalDate getNextOccurrence(java.time.LocalDate start, String dayName) {
        try {
            java.time.DayOfWeek targetDay = java.time.DayOfWeek.valueOf(dayName.toUpperCase());
            int daysToAdd = (targetDay.getValue() - start.getDayOfWeek().getValue() + 7) % 7;
            return start.plusDays(daysToAdd);
        } catch (Exception e) {
            return start; // Fallback to today if day name is weird
        }
    }

    /**
     * Extracts a JSON object from an AI response that may contain extra text.
     * Looks for the first '{' and the last '}' in the response.
     */
    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) return "{}";
        
        // Remove markdown code blocks if present
        String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        
        if (start != -1 && end != -1 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        
        // If no JSON braces found, return as-is
        logger.warn("Could not extract JSON from AI response, returning raw content");
        return cleaned;
    }

    /**
     * For PDFs: use text that was extracted at upload time, then send to the LLM.
     * Falls back to a message if no text was extracted.
     */
    private String generateFromPdf(Schedule schedule, String goals) throws IOException {
        String extractedText = schedule.getExtractedText();

        if (extractedText == null || extractedText.isBlank()) {
            logger.warn("No pre-extracted text found for schedule {}. PDF text may not have been extracted at upload time.", schedule.getId());
            extractedText = "[No text could be extracted from this PDF. Please re-upload the file.]";
        }

        logger.info("Using pre-extracted text ({} chars) for plan generation", extractedText.length());

        String systemPrompt = "You are an expert academic advisor. You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no code blocks.";
        String userPrompt = String.format("""
            Student Goals: %s
            Schedule Content (Extracted from PDF):
            ---
            %s
            ---
            Return a JSON object with: title, overview, weeklyPlan (array of {day, sessions: [{subject, time, topic}]}), tips (array of 3 strings).
            Return ONLY the JSON object, no other text.
            """, goals, extractedText);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta/llama-3.1-8b-instruct");
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userPrompt)
        ));
        requestBody.put("temperature", 0.2);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(nvidiaApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            logger.info("Calling NVIDIA API for PDF-based plan generation...");
            ResponseEntity<String> response = restTemplate.exchange(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                HttpMethod.POST, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            logger.error("NVIDIA API call failed for PDF: {}", e.getMessage());
            throw new RuntimeException("AI generation failed: " + e.getMessage());
        }
    }

    /**
     * For Images: Use Llama 3.2 Vision to READ the schedule and GENERATE a 
     * structured JSON study plan in a single highly-efficient call.
     */
    private String generateFromImageDirect(Schedule schedule, String goals) throws IOException {
        logger.info("Downloading image from: {}", schedule.getFileUrl());

        // ── Step 1: Download image and convert to base64 ──
        byte[] imageBytes;
        try (InputStream is = new URL(schedule.getFileUrl()).openStream()) {
            imageBytes = is.readAllBytes();
        }
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String mimeType = getMimeTypeFromExtension(schedule.getFileType());
        String dataUri = "data:" + mimeType + ";base64," + base64Image;

        logger.info("Image downloaded: {} bytes, mime: {}", imageBytes.length, mimeType);

        // ── Step 2: Single-Step Vision Call: Read schedule and generate JSON plan ──
        String systemPrompt = "You are an expert academic advisor. You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no code blocks.";
        
        String visionPrompt = String.format("""
            You are an expert Study Planner. Look at the attached school schedule image and follow these steps carefully:
            
            STEP 1: Analyze the image and identify all BUSY blocks (when the student has school/class).
            STEP 2: Identify all FREE blocks (empty white boxes in the grid and all evenings after school).
            STEP 3: Create a personalized STUDY PLAN using ONLY the FREE blocks identified in Step 2.
            
            Student's Requirements & Constraints:
            "%s"
            
            RULES:
            - DO NOT list school classes as study sessions. The plan is only for free time.
            - You MUST respect every specific goal, hobby, or time constraint mentioned in the "Student's Requirements" above.
            - Map the subjects mentioned in the requirements to the available free time slots.
            - Ensure a healthy balance between study and the mentioned personal activities.
            
            Respond ONLY with a JSON object in this format:
            {
              "title": "A custom motivating title",
              "overview": "How this plan balances school with the student's specific goals.",
              "weeklyPlan": [
                {
                  "day": "Monday",
                  "sessions": [
                    {"subject": "Topic from Requirements", "time": "HH:MM - HH:MM", "topic": "Detailed focus activity"}
                  ]
                }
              ],
              "tips": ["Personalized tip 1", "Personalized tip 2", "Personalized tip 3"]
            }
            
            Return ONLY the raw JSON. No markdown, no text before or after.
            """, goals);

        Map<String, Object> visionRequest = new HashMap<>();
        visionRequest.put("model", "meta/llama-3.2-11b-vision-instruct");
        visionRequest.put("max_tokens", 4096);
        visionRequest.put("temperature", 0.2); // Low temperature for better JSON structure

        List<Map<String, Object>> content = new ArrayList<>();
        content.add(Map.of("type", "text", "text", visionPrompt));
        content.add(Map.of("type", "image_url", "image_url", Map.of("url", dataUri)));

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", content);
        
        Map<String, Object> systemMessage = Map.of("role", "system", "content", systemPrompt);
        
        visionRequest.put("messages", List.of(systemMessage, message));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(nvidiaApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(visionRequest, headers);

        logger.info("Calling NVIDIA Vision API for single-step plan generation...");
        ResponseEntity<String> response = restTemplate.exchange(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            HttpMethod.POST, entity, String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        String planJson = root.path("choices").get(0).path("message").path("content").asText();
        
        logger.info("Vision plan response received (length: {} chars)", planJson.length());
        return planJson;
    }

    private String getMimeTypeFromExtension(String ext) {
        if (ext == null) return "image/jpeg";
        String cleaned = ext.toLowerCase().replace(".", "");
        return switch (cleaned) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    public List<StudyPlan> getUserPlans(Long userId) {
        return repository.findByUser_Id(userId);
    }
}
