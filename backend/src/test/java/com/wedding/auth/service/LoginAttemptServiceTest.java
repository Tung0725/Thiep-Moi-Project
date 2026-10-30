package com.wedding.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoginAttemptServiceTest {

    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        loginAttemptService = new LoginAttemptService();
    }

    @Test
    @DisplayName("Tài khoản chưa từng đăng nhập sai thì không bị khóa")
    void isBlocked_InitialState_ReturnsFalse() {
        assertThat(loginAttemptService.isBlocked("user@example.com")).isFalse();
    }

    @Test
    @DisplayName("Nhập sai dưới 5 lần thì chưa bị khóa tài khoản")
    void isBlocked_LessThanFiveAttempts_ReturnsFalse() {
        String email = "user@example.com";
        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(email);
        }

        assertThat(loginAttemptService.isBlocked(email)).isFalse();
    }

    @Test
    @DisplayName("Nhập sai từ 5 lần liên tiếp trở lên thì bị tạm khóa tài khoản")
    void isBlocked_FiveAttemptsOrMore_ReturnsTrue() {
        String email = "user@example.com";
        for (int i = 0; i < 5; i++) {
            loginAttemptService.loginFailed(email);
        }

        assertThat(loginAttemptService.isBlocked(email)).isTrue();
    }

    @Test
    @DisplayName("Đăng nhập thành công sẽ xóa sạch lịch sử nhập sai của tài khoản")
    void loginSucceeded_ResetsCounter() {
        String email = "user@example.com";
        for (int i = 0; i < 4; i++) {
            loginAttemptService.loginFailed(email);
        }

        loginAttemptService.loginSucceeded(email);
        assertThat(loginAttemptService.isBlocked(email)).isFalse();
    }
}
