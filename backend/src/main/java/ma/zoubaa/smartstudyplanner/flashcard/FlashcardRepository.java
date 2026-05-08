package ma.zoubaa.smartstudyplanner.flashcard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findAllByCourseMaterialId(Long materialId);
    void deleteAllByCourseMaterialId(Long materialId);
}
