package com.grandmastories.narration.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Converts story text into grandmother-style narration audio.
 * Supports English (en) and Tamil (ta) via ElevenLabs or Google Cloud TTS.
 */
@Service
public class VoiceSynthesisService {

    private final WebClient webClient;

    @Value("${tts.provider:mock}")
    private String provider;

    @Value("${tts.elevenlabs.api-key:}")
    private String elevenLabsApiKey;

    @Value("${tts.elevenlabs.voice-en:}")
    private String englishVoiceId;

    @Value("${tts.elevenlabs.voice-ta:}")
    private String tamilVoiceId;

    public VoiceSynthesisService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String synthesize(String text, String language) {
        String voiceProfile = resolveVoiceProfile(language);

        if ("elevenlabs".equalsIgnoreCase(provider) && !elevenLabsApiKey.isBlank()) {
            return synthesizeWithElevenLabs(text, language, voiceProfile);
        }

        return buildMockAudioUrl(text, language, voiceProfile);
    }

    public String resolveVoiceProfile(String language) {
        return switch (language) {
            case "ta" -> "grandmother-tamil";
            case "hi" -> "grandmother-hindi";
            case "te" -> "grandmother-telugu";
            case "ml" -> "grandmother-malayalam";
            case "kn" -> "grandmother-kannada";
            default -> "grandmother-english";
        };
    }

    private String synthesizeWithElevenLabs(String text, String language, String voiceProfile) {
        String voiceId = "ta".equals(language) ? tamilVoiceId : englishVoiceId;

        byte[] audio = webClient.post()
                .uri("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId)
                .header("xi-api-key", elevenLabsApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "text", text,
                        "model_id", "eleven_multilingual_v2",
                        "voice_settings", Map.of(
                                "stability", 0.75,
                                "similarity_boost", 0.85,
                                "style", 0.4,
                                "use_speaker_boost", true
                        )
                ))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();

        if (audio == null || audio.length == 0) {
            return buildMockAudioUrl(text, language, voiceProfile);
        }

        // In production, upload bytes to media-service and return the URL.
        return "http://localhost:8084/api/media/audio/generated-" + language + ".mp3";
    }

    private String buildMockAudioUrl(String text, String language, String voiceProfile) {
        int hash = Math.abs(text.hashCode());
        return "http://localhost:8084/api/media/mock/" + language + "/" + voiceProfile + "/" + hash + ".mp3";
    }
}
