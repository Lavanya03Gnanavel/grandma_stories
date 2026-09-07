package com.grandmastories.narration.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class LanguageDetectionService {

    private static final Map<String, int[]> SCRIPT_RANGES = Map.of(
            "ta", new int[]{0x0B80, 0x0BFF},
            "te", new int[]{0x0C00, 0x0C7F},
            "kn", new int[]{0x0C80, 0x0CFF},
            "ml", new int[]{0x0D00, 0x0D7F},
            "hi", new int[]{0x0900, 0x097F}
    );

    public String detectFromText(String text, String fallback) {
        if (text == null || text.isBlank()) {
            return fallback != null ? fallback : "en";
        }

        int latinChars = 0;
        Map<String, Integer> scores = new java.util.HashMap<>();
        SCRIPT_RANGES.keySet().forEach(key -> scores.put(key, 0));

        for (char ch : text.toCharArray()) {
            if (Character.isWhitespace(ch) || Character.isDigit(ch)) {
                continue;
            }

            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
                latinChars++;
                continue;
            }

            for (Map.Entry<String, int[]> entry : SCRIPT_RANGES.entrySet()) {
                int start = entry.getValue()[0];
                int end = entry.getValue()[1];
                if (ch >= start && ch <= end) {
                    scores.merge(entry.getKey(), 1, Integer::sum);
                }
            }
        }

        String bestLanguage = fallback != null && !fallback.isBlank() ? fallback : "en";
        int bestScore = 0;

        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            if (entry.getValue() > bestScore) {
                bestScore = entry.getValue();
                bestLanguage = entry.getKey();
            }
        }

        if (bestScore == 0 && latinChars > 0) {
            return "en";
        }

        return bestScore > 0 ? bestLanguage : bestLanguage;
    }

    public String detectFromPages(List<String> pages, String fallback) {
        StringBuilder combined = new StringBuilder();
        for (String page : pages) {
            if (page != null) {
                combined.append(page).append(' ');
            }
        }
        return detectFromText(combined.toString().trim(), fallback);
    }
}
