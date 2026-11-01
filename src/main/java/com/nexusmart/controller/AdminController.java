package com.nexusmart.controller;

import com.nexusmart.dto.AdminMetricsResponse;
import com.nexusmart.entity.Order;
import com.nexusmart.entity.User;
import com.nexusmart.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getAdminMetrics() {
        return ResponseEntity.ok(adminService.getAdminMetrics());
    }

    @PatchMapping("/merchants/{id}/verify")
    public ResponseEntity<User> updateMerchantStatus(@PathVariable Long id, @RequestParam boolean verified) {
        return ResponseEntity.ok(adminService.updateMerchantStatus(id, verified));
    }
}