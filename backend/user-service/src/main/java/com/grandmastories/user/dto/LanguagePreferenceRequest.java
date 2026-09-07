package com.grandmastories.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LanguagePreferenceRequest(
        @NotBlank
        @Pattern(regexp = "en|ta|hi|te|ml|kn", message = "Unsupported language")
        String language
) {}
