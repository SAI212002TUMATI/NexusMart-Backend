package com.nexusmart.controller;

import com.nexusmart.dto.UserRegistrationDto;
import com.nexusmart.dto.UserLoginDto;
import com.nexusmart.dto.AuthResponseDto;
import com.nexusmart.entity.User;
import com.nexusmart.security.JwtUtil;
import com.nexusmart.service.UserService;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            User registeredUser = userService.registerUser(registrationDto);
            return new ResponseEntity<>("User registered successfully with ID: " + registeredUser.getId(),
                    HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody UserLoginDto loginDto) {
        try {
            User user = userService.loginUser(loginDto);

            // GENERATE TOKEN FOR THE AUTHENTICATED USER
            String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            // Return structured response object carrying the passport token
            AuthResponseDto response = new AuthResponseDto(jwtToken, user.getEmail(), user.getName(),
                    user.getRole().name());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        try {
            userService.verifyAccount(email, otp);
            return ResponseEntity.ok("Account verified successfully! You can now login into the NexusMart.");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        try {
            // 👈 Delegating to userService cleanly fixes all userRepository and
            // emailService errors!
            userService.resendVerificationOtp(email);
            return ResponseEntity.ok("A fresh 6-digit verification code has been dispatched to your email!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}