package ma.zoubaa.smartstudyplanner.task;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import ma.zoubaa.smartstudyplanner.user.User;
import ma.zoubaa.smartstudyplanner.plan.StudyPlan;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_tasks")
public class StudyTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subject;
    private String topic;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    @JsonIgnore
    private StudyPlan studyPlan;

    @JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @JsonProperty("planId")
    public Long getPlanId() {
        return studyPlan != null ? studyPlan.getId() : null;
    }

    private LocalDateTime createdAt;

    public StudyTask() {}

    public StudyTask(String title, String subject, String topic, LocalDateTime startTime, LocalDateTime endTime, User user, StudyPlan studyPlan) {
        this.title = title;
        this.subject = subject;
        this.topic = topic;
        this.startTime = startTime;
        this.endTime = endTime;
        this.user = user;
        this.studyPlan = studyPlan;
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

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public StudyPlan getStudyPlan() { return studyPlan; }
    public void setStudyPlan(StudyPlan studyPlan) { this.studyPlan = studyPlan; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
