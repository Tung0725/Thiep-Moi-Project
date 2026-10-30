package com.wedding.auth.service;

import com.wedding.auth.entity.RefreshToken;
import com.wedding.auth.entity.User;
import com.wedding.auth.repository.RefreshTokenRepository;
import com.wedding.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Service quản lý vòng đời Refresh Token bao gồm sinh mã ngẫu nhiên an toàn,
 * băm SHA-256 trước khi lưu DB, xoay vòng token (Rotation) và cơ chế phát hiện
 * tái sử dụng token bị đánh cắp (Token Reuse Detection) theo tiêu chuẩn OWASP.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private int refreshExpirationDays;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Tạo mới Refresh Token cho người dùng, lưu mã băm SHA-256 vào cơ sở dữ liệu
     * và trả về chuỗi token ngẫu nhiên nguyên bản để gửi cho client.
     *
     * @param user Tài khoản người dùng cần cấp Refresh Token
     * @return Chuỗi Refresh Token ngẫu nhiên (Raw Token)
     */
    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = generateSecureRandomToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    /**
     * Xác thực Refresh Token và thực hiện xoay vòng token mới (Token Rotation).
     * Nếu phát hiện token đã bị thu hồi từ trước, hệ thống kích hoạt cơ chế
     * Token Reuse Detection để hủy toàn bộ phiên làm việc của tài khoản nhằm chống tấn công.
     *
     * @param rawToken Chuỗi Refresh Token nhận từ HttpOnly Cookie của client
     * @return Đối tượng chứa User và chuỗi Refresh Token mới
     */
    @Transactional
    public RotatedTokenResult verifyAndRotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
        }

        String tokenHash = hashToken(rawToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Phiên đăng nhập không tồn tại hoặc đã hết hạn"));

        if (token.isRevoked()) {
            refreshTokenRepository.revokeAllByUser(token.getUser());
            throw new UnauthorizedException("Cảnh báo bảo mật: Phát hiện phiên đăng nhập bất thường. Toàn bộ phiên làm việc đã bị hủy.");
        }

        if (token.isExpired()) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new UnauthorizedException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        token.setRevoked(true);

        String newRawToken = generateSecureRandomToken();
        String newTokenHash = hashToken(newRawToken);
        token.setReplacedByTokenHash(newTokenHash);
        refreshTokenRepository.save(token);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(token.getUser())
                .tokenHash(newTokenHash)
                .expiresAt(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return new RotatedTokenResult(token.getUser(), newRawToken);
    }

    /**
     * Thu hồi phiên làm việc của Refresh Token hiện tại (hỗ trợ thao tác Logout).
     *
     * @param rawToken Chuỗi Refresh Token cần hủy
     */
    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private String generateSecureRandomToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Thuật toán SHA-256 không khả dụng trên hệ thống", e);
        }
    }

    public record RotatedTokenResult(User user, String newRawToken) {
    }
}
