package com.nexusmart.dto;

import java.util.List;

public record ProductResponseDto(

        Long id,
        String name,
        String description,
        Double price,
        int stockQuantity,
        List<String> images,
        MerchantResponseDto merchant,
        CategoryResponseDto category

) {
}
