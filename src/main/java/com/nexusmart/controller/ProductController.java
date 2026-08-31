package com.nexusmart.controller;

import com.nexusmart.dto.ProductResponseDto;
import com.nexusmart.entity.Product;
import com.nexusmart.entity.ProductImage;
import com.nexusmart.service.ProductService;
import com.nexusmart.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    public ProductController(ProductService productService, FileStorageService fileStorageService) {
        this.productService = productService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long id) {
        return new ResponseEntity<>(productService.getProductById(id), HttpStatus.OK);
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ProductResponseDto> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("images") MultipartFile[] imageFiles, // 👈 Accepts multiple files
            @RequestParam("merchantId") Long merchantId,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "subCategoryId", required = false) Long subCategoryId) {

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);

        // Process and store each image file
        List<ProductImage> productImages = new ArrayList<>();
        for (MultipartFile file : imageFiles) {
            String fileUrlPath = fileStorageService.storeFile(file);
            productImages.add(new ProductImage(fileUrlPath, product));
        }
        product.setImages(productImages);

        ProductResponseDto savedProduct = productService.addProduct(product, merchantId, categoryId, subCategoryId);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product updatedProduct,
            @RequestParam Long currentUserId) {

        ProductResponseDto product = productService.updateProduct(id, updatedProduct, currentUserId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long currentUserId) {

        productService.deleteProduct(id, currentUserId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}