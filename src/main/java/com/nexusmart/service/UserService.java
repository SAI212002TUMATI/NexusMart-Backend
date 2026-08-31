package com.nexusmart.service;

import com.nexusmart.dto.UserRegistrationDto;
import com.nexusmart.dto.UserLoginDto;
import com.nexusmart.entity.Role;
import com.nexusmart.entity.User;
import com.nexusmart.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    // 🔐 Register user with automatic BCrypt password hashing, 3-Role Guardrails, &
    // Email OTP
    public User registerUser(UserRegistrationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        // 🛑 STRICT 3-ROLE SECURITY GUARDRAIL:
        if (dto.getRole() == Role.ADMIN) {
            throw new RuntimeException(
                    "Access Denied: Cannot register public accounts with administrative privileges.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());

        // Scramble the raw password before it ever touches MySQL
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        // 🌟 NEW OTP FIELDS FOR VERIFICATION
        user.setVerified(false); // New users start as false (Pending)

        String generatedOtp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(generatedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15)); // Valid for 15 mins

        // Save user into MySQL with their verification attributes
        User savedUser = userRepository.save(user);

        // 🌟 Send the physical email out using Gmail SMTP
        sendOtpEmail(savedUser.getEmail(), generatedOtp);

        return savedUser;
    }

    // 🔑 Verify user credentials during login
    public User loginUser(UserLoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        // 🛑 SECURITY GUARDRAIL: Block unverified users from logging in
        if (!user.isVerified()) {
            throw new RuntimeException(
                    "Access Denied: Please verify your account using the OTP sent to your email first.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        return user;
    }

    // 📧 Helper method to handle email delivery
    private void sendOtpEmail(String targetEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(targetEmail);
        message.setSubject("NexusMart - Verify Your Account Registration");
        message.setText("Welcome to NexusMart!\n\n" +
                "Your registration request was received. Please use the following 6-digit One-Time Password (OTP) to activate your account:\n\n"
                +
                "👉 " + otp + "\n\n" +
                "This OTP code is highly sensitive and will expire in 15 minutes. If you did not make this request, please ignore this email.");

        mailSender.send(message);
    }

    public boolean verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account verification failed: Email not found."));

        if (user.isVerified()) {
            throw new RuntimeException("Account is Already verified and active!");
        }

        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Verification failed: Invalid OTP code provided");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification failed: This OTP has Expired, Please request a new one.");
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return true;
    }

    public void resendVerificationOtp(String email) {
        // 1. Fetch user through the repository
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: Email address not found."));

        // 2. Safety Check
        if (user.isVerified()) {
            throw new RuntimeException("Error: This account is already fully verified. Please log in.");
        }

        // 3. Generate a brand-new random 6-digit code
        String newOtp = String.format("%06d", new Random().nextInt(1000000));

        // 4. Update the user record
        user.setOtp(newOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // 5. Fire it off using your internal helper method 👈 FIXED HERE
        sendOtpEmail(user.getEmail(), newOtp);
    }
}