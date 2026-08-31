package com.nexusmart.service;

import com.nexusmart.entity.Category;
import com.nexusmart.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }

    public Category createCategory(Category category, Long parentId) {
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id: " + parentId));
            category.setParentCategory(parent);
        }
        return categoryRepository.save(category);
    }

    // 📥 Batch method to save a list of categories at once
    public List<Category> saveAll(List<Category> categories) {
        return categoryRepository.saveAll(categories);
    }
}