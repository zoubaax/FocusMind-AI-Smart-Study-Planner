package ma.zoubaa.smartstudyplanner.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiException(
    String message,
    int status,
    LocalDateTime timestamp,
    Map<String, String> errors
) {
    public ApiException(String message, int status, LocalDateTime timestamp) {
        this(message, status, timestamp, null);
    }
}
