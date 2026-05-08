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
        this.restTemplate = new RestTemplate();
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
                .map(t -> "- " + t.getTopic() + " (" + t.getSubject() + ") at " + (t.getStartTime() != null ? t.getStartTime().toString() : "TBD"))
                .collect(Collectors.joining("\n"));

        String systemPrompt = String.format("""
            You are the FocusMind AI Study Agent. You help students manage their time and studies.
            
            Current User Context:
            - User: %s
            - Uploaded Schedules:
            %s
            - Pending Tasks for Today:
            %s
            
            STRICT EMAIL PROTOCOL:
            1. If the user asks to send an email, you MUST first provide a DRAFT using this format:
               ### 📧 Email Draft
               **To**: `recipient@email.com`
               **Subject**: *Subject Here*
               ---
               **Body**:
               > [Body Content]
               ---
               "Should I send this email?"
            
            2. DO NOT include the action tag in the draft phase.
            
            3. Once the user says "Yes", "Send it", "Confirm", or similar, you MUST output a confirmation message followed IMMEDIATELY by this EXACT tag:
               [[SEND_EMAIL:{"to":"...", "subject":"...", "body":"..."}]]
            
            4. IMPORTANT: NEVER mention the "tag" or "secret code" to the user. Just say "Sending email..." and include the tag. The user should never see the tag.
            
            5. If you have already shown a draft and the user confirms, DO NOT draft it again. Just send the tag.
            
            GENERAL RULES:
            - Be professional and concise.
            - Use the context provided to answer questions.
            """, 
            user.getEmail(), 
            scheduleInfo.isEmpty() ? "No schedules uploaded yet." : scheduleInfo,
            taskInfo.isEmpty() ? "No pending tasks for today." : taskInfo
        );

        try {
            String url = "https://integrate.api.nvidia.com/v1/chat/completions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // Build full message list including history
            java.util.List<Map<String, String>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            
            // Add history (limiting to last 10 messages for efficiency)
            if (history != null) {
                history.stream()
                    .filter(m -> m.get("content") != null && m.get("role") != null)
                    .skip(Math.max(0, history.size() - 10))
                    .forEach(m -> {
                        messages.add(Map.of("role", m.get("role"), "content", m.get("content")));
                    });
            }
            
            // Add current user message
            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "meta/llama-3.1-8b-instruct");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.1);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
            
            return "I received an empty response from my brain.";
        } catch (Exception e) {
            logger.error("Chat error (Manual API Call): {}", e.getMessage(), e);
            return "I'm sorry, I'm having trouble connecting to my brain. Error: " + e.getMessage();
        }
    }
}
