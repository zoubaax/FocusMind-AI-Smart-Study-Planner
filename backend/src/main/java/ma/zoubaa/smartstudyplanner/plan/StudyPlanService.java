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
     * For PDFs: extract text with PDFBox, then send to Llama 3.1 70B (text model).
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
     * For Images: call the NVIDIA Vision API directly via REST.
     * This bypasses Spring AI's Media API which isn't compatible with NVIDIA's format.
     */
    private String generateFromImageDirect(Schedule schedule, String goals) throws IOException {
        logger.info("Downloading image from: {}", schedule.getFileUrl());

        // Step 1: Download the image and convert to base64
        byte[] imageBytes;
        try (InputStream is = new URL(schedule.getFileUrl()).openStream()) {
            imageBytes = is.readAllBytes();
        }
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String mimeType = getMimeTypeFromExtension(schedule.getFileType());
        String dataUri = "data:" + mimeType + ";base64," + base64Image;

        logger.info("Image downloaded: {} bytes, mime: {}", imageBytes.length, mimeType);

        // Step 2: Build the NVIDIA-compatible request body
        String userPrompt = String.format("""
            Analyze this school schedule image carefully. The student's goals are: "%s".
            
            Generate a structured study plan in JSON format with:
            - title: A catchy, motivating title
            - overview: A brief strategy summary
            - weeklyPlan: Array of objects, each with "day" and "sessions" (array of {subject, time, topic})
            - tips: Array of 3 specific productivity tips
            
            Return ONLY the raw JSON object. No markdown, no code blocks, no extra text.
            """, goals);

        // Build OpenAI-compatible request for NVIDIA NIM
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta/llama-3.2-11b-vision-instruct");
        requestBody.put("max_tokens", 4096);

        // Build the content array with text + image
        List<Map<String, Object>> content = new ArrayList<>();
        content.add(Map.of("type", "text", "text", userPrompt));
        content.add(Map.of(
            "type", "image_url",
            "image_url", Map.of("url", dataUri)
        ));

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", content);
        requestBody.put("messages", List.of(message));

        // Step 3: Call the NVIDIA API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(nvidiaApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        logger.info("Calling NVIDIA Vision API...");
        ResponseEntity<String> response = restTemplate.exchange(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            HttpMethod.POST,
            entity,
            String.class
        );

        logger.info("NVIDIA API responded with status: {}", response.getStatusCode());

        // Step 4: Parse the response
        JsonNode root = objectMapper.readTree(response.getBody());
        String aiContent = root.path("choices").get(0).path("message").path("content").asText();

        logger.info("AI response length: {} characters", aiContent.length());
        return aiContent;
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
