package com.nexusmart.controller;

import com.nexusmart.dto.ReviewRequestDto;
import com.nexusmart.dto.ReviewResponseDto;
import com.nexusmart.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDto> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequestDto requestDto) {
        ReviewResponseDto response = reviewService.addReview(productId, requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByProduct(
            @PathVariable Long productId) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByProduct(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
}