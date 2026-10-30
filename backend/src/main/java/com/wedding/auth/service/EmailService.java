package com.wedding.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service xử lý việc tạo nội dung và gửi thư điện tử xác thực tài khoản,
 * thông báo bảo mật đến người dùng một cách bất đồng bộ (@Async).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Gửi liên kết xác thực tài khoản tới hòm thư người dùng sau khi đăng ký tài khoản.
     *
     * @param toEmail Địa chỉ email người nhận
     * @param fullName Họ và tên người nhận
     * @param token Chuỗi mã xác thực (UUID)
     */
    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verificationUrl = String.format("%s/verify-email?token=%s", frontendUrl, token);

        log.info("================================================================================");
        log.info("📧 [EMAIL SERVICE] Gửi thư kích hoạt tài khoản meHappy BlissCard");
        log.info("Gửi tới: {} ({})", fullName, toEmail);
        log.info("Liên kết kích hoạt tài khoản: {}", verificationUrl);
        log.info("================================================================================");
    }
}
