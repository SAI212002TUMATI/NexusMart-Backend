package com.nexusmart.service;

import com.nexusmart.dto.ProductResponseDto;
import com.nexusmart.entity.Product;
import java.util.List;

public interface ProductService {

    ProductResponseDto addProduct(Product product, Long merchantId, Long categoryId, Long subCategoryId);

    List<ProductResponseDto> getAllProducts();

    ProductResponseDto getProductById(Long id);

    ProductResponseDto updateProduct(Long id, Product updatedProduct, Long currentUserId);

    void deleteProduct(Long id, Long currentUserId);
}