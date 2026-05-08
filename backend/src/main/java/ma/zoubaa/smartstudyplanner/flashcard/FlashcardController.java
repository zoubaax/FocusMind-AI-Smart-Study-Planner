package ma.zoubaa.smartstudyplanner.flashcard;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/upload")
    public ResponseEntity<CourseMaterial> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(flashcardService.uploadMaterial(file, user));
    }

    @PostMapping("/generate/{id}")
    public ResponseEntity<List<Flashcard>> generateFlashcards(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.generateFlashcards(id));
    }

    @GetMapping("/materials")
    public ResponseEntity<List<CourseMaterial>> getUserMaterials(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(flashcardService.getUserMaterials(user.getId()));
    }

    @GetMapping("/material/{id}")
    public ResponseEntity<List<Flashcard>> getFlashcards(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.getFlashcards(id));
    }
}
