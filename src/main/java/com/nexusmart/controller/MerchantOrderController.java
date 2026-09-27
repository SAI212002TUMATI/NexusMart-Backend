package com.nexusmart.controller;

import com.nexusmart.entity.Order;
import com.nexusmart.entity.OrderStatus;
import com.nexusmart.service.MerchantOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/merchant")
@PreAuthorize("hasRole('MERCHANT')")
public class MerchantOrderController {
    @Autowired
    private MerchantOrderService merchantOrderService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(required = false) OrderStatus status, 
            Principal principal) {
        OrderStatus queryStatus = status != null ? status : OrderStatus.PLACED;
        return ResponseEntity.ok(merchantOrderService.getOrdersByStatus(principal.getName(), queryStatus));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long orderId, 
            @RequestParam OrderStatus status, 
            Principal principal) {
        return ResponseEntity.ok(merchantOrderService.updateOrderStatus(principal.getName(), orderId, status));
    }
}