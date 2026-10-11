package com.nexusmart.service;

import com.nexusmart.entity.*;
import com.nexusmart.repository.CartRepository;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    // Place an order for a specific merchant from the user's mixed cart
    public Order placeOrder(Long userId, Long merchantId) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User merchant = userRepository.findById(merchantId)
                .orElseThrow(() -> new RuntimeException("Merchant not found"));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // Filter cart items that belong *only* to this specific merchant
        List<CartItem> merchantCartItems = cart.getItems().stream()
                .filter(item -> item.getProduct().getMerchant() != null && 
                                item.getProduct().getMerchant().getId().equals(merchantId))
                .collect(Collectors.toList());

        if (merchantCartItems.isEmpty()) {
            throw new RuntimeException("No items found in cart for this merchant");
        }

        // Calculate total price and verify/deduct stock for this merchant's items
        double totalPrice = 0.0;
        for (CartItem item : merchantCartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            totalPrice += product.getPrice() * item.getQuantity();
        }

        // Create order linked to customer and this specific merchant
        Order order = new Order();
        order.setCustomer(customer);
        order.setMerchant(merchant);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PLACED);

        Order savedOrder = orderRepository.save(order);

        // Remove *only* this merchant's checked-out items from the active cart, leaving other stores' items intact
        cart.getItems().removeAll(merchantCartItems);
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