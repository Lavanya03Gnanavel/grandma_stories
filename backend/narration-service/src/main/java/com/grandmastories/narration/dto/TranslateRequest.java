package com.grandmastories.narration.dto;

import com.grandmastories.common.SupportedLanguages;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TranslateRequest(
        @NotBlank String text,
        @NotBlank @Pattern(regexp = SupportedLanguages.PATTERN) String sourceLanguage,
        @NotBlank @Pattern(regexp = SupportedLanguages.PATTERN) String targetLanguage
) {}
