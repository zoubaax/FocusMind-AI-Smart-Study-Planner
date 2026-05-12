package ma.zoubaa.smartstudyplanner.auth.dto;

public record AuthenticationResponse(
    String token,
    UserResponse user
) {}
