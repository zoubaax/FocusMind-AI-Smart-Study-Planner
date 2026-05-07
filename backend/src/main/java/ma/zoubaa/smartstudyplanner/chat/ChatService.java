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

    public String chat(String userMessage, User user) {
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
            
            Instructions:
            1. Be encouraging, professional, and concise.
            2. Use the provided context to answer questions about their schedule or tasks.
            3. Suggest study techniques like Pomodoro if they seem overwhelmed.
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

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "meta/llama-3.1-8b-instruct");
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ));
            requestBody.put("temperature", 0.5);

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
