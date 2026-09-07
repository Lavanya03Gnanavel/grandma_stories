package com.grandmastories.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("app", "Grandma Stories API");
        response.put("status", "UP");
        response.put("endpoints", Map.of(
                "stories", "/api/stories",
                "narrations", "/api/narrations",
                "users", "/api/users",
                "media", "/api/media/health"
        ));
        return response;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
