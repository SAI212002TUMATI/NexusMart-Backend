package com.nexusmart.service;

import com.nexusmart.entity.*;
import com.nexusmart.repository.CartRepository;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, 
                        UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // Place an order from the user's cart mapped to the specific store merchant
    public Order placeOrder(Long userId) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // Identify the fulfilling merchant from the first cart item (guaranteed single-store)
        User merchant = cart.getItems().get(0).getProduct().getMerchant();

        // Calculate total price and verify/deduct stock
        double totalPrice = 0.0;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            totalPrice += product.getPrice() * item.getQuantity();
        }

        // Create order linked to customer and merchant
        Order order = new Order();
        order.setCustomer(customer);
        order.setMerchant(merchant);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PLACED);

        Order savedOrder = orderRepository.save(order);

        // Clear the cart after order is successfully placed
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