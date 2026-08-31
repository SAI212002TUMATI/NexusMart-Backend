package com.nexusmart.controller;

import com.nexusmart.dto.CartResponseDto;
import com.nexusmart.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponseDto> addItemToCart(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        CartResponseDto updatedCart = cartService.addItemToCart(userId, productId, quantity);
        return new ResponseEntity<>(updatedCart, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CartResponseDto> getCartByUserId(@PathVariable Long userId) {
        CartResponseDto cart = cartService.getCartByUserId(userId);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<String> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return new ResponseEntity<>("Cart cleared successfully!", HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponseDto> updateItemQuantity(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, quantity));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<CartResponseDto> removeItemFromCart(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId));
    }

}