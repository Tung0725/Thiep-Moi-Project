package com.wedding.auth.dto.response;

public record AuthSessionResult(
        String accessToken,
        String refreshToken,
        long expiresIn,
        UserResponse user
) {
}
