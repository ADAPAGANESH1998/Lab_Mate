package com.app.labmate.service;

import com.app.labmate.model.Institution;
import com.app.labmate.model.User;
import com.app.labmate.repo.InstitutionRepo;
import com.app.labmate.repo.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private  InstitutionRepo institutionRepo;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        // Check if the email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // Check if passwords match
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Check if emails match
        if (!user.getEmail().equals(user.getConfirmEmail())) {
            throw new RuntimeException("Emails do not match");
        }

        // Encrypt the password before saving
        user.setPassword(user.getPassword());

        return userRepository.save(user);
    }

        public boolean authenticate(String email, String password) {
            // Find the user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Institution institution  = institutionRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Compare the provided password with the stored password (plain text comparison)
            return password.equals(user.getPassword()) || password.equals(institution.getPassword());
        }
}
