package com.grandmastories.story.controller;

import com.grandmastories.story.dto.CreateStoryRequest;
import com.grandmastories.story.dto.StoryResponse;
import com.grandmastories.story.service.StoryService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping
    public StoryResponse create(@Valid @RequestBody CreateStoryRequest request) {
        return storyService.create(request);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoryResponse upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "language", defaultValue = "en") String language,
            @RequestParam(value = "userId", defaultValue = "1") Long userId
    ) {
        return storyService.createFromDocument(file, title, language, userId);
    }

    @GetMapping("/{id}")
    public StoryResponse getById(@PathVariable Long id) {
        return storyService.getById(id);
    }

    @GetMapping
    public List<StoryResponse> list(@RequestParam(defaultValue = "1") Long userId) {
        return storyService.listByUser(userId);
    }
}
