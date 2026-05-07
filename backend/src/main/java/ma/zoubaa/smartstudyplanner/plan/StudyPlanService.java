package ma.zoubaa.smartstudyplanner.plan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.zoubaa.smartstudyplanner.schedule.Schedule;
import ma.zoubaa.smartstudyplanner.schedule.ScheduleRepository;
import ma.zoubaa.smartstudyplanner.user.User;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
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

    @Value("${spring.ai.openai.api-key}")
    private String nvidiaApiKey;

    public StudyPlanService(StudyPlanRepository repository,
                            ScheduleRepository scheduleRepository,
                            ChatClient.Builder chatClientBuilder) {
        this.repository = repository;
        this.scheduleRepository = scheduleRepository;
        this.chatClient = chatClientBuilder.build();
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
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

        return repository.save(plan);
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
     * For PDFs: extract text with PDFBox, then send to the default fast LLM (Llama 3.1 8B).
     */
    private String generateFromPdf(Schedule schedule, String goals) throws IOException {
        String extractedText;
        try (InputStream is = new URL(schedule.getFileUrl()).openStream();
             PDDocument document = Loader.loadPDF(is.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
        }
        logger.info("Extracted {} characters from PDF", extractedText.length());

        String systemPrompt = "You are an expert academic advisor. Generate a structured study plan in JSON format.";
        String userPrompt = String.format("""
            Student Goals: %s
            Schedule Content (Extracted from PDF):
            ---
            %s
            ---
            Return a JSON object with: title, overview, weeklyPlan (array of {day, sessions: [{subject, time, topic}]}), tips (array of 3 strings).
            Return ONLY the JSON object, no other text.
            """, goals, extractedText);

        return chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();
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
            You are looking at a school schedule image. Your task is to:
            1. Read the timetable accurately (subjects, times, days).
            2. Consider the student's goals: "%s"
            3. Generate a personalized study plan that uses the free time slots in this schedule.
            
            Respond ONLY with a JSON object in this exact format:
            {
              "title": "A motivating title",
              "overview": "A brief 2-sentence strategy summary",
              "weeklyPlan": [
                {
                  "day": "Monday",
                  "sessions": [
                    {"subject": "Subject Name", "time": "HH:MM - HH:MM", "topic": "Detailed focus topic"}
                  ]
                }
              ],
              "tips": ["Smart AI tip 1", "Smart AI tip 2", "Smart AI tip 3"]
            }
            
            IMPORTANT: Do NOT schedule study during class time found in the image. Return ONLY the raw JSON.
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
