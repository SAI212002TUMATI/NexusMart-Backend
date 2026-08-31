package com.nexusmart.dto;

import java.time.LocalDateTime;

public record ReviewResponseDto(
        Long id,
        Integer rating,
        String comment,
        LocalDateTime createdAt,
        String userName) {
}