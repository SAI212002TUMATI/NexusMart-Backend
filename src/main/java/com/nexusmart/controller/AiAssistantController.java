package com.nexusmart.controller;

import com.nexusmart.service.AiAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-assistant")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    public AiAssistantController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping
    public ResponseEntity<String> chatWithAssistant(@RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        String answer = aiAssistantService.askAssistant(question);
        return ResponseEntity.ok(answer);
    }
}