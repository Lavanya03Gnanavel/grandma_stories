package com.grandmastories.story.service;

import com.grandmastories.story.dto.CreateStoryRequest;
import com.grandmastories.story.dto.StoryResponse;
import com.grandmastories.story.model.Story;
import com.grandmastories.story.repository.StoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final DocumentParserService documentParserService;

    public StoryService(StoryRepository storyRepository, DocumentParserService documentParserService) {
        this.storyRepository = storyRepository;
        this.documentParserService = documentParserService;
    }

    public StoryResponse create(CreateStoryRequest request) {
        Story story = new Story();
        story.setUserId(request.userId() != null ? request.userId() : 1L);
        story.setTitle(request.title());
        story.setContent(request.content());
        story.setLanguage(request.language() != null ? request.language() : "en");
        story.setPages(documentParserService.splitIntoPages(request.content()));
        story.setStatus("READY");
        return toResponse(storyRepository.save(story));
    }

    public StoryResponse createFromDocument(
            org.springframework.web.multipart.MultipartFile file,
            String title,
            String language,
            Long userId
    ) {
        DocumentParserService.ParsedDocument parsed = documentParserService.parse(file);

        Story story = new Story();
        story.setUserId(userId != null ? userId : 1L);
        story.setTitle(title != null && !title.isBlank() ? title.trim() : parsed.title());
        story.setContent(parsed.content());
        story.setPages(parsed.pages());
        story.setLanguage(language != null && !language.isBlank() ? language : "en");
        story.setStatus("READY");
        return toResponse(storyRepository.save(story));
    }

    public StoryResponse getById(Long id) {
        return toResponse(findStory(id));
    }

    public List<StoryResponse> listByUser(Long userId) {
        return storyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private Story findStory(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));
    }

    private StoryResponse toResponse(Story story) {
        return new StoryResponse(
                story.getId(),
                story.getUserId(),
                story.getTitle(),
                story.getContent(),
                story.getPages(),
                story.getLanguage(),
                story.getStatus(),
                story.getCreatedAt()
        );
    }
}
