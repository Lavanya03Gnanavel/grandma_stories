package com.grandmastories.narration.dto;

public record TranslateResponse(
        String originalText,
        String translatedText,
        String sourceLanguage,
        String targetLanguage
) {}
