package ma.zoubaa.smartstudyplanner.flashcard;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import ma.zoubaa.smartstudyplanner.user.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_materials")
public class CourseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String cloudinaryUrl;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    public CourseMaterial() {}

    public CourseMaterial(String title, String cloudinaryUrl, String extractedText, User user) {
        this.title = title;
        this.cloudinaryUrl = cloudinaryUrl;
        this.extractedText = extractedText;
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

    public String getCloudinaryUrl() { return cloudinaryUrl; }
    public void setCloudinaryUrl(String cloudinaryUrl) { this.cloudinaryUrl = cloudinaryUrl; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
