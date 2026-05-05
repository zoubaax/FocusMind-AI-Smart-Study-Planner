package ma.zoubaa.smartstudyplanner.auth.dto;

import ma.zoubaa.smartstudyplanner.user.Role;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    Role role,
    LocalDateTime createdAt
) {}
