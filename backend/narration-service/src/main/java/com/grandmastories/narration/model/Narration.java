package com.grandmastories.narration.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "narrations")
public class Narration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storyId;

    @Column(nullable = false)
    private Integer pageNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String voiceProfile;

    @Column(nullable = false)
    private String audioUrl;

    @Column(nullable = false)
    private String status = "READY";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getVoiceProfile() { return voiceProfile; }
    public void setVoiceProfile(String voiceProfile) { this.voiceProfile = voiceProfile; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
}
