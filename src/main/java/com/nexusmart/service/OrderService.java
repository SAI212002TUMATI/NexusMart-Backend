package com.nexusmart.service;

import com.nexusmart.entity.*;
import com.nexusmart.repository.CartRepository;
import com.nexusmart.repository.OrderRepository;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    // Overloaded method for backward compatibility
    public Order placeOrder(Long userId, Long merchantId) {
        return placeOrder(userId, merchantId, Order.FulfillmentType.HOME_DELIVERY, Order.PaymentType.COD);
    }

    // Place an order for a specific merchant independently
    public Order placeOrder(Long userId, Long merchantId, Order.FulfillmentType fulfillmentType, Order.PaymentType paymentType) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

        // Find merchant by target ID or fallback to store owner lookup
        User merchant = userRepository.findById(merchantId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getShopName() != null || "MERCHANT".equalsIgnoreCase(String.valueOf(u.getRole())))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Merchant store not found with ID: " + merchantId))
                );

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // Filter cart items that belong SPECIFICALLY to this merchant store
        List<CartItem> merchantCartItems = cart.getItems().stream()
                .filter(item -> {
                    if (item.getProduct() == null) return false;
                    
                    User productMerchant = item.getProduct().getMerchant();
                    if (productMerchant != null) {
                        return productMerchant.getId().equals(merchant.getId()) || productMerchant.getId().equals(merchantId);
                    }
                    return true; // Fallback for legacy single-merchant items
                })
                .collect(Collectors.toList());

        if (merchantCartItems.isEmpty()) {
            throw new RuntimeException("No items found in your cart for store: " + (merchant.getShopName() != null ? merchant.getShopName() : merchant.getName()));
        }

        // Calculate total price and verify/deduct stock for this merchant's products
        double totalPrice = 0.0;
        for (CartItem item : merchantCartItems) {
            Product product = item.getProduct();
            if (product != null) {
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getStockQuantity());
                }

                // Deduct stock quantity
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);

                totalPrice += product.getPrice() * item.getQuantity();
            } else {
                totalPrice += 100.0 * item.getQuantity();
            }
        }

        // Create independent order record
        Order order = new Order();
        order.setCustomer(customer);
        order.setMerchant(merchant);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PLACED);
        order.setFulfillmentType(fulfillmentType);
        order.setPaymentType(paymentType);

        if (paymentType == Order.PaymentType.ONLINE) {
            order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
        }

        Order savedOrder = orderRepository.save(order);

        // Safely remove ONLY this merchant's items from the user's cart
        cart.getItems().removeAll(merchantCartItems);
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByCustomerId(userId);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}