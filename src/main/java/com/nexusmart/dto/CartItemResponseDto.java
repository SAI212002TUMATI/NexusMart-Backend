package com.nexusmart.dto;

public record CartItemResponseDto(
        Long itemId,
        Long productId,
        String productName,
        Double price,
        Integer quantity,
        String imageUrl,
        String merchantName) {
}