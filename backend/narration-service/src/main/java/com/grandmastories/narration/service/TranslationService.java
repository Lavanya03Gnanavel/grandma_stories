package com.grandmastories.narration.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class TranslationService {

    private static final int MAX_CHUNK_SIZE = 450;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public TranslationService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String translateIfNeeded(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank() || sourceLanguage.equals(targetLanguage)) {
            return text;
        }
        return translate(text, sourceLanguage, targetLanguage);
    }

    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.isBlank()) {
            return text;
        }

        try {
            List<String> chunks = chunkText(text, MAX_CHUNK_SIZE);
            StringBuilder translated = new StringBuilder();

            for (String chunk : chunks) {
                translated.append(translateChunk(chunk, sourceLanguage, targetLanguage)).append(' ');
                if (chunks.size() > 1) {
                    Thread.sleep(300);
                }
            }

            return translated.toString().trim();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return text;
        }
    }

    private String translateChunk(String text, String sourceLanguage, String targetLanguage) {
        try {
            String responseBody = webClient.get()
                    .uri("https://api.mymemory.translated.net/get?q={text}&langpair={langpair}",
                            text,
                            sourceLanguage + "|" + targetLanguage)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody == null) {
                return text;
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode translated = root.path("responseData").path("translatedText");

            if (translated.isMissingNode() || translated.asText().isBlank()) {
                return text;
            }

            return translated.asText();
        } catch (Exception ex) {
            return text;
        }
    }

    List<String> chunkText(String text, int maxSize) {
        if (text.length() <= maxSize) {
            return List.of(text);
        }

        List<String> chunks = new ArrayList<>();
        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder current = new StringBuilder();

        for (String sentence : sentences) {
            if (current.length() + sentence.length() + 1 > maxSize) {
                if (!current.isEmpty()) {
                    chunks.add(current.toString().trim());
                    current = new StringBuilder();
                }
                if (sentence.length() > maxSize) {
                    for (int i = 0; i < sentence.length(); i += maxSize) {
                        chunks.add(sentence.substring(i, Math.min(i + maxSize, sentence.length())));
                    }
                    continue;
                }
            }
            if (!current.isEmpty()) {
                current.append(' ');
            }
            current.append(sentence);
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        return chunks.isEmpty() ? List.of(text) : chunks;
    }
}
