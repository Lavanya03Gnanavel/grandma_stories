package com.grandmastories.narration.service;

import com.grandmastories.narration.dto.GenerateNarrationRequest;
import com.grandmastories.narration.dto.NarrationResponse;
import com.grandmastories.narration.dto.TranslateRequest;
import com.grandmastories.narration.dto.TranslateResponse;
import com.grandmastories.narration.model.Narration;
import com.grandmastories.narration.repository.NarrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class NarrationService {

    private final NarrationRepository narrationRepository;
    private final VoiceSynthesisService voiceSynthesisService;
    private final TranslationService translationService;
    private final LanguageDetectionService languageDetectionService;

    public NarrationService(
            NarrationRepository narrationRepository,
            VoiceSynthesisService voiceSynthesisService,
            TranslationService translationService,
            LanguageDetectionService languageDetectionService
    ) {
        this.narrationRepository = narrationRepository;
        this.voiceSynthesisService = voiceSynthesisService;
        this.translationService = translationService;
        this.languageDetectionService = languageDetectionService;
    }

    @Transactional
    public List<NarrationResponse> generate(GenerateNarrationRequest request) {
        narrationRepository.deleteByStoryIdAndLanguage(request.storyId(), request.language());

        List<NarrationResponse> responses = new ArrayList<>();
        String targetLanguage = request.language();
        String sourceLanguage = languageDetectionService.detectFromPages(
                request.pages(),
                request.sourceLanguage()
        );
        String voiceProfile = voiceSynthesisService.resolveVoiceProfile(targetLanguage);

        int pageNumber = 1;
        for (String pageText : request.pages()) {
            String translatedText = translationService.translateIfNeeded(
                    pageText,
                    sourceLanguage,
                    targetLanguage
            );
            String audioUrl = voiceSynthesisService.synthesize(translatedText, targetLanguage);

            Narration narration = new Narration();
            narration.setStoryId(request.storyId());
            narration.setPageNumber(pageNumber);
            narration.setText(translatedText);
            narration.setLanguage(targetLanguage);
            narration.setVoiceProfile(voiceProfile);
            narration.setAudioUrl(audioUrl);
            narration.setStatus("READY");

            responses.add(toResponse(narrationRepository.save(narration)));
            pageNumber++;
        }

        return responses;
    }

    public TranslateResponse translate(TranslateRequest request) {
        String detectedSource = languageDetectionService.detectFromText(
                request.text(),
                request.sourceLanguage()
        );
        String translated = translationService.translateIfNeeded(
                request.text(),
                detectedSource,
                request.targetLanguage()
        );
        return new TranslateResponse(
                request.text(),
                translated,
                detectedSource,
                request.targetLanguage()
        );
    }

    public List<NarrationResponse> getByStory(Long storyId, String language) {
        List<Narration> narrations = language == null || language.isBlank()
                ? narrationRepository.findByStoryIdOrderByPageNumberAsc(storyId)
                : narrationRepository.findByStoryIdAndLanguageOrderByPageNumberAsc(storyId, language);

        return narrations.stream().map(this::toResponse).toList();
    }

    private NarrationResponse toResponse(Narration narration) {
        return new NarrationResponse(
                narration.getId(),
                narration.getStoryId(),
                narration.getPageNumber(),
                narration.getText(),
                narration.getLanguage(),
                narration.getVoiceProfile(),
                narration.getAudioUrl(),
                narration.getStatus(),
                narration.getCreatedAt()
        );
    }
}
