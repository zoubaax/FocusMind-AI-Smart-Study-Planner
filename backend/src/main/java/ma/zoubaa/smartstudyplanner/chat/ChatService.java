package ma.zoubaa.smartstudyplanner.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.zoubaa.smartstudyplanner.schedule.Schedule;
import ma.zoubaa.smartstudyplanner.schedule.ScheduleRepository;
import ma.zoubaa.smartstudyplanner.task.StudyTask;
import ma.zoubaa.smartstudyplanner.task.StudyTaskRepository;
import ma.zoubaa.smartstudyplanner.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ScheduleRepository scheduleRepository;
    private final StudyTaskRepository taskRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    public ChatService(ScheduleRepository scheduleRepository,
            StudyTaskRepository taskRepository) {
        this.scheduleRepository = scheduleRepository;
        this.taskRepository = taskRepository;
        
        // IMPORTANT: NVIDIA free tier can take up to 90s — do NOT reduce this
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(factory);
        
        this.objectMapper = new ObjectMapper();
    }

    public String chat(String userMessage, List<Map<String, String>> history, User user) {
        List<Schedule> schedules = scheduleRepository.findAllByUserId(user.getId());
        List<StudyTask> tasks = taskRepository.findByUser_Id(user.getId());

        String scheduleInfo = schedules.stream()
                .map(s -> "- " + s.getFileName() + " (" + s.getFileType() + ")")
                .collect(Collectors.joining("\n"));

        String taskInfo = tasks.stream()
                .filter(t -> !t.isCompleted())
                .map(t -> "- " + t.getTopic() + " (" + t.getSubject() + ") at "
                        + (t.getStartTime() != null ? t.getStartTime().toString() : "TBD"))
                .collect(Collectors.joining("\n"));

        String systemPrompt = String.format(
                "You are FocusMind AI, a study assistant. User: %s\n" +
                "Schedules: %s\n" +
                "Today's tasks: %s\n\n" +
                "EMAIL RULES:\n" +
                "1. If asked to email, show a draft: 📧 **Email Draft**\\n**To:** ...\\n**Subject:** ...\n> body\\nShould I send this?\n" +
                "2. When user confirms, reply ONLY: Sending email... [[SEND_EMAIL:{\"to\":\"...\",\"subject\":\"...\",\"body\":\"...\"}]]\n" +
                "3. Never mention the tag. Never redraft after confirmation.\n" +
                "Be concise.",
                user.getEmail(),
                scheduleInfo.isEmpty() ? "None" : scheduleInfo,
                taskInfo.isEmpty() ? "None" : taskInfo);

        // Build full message list including history
        java.util.List<Map<String, String>> messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (history != null) {
            history.stream()
                    .filter(m -> m.get("content") != null && m.get("role") != null)
                    .skip(Math.max(0, history.size() - 6))
                    .forEach(m -> {
                        messages.add(Map.of("role", m.get("role"), "content", m.get("content")));
                    });
        }

        messages.add(Map.of("role", "user", "content", userMessage));

        // Try fast model first, fall back to larger model if degraded
        String[] models = {"meta/llama-3.1-8b-instruct", "meta/llama-3.3-70b-instruct"};

        for (String model : models) {
            try {
                logger.info("Trying chat model: {}", model);
                String result = callNvidiaApi(model, messages);
                if (result != null) return result;
            } catch (Exception e) {
                logger.warn("Model {} failed: {}. Trying next...", model, e.getMessage());
            }
        }

        return "I'm sorry, all AI models are currently unavailable. Please try again in a few minutes.";
    }

    private String callNvidiaApi(String model, List<Map<String, String>> messages) {
        String url = "https://integrate.api.nvidia.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.1);
        requestBody.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        }

        return null;
    }
}
