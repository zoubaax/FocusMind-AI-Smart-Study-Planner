package ma.zoubaa.smartstudyplanner.task;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class StudyTaskController {

    private final StudyTaskService service;

    public StudyTaskController(StudyTaskService service) {
        this.service = service;
    }

    @PostMapping("/activate-plan/{planId}")
    public ResponseEntity<List<StudyTask>> activatePlan(
            @PathVariable Long planId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(service.createTasksFromPlan(planId, user));
    }

    @GetMapping
    public ResponseEntity<List<StudyTask>> getMyTasks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getUserTasks(user.getId()));
    }

    @PostMapping
    public ResponseEntity<StudyTask> createTask(
            @RequestBody StudyTask task,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(service.createManualTask(task, user));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        service.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllTasks(@AuthenticationPrincipal User user) {
        service.deleteAllUserTasks(user.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<StudyTask> toggleTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.toggleTaskCompletion(taskId));
    }
}
