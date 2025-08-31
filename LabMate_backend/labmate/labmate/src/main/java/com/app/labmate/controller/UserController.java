package com.app.labmate.controller;

import com.app.labmate.model.LoginRequest;
import com.app.labmate.model.User;
import com.app.labmate.service.UserService;
import com.app.labmate.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Optional;

/**
 *
 * @author Ganesh Adapa
 * @version 1.0
 * @since 19.12.2016
 *
 *
 * The Class Main.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     *
     * @param user
     * @return User
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User registerUser(@Valid @RequestBody User user) {
        return userService.registerUser(user);
    }

    /**
     *
     * @param loginRequest
     * @return ResponseEntity<String>
     */
    @PostMapping("/login")
    public ResponseEntity<String> authenticateUser(@RequestBody LoginRequest loginRequest) {
        boolean isAuthenticated = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (isAuthenticated) {
            // Generate JWT token
            String jwtToken = jwtUtil.generateToken(loginRequest.getEmail());
            return ResponseEntity.ok(jwtToken);  // Return the token in the response
        } else {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    /**
     *
     * @param authHeader
     * @return ResponseEntity<String>
     */

    @GetMapping("/message")
    public ResponseEntity<String> getMessage(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Extract token part (after "Bearer ")

            try {
                // Validate the token and extract the username (email)
                String email = jwtUtil.extractUsername(token);

                // If the token is valid, you can return the desired message
                if (email != null) {
                    return ResponseEntity.ok("Hello, " + email + ". This is your message.");
                } else {
                    return ResponseEntity.status(401).body("Unauthorized: Invalid token.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(401).body("Unauthorized: " + e.getMessage());
            }
        } else {
            return ResponseEntity.status(401).body("Unauthorized: Missing or invalid token.");
        }
    }

//    @GetMapping("/researcher/{id}")
//    public Optional<User> getResearcher(@PathVariable("id") Long id) {
//        return userService.getResearcher(id);
//    }

    @GetMapping("/getByEmail/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable("email") String email) {
        return userService.getUserByEmail(email);
    }



}

