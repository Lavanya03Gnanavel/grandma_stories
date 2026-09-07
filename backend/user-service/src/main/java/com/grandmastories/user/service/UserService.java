package com.grandmastories.user.service;

import com.grandmastories.user.dto.LanguagePreferenceRequest;
import com.grandmastories.user.dto.RegisterRequest;
import com.grandmastories.user.dto.UserResponse;
import com.grandmastories.user.model.User;
import com.grandmastories.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });

        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        user.setPreferredLanguage("en");
        return toResponse(userRepository.save(user));
    }

    public UserResponse getUser(Long id) {
        return toResponse(findUser(id));
    }

    public UserResponse updateLanguage(Long id, LanguagePreferenceRequest request) {
        User user = findUser(id);
        user.setPreferredLanguage(request.language());
        return toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPreferredLanguage(),
                user.getCreatedAt()
        );
    }
}
