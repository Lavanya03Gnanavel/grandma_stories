package com.grandmastories.user.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        String name,
        String preferredLanguage,
        Instant createdAt
) {}
