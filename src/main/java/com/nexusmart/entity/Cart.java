package com.nexusmart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter // Better practice than @Data for JPA
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default // Ensures Lombok Builder initializes the empty list instead of null
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    // --- Helper Methods for Bidirectional Synchronization ---
    public void addCartItem(CartItem item) {
        items.add(item);
        item.setCart(this);
    }

    public void removeCartItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
    }
}