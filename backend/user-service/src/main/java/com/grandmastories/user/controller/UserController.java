package com.grandmastories.user.controller;

import com.grandmastories.user.dto.LanguagePreferenceRequest;
import com.grandmastories.user.dto.RegisterRequest;
import com.grandmastories.user.dto.UserResponse;
import com.grandmastories.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}/language")
    public UserResponse updateLanguage(
            @PathVariable Long id,
            @Valid @RequestBody LanguagePreferenceRequest request
    ) {
        return userService.updateLanguage(id, request);
    }
}
