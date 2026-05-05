package ma.zoubaa.smartstudyplanner.security;

import ma.zoubaa.smartstudyplanner.user.Role;
import ma.zoubaa.smartstudyplanner.user.User;
import ma.zoubaa.smartstudyplanner.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User(
                "admin@focusmind.ai",
                passwordEncoder.encode("admin123"),
                Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("Default admin account created: admin@focusmind.ai / admin123");
        }
    }
}
