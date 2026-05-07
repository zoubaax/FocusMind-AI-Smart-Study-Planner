package ma.zoubaa.smartstudyplanner.chat;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user
    ) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String response = chatService.chat(message, user);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
