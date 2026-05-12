package ma.zoubaa.smartstudyplanner.plan;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByUser_Id(Long userId);
    List<StudyPlan> findBySchedule_Id(Long scheduleId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteAllBySchedule_Id(Long scheduleId);
}
