package com.grandmastories.story.repository;

import com.grandmastories.story.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserIdOrderByCreatedAtDesc(Long userId);
}
