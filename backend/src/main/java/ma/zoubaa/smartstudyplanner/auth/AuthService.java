package ma.zoubaa.smartstudyplanner.auth;

import ma.zoubaa.smartstudyplanner.auth.dto.AuthenticationResponse;
import ma.zoubaa.smartstudyplanner.auth.dto.LoginRequest;
import ma.zoubaa.smartstudyplanner.auth.dto.RegisterRequest;
import ma.zoubaa.smartstudyplanner.security.JwtService;
import ma.zoubaa.smartstudyplanner.user.Role;
import ma.zoubaa.smartstudyplanner.user.User;
import ma.zoubaa.smartstudyplanner.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(
            request.email(),
            passwordEncoder.encode(request.password()),
            Role.USER
        );
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        repository.save(user);
        String jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = repository.findByEmail(request.email())
                .orElseThrow();
        String jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken);
    }
}
