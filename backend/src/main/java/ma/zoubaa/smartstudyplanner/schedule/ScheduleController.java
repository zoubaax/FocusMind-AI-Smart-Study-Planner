package ma.zoubaa.smartstudyplanner.schedule;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ScheduleController.class);
    private final ScheduleService service;

    public ScheduleController(ScheduleService service) {
        this.service = service;
    }

    @PostMapping("/upload")
    public ResponseEntity<ScheduleResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) throws IOException {
        logger.info("Upload request received for user: {}", user.getId());
        Schedule schedule = service.uploadSchedule(file, user);
        return ResponseEntity.ok(new ScheduleResponse(
            schedule.getId(),
            schedule.getFileName(),
            schedule.getFileUrl(),
            schedule.getFileType(),
            schedule.getCreatedAt()
        ));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getAll(@AuthenticationPrincipal User user) {
        logger.info("Get all schedules request for user: {}", user.getId());
        List<Schedule> schedules = service.getUserSchedules(user.getId());
        return ResponseEntity.ok(schedules.stream()
            .map(s -> new ScheduleResponse(
                s.getId(),
                s.getFileName(),
                s.getFileUrl(),
                s.getFileType(),
                s.getCreatedAt()
            ))
            .collect(Collectors.toList()));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal User user
    ) {
        logger.info("Delete request for schedule {} from user {}", scheduleId, user.getId());
        service.deleteSchedule(scheduleId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
