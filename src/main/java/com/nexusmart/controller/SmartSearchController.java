package com.nexusmart.controller;

import com.nexusmart.entity.Product;
import com.nexusmart.service.SmartSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-search")
public class SmartSearchController {

    private final SmartSearchService smartSearchService;

    public SmartSearchController(SmartSearchService smartSearchService) {
        this.smartSearchService = smartSearchService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> search(@RequestParam String q) {
        List<Product> results = smartSearchService.parseAndSearch(q);
        return ResponseEntity.ok(results);
    }

}
