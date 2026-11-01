package com.nexusmart.dto;

public record AdminMetricsResponse(
        long totalUsers,
        long totalMerchants,
        long totalOrders) {
}