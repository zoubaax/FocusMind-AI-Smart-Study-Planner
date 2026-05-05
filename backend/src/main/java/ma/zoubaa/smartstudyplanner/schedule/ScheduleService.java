package ma.zoubaa.smartstudyplanner.schedule;

import ma.zoubaa.smartstudyplanner.user.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ScheduleService {

    private final ScheduleRepository repository;
    private final CloudinaryService cloudinaryService;

    public ScheduleService(ScheduleRepository repository, CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.cloudinaryService = cloudinaryService;
    }

    public Schedule uploadSchedule(MultipartFile file, User user) throws IOException {
        Map uploadResult = cloudinaryService.upload(file);
        
        String fileUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");
        String fileType = (String) uploadResult.get("format");

        Schedule schedule = new Schedule(
            file.getOriginalFilename(),
            fileUrl,
            publicId,
            fileType,
            user
        );

        return repository.save(schedule);
    }

    public List<Schedule> getUserSchedules(Long userId) {
        return repository.findAllByUserId(userId);
    }
}
