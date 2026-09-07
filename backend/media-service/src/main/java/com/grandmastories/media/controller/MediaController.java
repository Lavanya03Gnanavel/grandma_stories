package com.grandmastories.media.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of("service", "media-service", "status", "UP", "api", "/api/media/health");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "media-service");
    }

    @GetMapping("/mock/{language}/{voiceProfile}/{fileName}")
    public ResponseEntity<byte[]> mockAudio(
            @PathVariable String language,
            @PathVariable String voiceProfile,
            @PathVariable String fileName
    ) {
        // Placeholder until ElevenLabs audio is stored in MinIO.
        byte[] placeholder = new byte[0];
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(placeholder);
    }
}
