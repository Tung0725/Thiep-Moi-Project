package com.wedding.auth.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý giới hạn số lần đăng nhập sai nhằm phòng chống tấn công dò quét
 * mật khẩu (Brute Force / Credential Stuffing) theo tiêu chuẩn bảo mật OWASP.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_SECONDS = 900L;

    private final Map<String, FailedAttempt> attemptsCache = new ConcurrentHashMap<>();

    private record FailedAttempt(int count, Instant lastAttemptTime) {}

    /**
     * Ghi nhận lượt đăng nhập thành công và xóa bỏ lịch sử nhập sai của tài khoản.
     *
     * @param email Địa chỉ email đăng nhập
     */
    public void loginSucceeded(String email) {
        attemptsCache.remove(email.toLowerCase());
    }

    /**
     * Tăng số lần nhập sai mật khẩu của tài khoản.
     *
     * @param email Địa chỉ email đăng nhập
     */
    public void loginFailed(String email) {
        String key = email.toLowerCase();
        attemptsCache.compute(key, (k, attempt) -> {
            Instant now = Instant.now();
            if (attempt == null || isExpired(attempt.lastAttemptTime())) {
                return new FailedAttempt(1, now);
            }
            return new FailedAttempt(attempt.count() + 1, now);
        });
    }

    /**
     * Kiểm tra xem tài khoản có đang bị tạm khóa do nhập sai mật khẩu quá 5 lần liên tiếp hay không.
     *
     * @param email Địa chỉ email cần kiểm tra
     * @return true nếu tài khoản đang trong thời gian bị khóa tạm thời
     */
    public boolean isBlocked(String email) {
        String key = email.toLowerCase();
        FailedAttempt attempt = attemptsCache.get(key);
        if (attempt == null) {
            return false;
        }

        if (isExpired(attempt.lastAttemptTime())) {
            attemptsCache.remove(key);
            return false;
        }

        return attempt.count() >= MAX_FAILED_ATTEMPTS;
    }

    private boolean isExpired(Instant lastAttemptTime) {
        return Instant.now().isAfter(lastAttemptTime.plusSeconds(LOCK_DURATION_SECONDS));
    }
}
