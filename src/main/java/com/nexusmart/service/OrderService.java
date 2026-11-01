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

    // Place an order for a specific merchant independently from the cart
    public Order placeOrder(Long userId, Long merchantId, Order.FulfillmentType fulfillmentType,
            Order.PaymentType paymentType) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

        if (customer.getRole() == Role.ADMIN || customer.getRole() == Role.MERCHANT) {
            throw new RuntimeException("Access Denied: Admin and Merchant accounts cannot place customer orders.");
        }

        User merchant = userRepository.findById(merchantId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getShopName() != null
                                || "MERCHANT".equalsIgnoreCase(String.valueOf(u.getRole())))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Merchant store not found with ID: " + merchantId)));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        List<CartItem> merchantCartItems = cart.getItems().stream()
                .filter(item -> {
                    if (item.getProduct() == null)
                        return false;

                    User productMerchant = item.getProduct().getMerchant();
                    if (productMerchant != null) {
                        return productMerchant.getId().equals(merchant.getId())
                                || productMerchant.getId().equals(merchantId);
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (merchantCartItems.isEmpty()) {
            throw new RuntimeException("No items found in your cart for store: "
                    + (merchant.getShopName() != null ? merchant.getShopName() : merchant.getName()));
        }

        double totalPrice = 0.0;
        for (CartItem item : merchantCartItems) {
            Product product = item.getProduct();
            if (product != null) {
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: "
                            + product.getStockQuantity());
                }

                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);

                totalPrice += product.getPrice() * item.getQuantity();
            } else {
                totalPrice += 100.0 * item.getQuantity();
            }
        }

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

        cart.getItems().removeAll(merchantCartItems);
        cartRepository.save(cart);

        return savedOrder;
    }

    // 🚀 NEW: Direct Single-Item Purchase ("Order Now" without cart dependency)
    public Order placeDirectOrder(Long userId, Long merchantId, Long productId, int quantity,
            Order.FulfillmentType fulfillmentType, Order.PaymentType paymentType) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + userId));

        if (customer.getRole() == Role.ADMIN || customer.getRole() == Role.MERCHANT) {
            throw new RuntimeException("Access Denied: Admin and Merchant accounts cannot place customer orders.");
        }

        User merchant = userRepository.findById(merchantId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getShopName() != null
                                || "MERCHANT".equalsIgnoreCase(String.valueOf(u.getRole())))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Merchant store not found with ID: " + merchantId)));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: "
                    + product.getStockQuantity());
        }

        // Deduct stock quantity
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        double totalPrice = product.getPrice() * quantity;

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

        return orderRepository.save(order);
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

    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own orders.");
        }

        // Check valid status safely without using missing enum fields
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order after it has been delivered or already cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}