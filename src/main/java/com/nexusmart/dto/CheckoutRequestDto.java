package com.nexusmart.dto;

import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequestDto {
    private Long merchantId;
    private List<CartItemDto> items;

    @Data
    public static class CartItemDto {
        private Long productId;
        private Integer quantity;
    }
}