package com.grandmastories.narration.dto;

import com.grandmastories.common.SupportedLanguages;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record GenerateNarrationRequest(
        @NotNull Long storyId,
        @NotNull List<String> pages,
        @NotBlank
        @Pattern(regexp = SupportedLanguages.PATTERN, message = "Unsupported language")
        String language,
        @Pattern(regexp = SupportedLanguages.PATTERN, message = "Unsupported source language")
        String sourceLanguage
) {
    public GenerateNarrationRequest {
        if (sourceLanguage == null || sourceLanguage.isBlank()) {
            sourceLanguage = "en";
        }
    }
}
