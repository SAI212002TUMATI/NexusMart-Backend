package com.nexusmart.service;

import com.nexusmart.dto.UserRegistrationDto;
import com.nexusmart.dto.UserLoginDto;
import com.nexusmart.dto.MerchantRegisterRequest;
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

    // 🔐 Register standard user with automatic BCrypt password hashing, 3-Role
    // Guardrails, & Email OTP
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

    // 🏪 Register Merchant / Kirana Store Owner with shop details, phone
    // validation, and OTP
    public User registerMerchant(MerchantRegisterRequest dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }

        if (dto.getPhone() != null && userRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Phone number is already registered!");
        }

        User merchant = new User();
        merchant.setName(dto.getName());
        merchant.setEmail(dto.getEmail());
        merchant.setPassword(passwordEncoder.encode(dto.getPassword()));
        merchant.setPhone(dto.getPhone());

        // Assign ROLE_MERCHANT
        merchant.setRole(Role.MERCHANT);

        // Store specific merchant/kirana shop details and coordinates
        merchant.setShopName(dto.getShopName());
        merchant.setShopAddress(dto.getShopAddress());
        merchant.setPincode(dto.getPincode());
        merchant.setLatitude(dto.getLatitude());
        merchant.setLongitude(dto.getLongitude());

        // OTP Verification setup
        merchant.setVerified(false);
        String generatedOtp = String.format("%06d", new Random().nextInt(1000000));
        merchant.setOtp(generatedOtp);
        merchant.setOtpExpiry(LocalDateTime.now().plusMinutes(15));

        User savedMerchant = userRepository.save(merchant);
        sendOtpEmail(savedMerchant.getEmail(), generatedOtp);

        return savedMerchant;
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: Email address not found."));

        if (user.isVerified()) {
            throw new RuntimeException("Error: This account is already fully verified. Please log in.");
        }

        String newOtp = String.format("%06d", new Random().nextInt(1000000));

        user.setOtp(newOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        sendOtpEmail(user.getEmail(), newOtp);
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate a 6-digit reset code
        String resetCode = String.format("%06d", new java.util.Random().nextInt(999999));

        user.setResetToken(resetCode);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15)); // Valid for 15 mins
        userRepository.save(user);

        // Send email
         SimpleMailMessage message = new SimpleMailMessage();
         message.setTo(email);
         message.setSubject("NexusMart - Password Reset Code");
         message.setText("Your password reset code is: " + resetCode + "\nIt will
         expire in 15 minutes.");
         mailSender.send(message);
    }

    public void resetPassword(String email, String token, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getResetToken() == null || !user.getResetToken().equals(token)) {
            throw new RuntimeException("Invalid reset token.");
        }

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired.");
        }

        // Update password and clear the reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}