package ma.zoubaa.smartstudyplanner.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {
    List<StudyTask> findByUser_Id(Long userId);
    List<StudyTask> findByUser_IdAndStartTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
    List<StudyTask> findByStudyPlan_Id(Long planId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByUser_Id(Long userId);
}
