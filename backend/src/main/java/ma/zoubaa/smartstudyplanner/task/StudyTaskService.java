package ma.zoubaa.smartstudyplanner.task;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.zoubaa.smartstudyplanner.plan.StudyPlan;
import ma.zoubaa.smartstudyplanner.plan.StudyPlanRepository;
import ma.zoubaa.smartstudyplanner.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudyTaskService {

    private static final Logger logger = LoggerFactory.getLogger(StudyTaskService.class);
    private final StudyTaskRepository repository;
    private final StudyPlanRepository planRepository;
    private final ObjectMapper objectMapper;

    public StudyTaskService(StudyTaskRepository repository, StudyPlanRepository planRepository) {
        this.repository = repository;
        this.planRepository = planRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public List<StudyTask> createTasksFromPlan(Long planId, User user) {
        StudyPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        List<StudyTask> createdTasks = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(plan.getContent());
            JsonNode weeklyPlan = root.path("weeklyPlan");

            // We'll map the plan to the current/upcoming week
            LocalDate today = LocalDate.now();
            
            for (JsonNode dayNode : weeklyPlan) {
                String dayName = dayNode.path("day").asText();
                DayOfWeek dayOfWeek = parseDayOfWeek(dayName);
                if (dayOfWeek == null) continue;

                LocalDate taskDate = today.with(TemporalAdjusters.nextOrSame(dayOfWeek));
                JsonNode sessions = dayNode.path("sessions");

                for (JsonNode session : sessions) {
                    String timeRange = session.path("time").asText();
                    String subject = session.path("subject").asText();
                    String topic = session.path("topic").asText();

                    LocalDateTime[] times = parseTimeRange(taskDate, timeRange);
                    
                    StudyTask task = new StudyTask(
                        subject + ": " + topic,
                        subject,
                        topic,
                        times[0],
                        times[1],
                        user,
                        plan
                    );
                    createdTasks.add(repository.save(task));
                }
            }
            
            logger.info("Successfully created {} tasks from plan {}", createdTasks.size(), planId);
            return createdTasks;

        } catch (Exception e) {
            logger.error("Failed to parse plan JSON for task creation: {}", e.getMessage());
            throw new RuntimeException("Failed to activate plan: " + e.getMessage());
        }
    }

    public List<StudyTask> getUserTasks(Long userId) {
        return repository.findByUser_Id(userId);
    }

    @Transactional
    public StudyTask toggleTaskCompletion(Long taskId) {
        StudyTask task = repository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setCompleted(!task.isCompleted());
        return repository.save(task);
    }

    private DayOfWeek parseDayOfWeek(String day) {
        try {
            return DayOfWeek.valueOf(day.toUpperCase());
        } catch (Exception e) {
            // Handle some common variations
            if (day.equalsIgnoreCase("Lundi")) return DayOfWeek.MONDAY;
            if (day.equalsIgnoreCase("Mardi")) return DayOfWeek.TUESDAY;
            if (day.equalsIgnoreCase("Mercredi")) return DayOfWeek.WEDNESDAY;
            if (day.equalsIgnoreCase("Jeudi")) return DayOfWeek.THURSDAY;
            if (day.equalsIgnoreCase("Vendredi")) return DayOfWeek.FRIDAY;
            if (day.equalsIgnoreCase("Samedi")) return DayOfWeek.SATURDAY;
            if (day.equalsIgnoreCase("Dimanche")) return DayOfWeek.SUNDAY;
            return null;
        }
    }

    private LocalDateTime[] parseTimeRange(LocalDate date, String range) {
        try {
            // Expected format "HH:mm - HH:mm" or "8:30 AM - 10:00 AM"
            String[] parts = range.split("-");
            LocalTime start = parseTime(parts[0].trim());
            LocalTime end = parseTime(parts[1].trim());
            return new LocalDateTime[]{
                LocalDateTime.of(date, start),
                LocalDateTime.of(date, end)
            };
        } catch (Exception e) {
            // Fallback to defaults if parsing fails
            return new LocalDateTime[]{
                LocalDateTime.of(date, LocalTime.of(9, 0)),
                LocalDateTime.of(date, LocalTime.of(10, 0))
            };
        }
    }

    private LocalTime parseTime(String timeStr) {
        timeStr = timeStr.toUpperCase();
        try {
            if (timeStr.contains("AM") || timeStr.contains("PM")) {
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("h:mm a"));
            } else {
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
            }
        } catch (Exception e) {
            // Try h:mm format (e.g. 8:30)
            try { return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("H:mm")); }
            catch (Exception e2) { return LocalTime.of(9, 0); }
        }
    }
}
