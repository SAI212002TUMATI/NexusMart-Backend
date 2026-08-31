package com.nexusmart.controller;

import com.nexusmart.entity.Category;
import com.nexusmart.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        Category savedCategory = categoryService.createCategory(category, parentId);
        return ResponseEntity.ok(savedCategory);
    }

    // 📥 Batch endpoint to create multiple categories/subcategories at once
    @PostMapping("/batch")
    public ResponseEntity<List<Category>> createCategoriesBatch(@RequestBody List<Category> categories) {
        List<Category> savedCategories = categoryService.saveAll(categories);
        return new ResponseEntity<>(savedCategories, HttpStatus.CREATED);
    }
}