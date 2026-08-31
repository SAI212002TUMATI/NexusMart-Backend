package com.nexusmart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequestDto(
        @NotNull(message = "Rating is required") @Min(1) @Max(5) Integer rating,

        @NotBlank(message = "Comment cannot be blank") String comment,

        @NotNull(message = "User ID is required") Long userId) {
}