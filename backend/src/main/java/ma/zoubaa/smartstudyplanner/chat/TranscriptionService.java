package ma.zoubaa.smartstudyplanner.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class TranscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(TranscriptionService.class);

    @Value("${spring.ai.groq.api-key}")
    private String groqApiKey;

    private final RestTemplate restTemplate;
    private final String GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

    public TranscriptionService() {
        this.restTemplate = new RestTemplate();
    }

    public String transcribe(MultipartFile file) throws IOException {
        logger.info("Starting transcription for file: {} (Size: {} bytes)", 
                file.getOriginalFilename(), file.getSize());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(groqApiKey);

        // Convert MultipartFile to ByteArrayResource for RestTemplate
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.webm";
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("model", "whisper-large-v3");
        body.add("response_format", "json");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_WHISPER_URL, requestEntity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String text = (String) response.getBody().get("text");
                logger.info("Transcription successful: {}", text);
                return text;
            } else {
                throw new RuntimeException("Failed to transcribe audio: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error during Groq transcription: {}", e.getMessage());
            throw new RuntimeException("Transcription error: " + e.getMessage());
        }
    }
}
