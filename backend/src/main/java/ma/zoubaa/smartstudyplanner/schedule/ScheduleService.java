package ma.zoubaa.smartstudyplanner.schedule;

import ma.zoubaa.smartstudyplanner.user.User;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleService.class);
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

        // Extract text from PDF at upload time so we never need to re-download from Cloudinary
        if (isPdf(file, fileType)) {
            try {
                byte[] fileBytes = file.getBytes();
                PDDocument document = Loader.loadPDF(fileBytes);
                PDFTextStripper stripper = new PDFTextStripper();
                String extractedText = stripper.getText(document);
                document.close();
                schedule.setExtractedText(extractedText);
                logger.info("Extracted {} characters from PDF at upload time", extractedText.length());
            } catch (Exception e) {
                logger.warn("Could not extract text from PDF at upload time: {}", e.getMessage());
                // Non-fatal: we still save the schedule, plan generation will handle the missing text
            }
        }

        return repository.save(schedule);
    }

    private boolean isPdf(MultipartFile file, String fileType) {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        return (contentType != null && contentType.contains("pdf"))
            || (fileType != null && fileType.contains("pdf"))
            || (fileName != null && fileName.toLowerCase().endsWith(".pdf"));
    }

    public List<Schedule> getUserSchedules(Long userId) {
        return repository.findAllByUserId(userId);
    }

    public void deleteSchedule(Long scheduleId, Long userId) {
        Schedule schedule = repository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if (!schedule.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this schedule");
        }

        // Delete the file from Cloudinary
        if (schedule.getPublicId() != null) {
            try {
                cloudinaryService.delete(schedule.getPublicId());
                logger.info("Deleted file from Cloudinary: {}", schedule.getPublicId());
            } catch (Exception e) {
                logger.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
                // Non-fatal: still delete from DB
            }
        }

        repository.delete(schedule);
        logger.info("Deleted schedule {} for user {}", scheduleId, userId);
    }
}
