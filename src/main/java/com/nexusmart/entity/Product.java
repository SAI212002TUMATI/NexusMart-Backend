package com.nexusmart.entity;

import java.util.ArrayList;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "product name cannot be blank")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description cannot be Blank")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or a positive value")
    @Column(nullable = false)
    private Double price;
    @NotNull(message = "Stock quantity is Required")
    @PositiveOrZero(message = "Stock Cannot be negative")
    @Column(nullable = false)
    private Integer stockQuantity;

    // Remove: private String imageUrl;
    // Add this inside Product.java:
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private User merchant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}
