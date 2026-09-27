package com.nexusmart.service;

import com.nexusmart.entity.Order;
import com.nexusmart.entity.OrderStatus;
import com.nexusmart.entity.User;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MerchantOrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getOrdersByStatus(String merchantEmail, OrderStatus status) {
        User merchant = userRepository.findByEmail(merchantEmail)
                .orElseThrow(() -> new RuntimeException("Merchant not found"));
        return orderRepository.findByMerchantIdAndStatusOrderByOrderDateDesc(merchant.getId(), status);
    }

    public Order updateOrderStatus(String merchantEmail, Long orderId, OrderStatus newStatus) {
        User merchant = userRepository.findByEmail(merchantEmail)
                .orElseThrow(() -> new RuntimeException("Merchant not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getMerchant().getId().equals(merchant.getId())) {
            throw new SecurityException("Unauthorized: Order does not belong to this merchant.");
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}