package ma.zoubaa.smartstudyplanner.flashcard;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_material_id")
    private CourseMaterial courseMaterial;
    
    private boolean mastered = false;

    public Flashcard() {}

    public Flashcard(String question, String answer, CourseMaterial courseMaterial) {
        this.question = question;
        this.answer = answer;
        this.courseMaterial = courseMaterial;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public CourseMaterial getCourseMaterial() { return courseMaterial; }
    public void setCourseMaterial(CourseMaterial courseMaterial) { this.courseMaterial = courseMaterial; }

    public boolean isMastered() { return mastered; }
    public void setMastered(boolean mastered) { this.mastered = mastered; }
}
