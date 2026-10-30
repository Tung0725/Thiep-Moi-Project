package com.wedding.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String TEST_SECRET = "super_secure_jwt_secret_key_with_at_least_256_bits_length_for_unit_testing_12345";
    private static final long EXPIRATION_MS = 3600000L;

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Sinh JWT token và giải mã thông tin thành công")
    void generateAndParseToken_Success() {
        UUID userId = UUID.randomUUID();
        String email = "author@wedding.com";
        String role = "ROLE_USER";

        String token = jwtTokenProvider.generateToken(userId, email, role);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo(email);
        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo(role);
    }

    @Test
    @DisplayName("Trả về false khi kiểm tra token bị giả mạo hoặc không hợp lệ")
    void validateToken_InvalidToken_ReturnsFalse() {
        assertThat(jwtTokenProvider.validateToken("invalid.token.structure")).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
    }
}
