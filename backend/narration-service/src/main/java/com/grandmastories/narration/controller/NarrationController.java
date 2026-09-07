package com.grandmastories.narration.controller;

import com.grandmastories.narration.dto.GenerateNarrationRequest;
import com.grandmastories.narration.dto.NarrationResponse;
import com.grandmastories.narration.dto.TranslateRequest;
import com.grandmastories.narration.dto.TranslateResponse;
import com.grandmastories.narration.service.NarrationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/narrations")
public class NarrationController {

    private final NarrationService narrationService;

    public NarrationController(NarrationService narrationService) {
        this.narrationService = narrationService;
    }

    @PostMapping("/generate")
    public List<NarrationResponse> generate(@Valid @RequestBody GenerateNarrationRequest request) {
        return narrationService.generate(request);
    }

    @PostMapping("/translate")
    public TranslateResponse translate(@Valid @RequestBody TranslateRequest request) {
        return narrationService.translate(request);
    }

    @GetMapping("/story/{storyId}")
    public List<NarrationResponse> getByStory(
            @PathVariable Long storyId,
            @RequestParam(required = false) String language
    ) {
        return narrationService.getByStory(storyId, language);
    }
}
