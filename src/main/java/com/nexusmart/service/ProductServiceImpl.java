package com.nexusmart.service;

import com.nexusmart.dto.CategoryResponseDto;
import com.nexusmart.dto.MerchantResponseDto;
import com.nexusmart.dto.ProductResponseDto;
import com.nexusmart.entity.Category;
import com.nexusmart.entity.Product;
import com.nexusmart.entity.ProductImage;
import com.nexusmart.entity.Role;
import com.nexusmart.entity.User;
import com.nexusmart.repository.CategoryRepository;
import com.nexusmart.repository.ProductRepository;
import com.nexusmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductResponseDto convertToDto(Product product) {
        MerchantResponseDto merchantDto = null;
        if (product.getMerchant() != null) {
            merchantDto = new MerchantResponseDto(
                    product.getMerchant().getId(),
                    product.getMerchant().getName(),
                    product.getMerchant().getEmail());
        }

        CategoryResponseDto categoryDto = null;
        if (product.getCategory() != null) {
            categoryDto = new CategoryResponseDto(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getDescription());
        }

        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream().map(ProductImage::getImageUrl).toList()
                : List.of();

        return new ProductResponseDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                imageUrls,
                merchantDto,
                categoryDto);
    }

    @Override
    public ProductResponseDto addProduct(Product product, Long merchantId, Long categoryId, Long subCategoryId) {
        User merchant = userRepository.findById(merchantId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + merchantId));

        if (merchant.getRole() == Role.CUSTOMER) {
            throw new RuntimeException("Access Denied: Customers are not authorized to list products.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        product.setMerchant(merchant);
        product.setCategory(category);

        if (subCategoryId != null) {
            Category subCategory = categoryRepository.findById(subCategoryId)
                    .orElseThrow(() -> new RuntimeException("Subcategory not found with id: " + subCategoryId));
            product.setCategory(subCategory);
        }

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Override
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToDto(product);
    }

    @Override
    public ProductResponseDto updateProduct(Long id, Product updatedProduct, Long currentUserId) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + currentUserId));

        if (currentUser.getRole() != Role.ADMIN && !existingProduct.getMerchant().getId().equals(currentUserId)) {
            throw new RuntimeException("Access Denied: You do not have permission to modify this product.");
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStockQuantity(updatedProduct.getStockQuantity());

        if (updatedProduct.getImages() != null && !updatedProduct.getImages().isEmpty()) {
            existingProduct.getImages().clear();
            for (ProductImage img : updatedProduct.getImages()) {
                img.setProduct(existingProduct);
                existingProduct.getImages().add(img);
            }
        }

        Product savedProduct = productRepository.save(existingProduct);
        return convertToDto(savedProduct);
    }

    @Override
    public void deleteProduct(Long id, Long currentUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + currentUserId));

        if (currentUser.getRole() != Role.ADMIN && !product.getMerchant().getId().equals(currentUserId)) {
            throw new RuntimeException("Access Denied: You do not have permission to delete this product.");
        }

        productRepository.delete(product);
    }
}