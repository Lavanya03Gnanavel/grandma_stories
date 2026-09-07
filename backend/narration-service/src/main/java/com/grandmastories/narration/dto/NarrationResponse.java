package com.grandmastories.narration.dto;

import java.time.Instant;

public record NarrationResponse(
        Long id,
        Long storyId,
        Integer pageNumber,
        String text,
        String language,
        String voiceProfile,
        String audioUrl,
        String status,
        Instant createdAt
) {}
