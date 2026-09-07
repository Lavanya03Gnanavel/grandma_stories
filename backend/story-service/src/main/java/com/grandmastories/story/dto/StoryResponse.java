package com.grandmastories.story.dto;

import java.time.Instant;
import java.util.List;

public record StoryResponse(
        Long id,
        Long userId,
        String title,
        String content,
        List<String> pages,
        String language,
        String status,
        Instant createdAt
) {}
