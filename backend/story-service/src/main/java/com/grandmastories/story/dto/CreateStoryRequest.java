package com.grandmastories.story.dto;

import com.grandmastories.story.support.SupportedLanguages;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateStoryRequest(
        Long userId,
        @NotBlank String title,
        @NotBlank String content,
        @Pattern(regexp = SupportedLanguages.PATTERN, message = "Unsupported language")
        String language
) {
    public CreateStoryRequest {
        if (language == null || language.isBlank()) {
            language = "en";
        }
    }
}
