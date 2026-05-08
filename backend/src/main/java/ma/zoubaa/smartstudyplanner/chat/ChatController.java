package ma.zoubaa.smartstudyplanner.chat;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final ma.zoubaa.smartstudyplanner.mail.EmailService emailService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public ChatController(ChatService chatService, 
                          ma.zoubaa.smartstudyplanner.mail.EmailService emailService,
                          com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user
    ) {
        String message = (String) request.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");
        
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String aiResponse = chatService.chat(message, history, user);
        String processedResponse = aiResponse;
        
        // Detect and handle the [[SEND_EMAIL:{...}]] tag
        if (aiResponse.contains("[[SEND_EMAIL:")) {
            int start = aiResponse.indexOf("[[SEND_EMAIL:");
            int end = aiResponse.indexOf("]]", start);
            
            if (end > start) {
                // Extract the JSON data
                String jsonPart = aiResponse.substring(start + 13, end);
                // CLEAN the response immediately so the user never sees the tag
                processedResponse = (aiResponse.substring(0, start) + aiResponse.substring(end + 2)).trim();
                
                try {
                    Map<String, String> emailData = objectMapper.readValue(jsonPart, Map.class);
                    String to = emailData.get("to");
                    String subject = emailData.get("subject");
                    String body = emailData.get("body");
                    
                    if (to != null && subject != null && body != null) {
                        emailService.sendSimpleEmail(to, subject, body);
                        processedResponse += "\n\n✅ **System Note**: Email sent successfully to " + to;
                    }
                } catch (Exception e) {
                    processedResponse += "\n\n❌ **System Note**: Failed to send email: " + e.getMessage();
                }
            }
        }
        
        return ResponseEntity.ok(Map.of("response", processedResponse));
    }
}
