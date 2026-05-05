package ma.zoubaa.smartstudyplanner.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiException {
    private String message;
    private int status;
    private LocalDateTime timestamp;
    private Map<String, String> errors;
}
