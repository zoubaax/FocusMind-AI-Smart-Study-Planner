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
                "You are FocusMind AI, a study assistant.\n" +
                "User account email (for context only, NOT a recipient): %s\n" +
                "Schedules: %s\n" +
                "Today's tasks: %s\n\n" +
                "EMAIL RULES (follow EXACTLY):\n" +
                "1. When asked to email someone, show a draft:\n" +
                "   📧 **Email Draft**\n" +
                "   **To:** <THE RECIPIENT EMAIL THE USER SPECIFIED>\n" +
                "   **Subject:** <subject>\n" +
                "   > <body>\n" +
                "   Should I send this?\n" +
                "2. When user confirms (yes/send/ok), reply ONLY with:\n" +
                "   Sending email... [[SEND_EMAIL:{\"to\":\"<SAME RECIPIENT FROM DRAFT>\",\"subject\":\"<same subject>\",\"body\":\"<same body>\"}]]\n" +
                "3. CRITICAL: The 'to' field MUST be the RECIPIENT the user asked to email, NOT the user's own email (%s). " +
                "Look at the **To:** field in your previous draft and use EXACTLY that address.\n" +
                "4. Never show the [[SEND_EMAIL:...]] tag text. Never redraft after confirmation.\n" +
                "Be concise.",
                user.getEmail(),
                scheduleInfo.isEmpty() ? "None" : scheduleInfo,
                taskInfo.isEmpty() ? "None" : taskInfo,
                user.getEmail());

        // Build full message list including history
        java.util.List<Map<String, String>> messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Keep enough history to see draft→confirm flow
        if (history != null) {
            history.stream()
                    .filter(m -> m.get("content") != null && m.get("role") != null)
                    .skip(Math.max(0, history.size() - 10))
                    .forEach(m -> {
                        messages.add(Map.of("role", m.get("role"), "content", m.get("content")));
                    });
        }

        messages.add(Map.of("role", "user", "content", userMessage));

        // Try fast model first (short timeout), fall back to larger model if degraded
        String[][] models = {
            {"meta/llama-3.1-8b-instruct", "15000"},   // Fast model, 15s timeout (fail fast)
            {"meta/llama-3.3-70b-instruct", "120000"}   // Fallback, full 120s timeout
        };

        for (String[] entry : models) {
            String model = entry[0];
            int timeout = Integer.parseInt(entry[1]);
            try {
                logger.info("Trying chat model: {} (timeout: {}ms)", model, timeout);
                String result = callNvidiaApi(model, messages, timeout);
                if (result != null) return result;
            } catch (Exception e) {
                logger.warn("Model {} failed: {}. Trying next...", model, e.getMessage());
            }
        }

        return "I'm sorry, all AI models are currently unavailable. Please try again in a few minutes.";
    }

    private String callNvidiaApi(String model, List<Map<String, String>> messages, int timeoutMs) {
        String url = "https://integrate.api.nvidia.com/v1/chat/completions";

        // Create a RestTemplate with the specific timeout for this attempt
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(timeoutMs);
        RestTemplate rt = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.1);
        requestBody.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = rt.postForEntity(url, entity, Map.class);

        if (response.getBody() != null && response.getBody().containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        }

        return null;
    }
}
