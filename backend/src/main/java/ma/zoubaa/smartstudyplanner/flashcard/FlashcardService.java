package ma.zoubaa.smartstudyplanner.flashcard;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.zoubaa.smartstudyplanner.schedule.CloudinaryService;
import ma.zoubaa.smartstudyplanner.user.User;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    private static final Logger logger = LoggerFactory.getLogger(FlashcardService.class);
    private final CourseMaterialRepository materialRepository;
    private final FlashcardRepository flashcardRepository;
    private final CloudinaryService cloudinaryService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    public FlashcardService(CourseMaterialRepository materialRepository,
                            FlashcardRepository flashcardRepository,
                            CloudinaryService cloudinaryService) {
        this.materialRepository = materialRepository;
        this.flashcardRepository = flashcardRepository;
        this.cloudinaryService = cloudinaryService;
        
        // 120s timeout for complex PDF parsing
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public CourseMaterial uploadMaterial(MultipartFile file, User user) throws IOException {
        Map uploadResult = cloudinaryService.upload(file);
        String fileUrl = (String) uploadResult.get("secure_url");
        
        String extractedText = "";
        if (isPdf(file)) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            }
        }

        CourseMaterial material = new CourseMaterial(
                file.getOriginalFilename(),
                fileUrl,
                extractedText,
                user
        );

        return materialRepository.save(material);
    }

    public List<Flashcard> generateFlashcards(Long materialId) {
        CourseMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        if (material.getExtractedText() == null || material.getExtractedText().isEmpty()) {
            throw new RuntimeException("No text found in this material to generate flashcards from.");
        }

        String url = "https://integrate.api.nvidia.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String systemPrompt = "You are an expert educator. Based on the provided course material, generate 10 high-quality flashcards. " +
                "Output ONLY a valid JSON array of objects with 'question' and 'answer' fields. No extra text.";
        
        // Truncate text if too long for the model
        String content = material.getExtractedText();
        if (content.length() > 6000) content = content.substring(0, 6000);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta/llama-3.1-8b-instruct");
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", "Course Material:\n" + content)
        ));
        requestBody.put("temperature", 0.1);

        try {
            logger.info("Sending request to NVIDIA AI for material ID: {}. Text length: {}", materialId, content.length());
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                String aiResponse = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
                logger.info("AI Response received successfully");
                
                // Extract JSON if AI wrapped it in markdown
                if (aiResponse.contains("[") && aiResponse.contains("]")) {
                    aiResponse = aiResponse.substring(aiResponse.indexOf("["), aiResponse.lastIndexOf("]") + 1);
                }

                List<Map<String, String>> cardsData = objectMapper.readValue(aiResponse, new TypeReference<>() {});
                
                List<Flashcard> flashcards = cardsData.stream().map(data -> 
                    new Flashcard(
                        data.get("question"),
                        data.get("answer"),
                        material
                    )
                ).collect(Collectors.toList());

                return flashcardRepository.saveAll(flashcards);
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("AI Generation failed (4xx): {}. Response body: {}", e.getMessage(), e.getResponseBodyAsString());
            throw new RuntimeException("AI API error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("AI Generation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate flashcards: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    private boolean isPdf(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.contains("pdf") || 
               file.getOriginalFilename().toLowerCase().endsWith(".pdf");
    }

    public List<CourseMaterial> getUserMaterials(Long userId) {
        return materialRepository.findAllByUserId(userId);
    }

    public List<Flashcard> getFlashcards(Long materialId) {
        return flashcardRepository.findAllByCourseMaterialId(materialId);
    }
}
