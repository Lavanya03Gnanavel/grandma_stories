package com.grandmastories.narration.repository;

import com.grandmastories.narration.model.Narration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NarrationRepository extends JpaRepository<Narration, Long> {
    List<Narration> findByStoryIdOrderByPageNumberAsc(Long storyId);
    List<Narration> findByStoryIdAndLanguageOrderByPageNumberAsc(Long storyId, String language);
    void deleteByStoryIdAndLanguage(Long storyId, String language);
}
