package ma.zoubaa.smartstudyplanner.plan;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import ma.zoubaa.smartstudyplanner.schedule.Schedule;
import ma.zoubaa.smartstudyplanner.user.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_plans")
public class StudyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content; // JSON structured study plan

    private String goals; // User defined goals for this plan

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private LocalDateTime createdAt;

    public StudyPlan() {}

    public StudyPlan(String title, String content, String goals, Schedule schedule, User user) {
        this.title = title;
        this.content = content;
        this.goals = goals;
        this.schedule = schedule;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }

    @JsonIgnore
    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }

    @JsonProperty("scheduleId")
    public Long getScheduleId() { return schedule != null ? schedule.getId() : null; }

    @JsonIgnore
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @JsonProperty("userId")
    public Long getUserId() { return user != null ? user.getId() : null; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
