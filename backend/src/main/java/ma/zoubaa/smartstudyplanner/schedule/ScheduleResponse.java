package ma.zoubaa.smartstudyplanner.schedule;

import java.time.LocalDateTime;

public record ScheduleResponse(
    Long id,
    String fileName,
    String fileUrl,
    String fileType,
    LocalDateTime createdAt
) {}
