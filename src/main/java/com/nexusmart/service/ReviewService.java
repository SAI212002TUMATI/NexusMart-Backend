package com.nexusmart.service;

import com.nexusmart.dto.ReviewRequestDto;
import com.nexusmart.dto.ReviewResponseDto;
import java.util.List;

public interface ReviewService {
    ReviewResponseDto addReview(Long productId, ReviewRequestDto requestDto);

    List<ReviewResponseDto> getReviewsByProduct(Long productId);
}