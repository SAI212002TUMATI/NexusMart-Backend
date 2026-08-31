package com.nexusmart.service;

import com.nexusmart.dto.ReviewRequestDto;
import com.nexusmart.dto.ReviewResponseDto;
import com.nexusmart.entity.Product;
import com.nexusmart.entity.Review;
import com.nexusmart.entity.User;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.repository.ReviewRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ReviewResponseDto addReview(Long productId, ReviewRequestDto requestDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        User user = userRepository.findById(requestDto.userId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + requestDto.userId()));

        Review review = new Review();
        review.setRating(requestDto.rating());
        review.setComment(requestDto.comment());
        review.setProduct(product);
        review.setUser(user);

        Review savedReview = reviewRepository.save(review);

        return new ReviewResponseDto(
                savedReview.getId(),
                savedReview.getRating(),
                savedReview.getComment(),
                savedReview.getCreatedAt(),
                user.getName());
    }

    @Override
    public List<ReviewResponseDto> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(review -> new ReviewResponseDto(
                        review.getId(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt(),
                        review.getUser().getName()))
                .toList();
    }
}