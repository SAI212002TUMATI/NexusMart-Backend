package com.nexusmart.controller;

import com.nexusmart.entity.Product;
import com.nexusmart.entity.User;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {
    @Autowired
    private StoreService storeService;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/nearby")
    public ResponseEntity<List<User>> getNearbyStores(
            @RequestParam double lat, 
            @RequestParam double lng, 
            @RequestParam double radius) {
        return ResponseEntity.ok(storeService.getNearbyStores(lat, lng, radius));
    }

    @GetMapping("/by-pincode")
    public ResponseEntity<List<User>> getStoresByPincode(@RequestParam String pincode) {
        return ResponseEntity.ok(storeService.getStoresByPincode(pincode));
    }

    @GetMapping("/{storeId}/products")
    public ResponseEntity<List<Product>> getStoreProducts(@PathVariable Long storeId) {
        return ResponseEntity.ok(productRepository.findByMerchantId(storeId));
    }
}