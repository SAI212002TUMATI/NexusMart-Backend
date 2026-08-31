package com.nexusmart.service;

import com.nexusmart.dto.CartResponseDto;

public interface CartService {

    CartResponseDto addItemToCart(Long userId, Long productId, Integer quantity);

    CartResponseDto getCartByUserId(Long userId);

    void clearCart(Long userId);

    CartResponseDto updateItemQuantity(Long userId, Long productId, Integer Quantity);

    CartResponseDto removeItemFromCart(Long userId, Long productId);

}
