package com.nexusmart.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter // Better practice than @Data for JPA
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "cart") // Prevents StackOverflowError
@EqualsAndHashCode(exclude = "cart") // Prevents StackOverflow/Session issues
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;
}