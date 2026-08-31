package com.nexusmart.dto;

import java.util.List;

public record CartResponseDto(
        Long cartId,
        Long userId,
        String username,
        List<CartItemResponseDto> items) {
}