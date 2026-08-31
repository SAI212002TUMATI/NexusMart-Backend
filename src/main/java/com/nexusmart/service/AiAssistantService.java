package com.nexusmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusmart.entity.Product;
import com.nexusmart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiAssistantService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAssistantService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public String askAssistant(String userQuestion) {
        try {
            String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
                    + geminiApiKey;

            List<Product> products = productRepository.findAll();

            List<Map<String, Object>> sanitizedProducts = products.stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("name", p.getName());
                map.put("description", p.getDescription());
                map.put("price", p.getPrice());
                map.put("stockQuantity", p.getStockQuantity());
                if (p.getCategory() != null) {
                    map.put("category", p.getCategory().getName());
                }
                return map;
            }).toList();

            String prompt = """
                    You are a helpful e-commerce shopping assistant for NexusMart.
                    Here is our current product catalog data: %s

                    Answer the customer's question based strictly on this catalog. Be concise, polite, and helpful.
                    Customer Question: "%s"
                    """.formatted(objectMapper.writeValueAsString(sanitizedProducts), userQuestion);

            String requestBody = """
                    {
                      "contents": [{
                        "parts": [{"text": "%s"}]
                      }]
                    }
                    """.formatted(prompt.replace("\"", "\\\"").replace("\n", " "));

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(geminiUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map root = objectMapper.readValue(response.body(), Map.class);
                List<Map> candidates = (List<Map>) root.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map content = (Map) candidates.get(0).get("content");
                    List<Map> parts = (List<Map>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
        } catch (Exception e) {
            System.err.println("AI Assistant failed: " + e.getMessage());
            e.printStackTrace();
        }
        return "I'm sorry, I'm having trouble connecting to my shopping assistant brain right now!";
    }
}