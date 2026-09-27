package com.nexusmart.service;

import com.nexusmart.dto.CartItemResponseDto;
import com.nexusmart.dto.CartResponseDto;
import com.nexusmart.entity.*;
import com.nexusmart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository, ProductRepository productRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CartResponseDto addItemToCart(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getRole() == Role.MERCHANT) {
            throw new RuntimeException("Access Denied: Merchants do not hold buying carts.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock! Available: " + product.getStockQuantity());
        }

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });

        // 🛑 SINGLE-STORE CART VALIDATION ENFORCEMENT
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            Long existingMerchantId = cart.getItems().get(0).getProduct().getMerchant().getId();
            Long incomingMerchantId = product.getMerchant().getId();

            if (!existingMerchantId.equals(incomingMerchantId)) {
                throw new IllegalStateException("Cannot mix items from different stores in one order. Clear cart first.");
            }
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;

            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Cannot add more. Insufficient stock!");
            }
            item.setQuantity(newQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return convertToDto(savedCart);
    }

    @Override
    public CartResponseDto getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active cart found for user id: " + userId));
        return convertToDto(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active cart found for user id: " + userId));
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    public CartResponseDto updateItemQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active cart found for user id: " + userId));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart with id: " + productId));

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
        } else {
            if (cartItem.getProduct().getStockQuantity() < quantity) {
                throw new RuntimeException(
                        "Insufficient stock! Available: " + cartItem.getProduct().getStockQuantity());
            }
            cartItem.setQuantity(quantity);
        }

        Cart savedCart = cartRepository.save(cart);
        return convertToDto(savedCart);
    }

    @Override
    public CartResponseDto removeItemFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active cart found for user id: " + userId));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart with id: " + productId));

        cart.getItems().remove(cartItem);

        Cart savedCart = cartRepository.save(cart);
        return convertToDto(savedCart);
    }

    private CartResponseDto convertToDto(Cart cart) {
        List<CartItemResponseDto> itemDtos = cart.getItems().stream()
                .map(item -> {
                    String imageUrl = (item.getProduct().getImages() != null
                            && !item.getProduct().getImages().isEmpty())
                                    ? item.getProduct().getImages().get(0).getImageUrl()
                                    : null;

                    return new CartItemResponseDto(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getPrice(),
                            item.getQuantity(),
                            imageUrl,
                            item.getProduct().getMerchant().getName());
                })
                .toList();

        return new CartResponseDto(
                cart.getId(),
                cart.getUser().getId(),
                cart.getUser().getName(),
                itemDtos);
    }
}