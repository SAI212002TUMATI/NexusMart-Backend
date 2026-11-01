package com.nexusmart.service;

import com.nexusmart.dto.AdminMetricsResponse;
import com.nexusmart.entity.Order;
import com.nexusmart.entity.User;
import com.nexusmart.entity.Role;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public User updateMerchantStatus(Long userId, boolean isVerified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(isVerified);
        return userRepository.save(user);
    }

    public AdminMetricsResponse getAdminMetrics() {
        List<User> users = userRepository.findAll();

        // Safely check role strings to prevent enum/string mismatch
        long totalUsers = users.stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase("CUSTOMER"))
                .count();

        long totalMerchants = users.stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase("MERCHANT"))
                .count();

        long totalOrders = orderRepository.count();

        return new AdminMetricsResponse(totalUsers, totalMerchants, totalOrders);
    }
}