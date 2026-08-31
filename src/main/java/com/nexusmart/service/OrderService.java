package com.nexusmart.service;

import com.nexusmart.entity.Cart;
import com.nexusmart.entity.Order;
import com.nexusmart.entity.OrderStatus;
import com.nexusmart.entity.User;
import com.nexusmart.repository.CartRepository;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    // Place an order from the user's cart
    public Order placeOrder(Long userId) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // Calculate total price
        double totalPrice = cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        // Create order
        Order order = new Order();
        order.setCustomer(customer);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        // Clear the cart after order is placed
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByCustomerId(userId);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}