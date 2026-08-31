package com.nexusmart.service;

import com.nexusmart.entity.Product;
import com.nexusmart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SmartSearchService {

    private final ProductRepository productRepository;

    public SmartSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> parseAndSearch(String query) {
        if (query == null || query.trim().isEmpty()) {
            return productRepository.findAll();
        }

        String lowerQuery = query.toLowerCase();
        Double maxPrice = null;
        String category = null;

        // Extract price constraints like "under 1000" or "below 500"
        Pattern pricePattern = Pattern.compile("(?:under|below|less than|upto)\\s+(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher priceMatcher = pricePattern.matcher(lowerQuery);
        if (priceMatcher.find()) {
            maxPrice = Double.parseDouble(priceMatcher.group(1));
            lowerQuery = lowerQuery.replaceAll("(?:under|below|less than|upto)\\s+\\d+", "").trim();
        }

        // Basic category detection
        if (lowerQuery.contains("electronics")) {
            category = "Electronics";
            lowerQuery = lowerQuery.replace("electronics", "").trim();
        } else if (lowerQuery.contains("footwear") || lowerQuery.contains("shoes")) {
            category = "Footear";
            lowerQuery = lowerQuery.replace("footwear", "").replace("shoes", "").trim();
        }

        String keyword = lowerQuery.isEmpty() ? null : lowerQuery;
        System.out.println("DEBUG -> Keyword: " + keyword + " | Category: " + category + " | MaxPrice: " + maxPrice);

        return productRepository.searchProductsDynamic(keyword, category, maxPrice);
    }
}