package ma.zoubaa.smartstudyplanner.plan;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByUser_Id(Long userId);
    List<StudyPlan> findBySchedule_Id(Long scheduleId);
}
