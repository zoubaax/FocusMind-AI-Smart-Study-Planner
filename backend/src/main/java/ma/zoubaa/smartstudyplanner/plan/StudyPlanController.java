package ma.zoubaa.smartstudyplanner.plan;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class StudyPlanController {

    private final StudyPlanService service;

    public StudyPlanController(StudyPlanService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestBody GeneratePlanRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (request.getScheduleId() == null || request.getGoals() == null) {
            return ResponseEntity.badRequest().body("scheduleId and goals are required");
        }
        try {
            StudyPlan plan = service.generatePlan(request.getScheduleId(), request.getGoals(), user);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("AI generation failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<StudyPlan>> getMyPlans(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getUserPlans(user.getId()));
    }
}

class GeneratePlanRequest {
    private Long scheduleId;
    private String goals;

    public GeneratePlanRequest() {}

    public GeneratePlanRequest(Long scheduleId, String goals) {
        this.scheduleId = scheduleId;
        this.goals = goals;
    }

    // Getters and Setters
    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }
}
