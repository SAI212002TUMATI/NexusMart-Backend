package com.nexusmart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/protected") // Clean prefix completely separate from public /api/auth
public class ProtectedController {

    @GetMapping("/test") // Matches exactly: /api/protected/test
    public ResponseEntity<String> testSecureEndpoint() {
        return ResponseEntity.ok("Passport verified! You have successfully accessed a locked route.");
    }
}