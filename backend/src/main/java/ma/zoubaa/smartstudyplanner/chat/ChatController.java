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
        
        // Try to detect email JSON in multiple formats the AI might use
        String emailJson = null;
        
        // Format 1: [[SEND_EMAIL:{...}]]
        if (aiResponse.contains("[[SEND_EMAIL:")) {
            int start = aiResponse.indexOf("[[SEND_EMAIL:");
            int end = aiResponse.indexOf("]]", start);
            if (end > start) {
                emailJson = aiResponse.substring(start + 13, end);
                processedResponse = (aiResponse.substring(0, start) + aiResponse.substring(end + 2)).trim();
            }
        }
        
        // Format 2: Bare JSON with "to" field (AI sometimes skips the tags)
        if (emailJson == null && aiResponse.contains("\"to\"") && aiResponse.contains("\"subject\"")) {
            // Find the JSON object in the response
            int jsonStart = aiResponse.indexOf('{');
            int jsonEnd = aiResponse.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                emailJson = aiResponse.substring(jsonStart, jsonEnd + 1);
                // Clean the response: keep text before the JSON
                processedResponse = aiResponse.substring(0, jsonStart).trim();
            }
        }
        
        // Process the email if we found JSON
        if (emailJson != null) {
            try {
                Map<String, String> emailData = objectMapper.readValue(emailJson, Map.class);
                String to = emailData.get("to");
                String subject = emailData.get("subject");
                String body = emailData.get("body");

                // SAFEGUARD: If AI used user's own email as recipient, correct it
                if (to != null && user.getEmail() != null && to.equalsIgnoreCase(user.getEmail()) && history != null) {
                    String correctedTo = extractRecipientFromHistory(history);
                    if (correctedTo != null) {
                        to = correctedTo;
                    }
                }
                
                if (to != null && subject != null && body != null) {
                    emailService.sendSimpleEmail(to, subject, body);
                    processedResponse = "✅ Email sent successfully to " + to;
                }
            } catch (Exception e) {
                processedResponse += "\n\n❌ Failed to send email: " + e.getMessage();
            }
        }
        
        return ResponseEntity.ok(Map.of("response", processedResponse));
    }

    /**
     * Scans conversation history for a draft containing "**To:**" and extracts the email.
     */
    private String extractRecipientFromHistory(List<Map<String, String>> history) {
        for (int i = history.size() - 1; i >= 0; i--) {
            Map<String, String> msg = history.get(i);
            String content = msg.get("content");
            if (content != null && content.contains("**To:**")) {
                // Extract email after "**To:**"
                int idx = content.indexOf("**To:**");
                String after = content.substring(idx + 7).trim();
                // Take the first word (the email)
                String[] parts = after.split("[\\s\\n]");
                if (parts.length > 0 && parts[0].contains("@")) {
                    return parts[0].trim();
                }
            }
        }
        return null;
    }
}
