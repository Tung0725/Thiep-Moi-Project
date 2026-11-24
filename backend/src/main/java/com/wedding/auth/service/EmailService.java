package com.wedding.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Gửi email xác minh tài khoản qua Gmail SMTP sau khi mã xác minh đã được lưu.
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final String sender;
    private final String frontendUrl;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String sender,
                        @Value("${app.frontend.url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.sender = sender;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Gửi liên kết xác minh bất đồng bộ sau khi giao dịch đăng ký hoặc gửi lại thành công.
     */
    @Async
    @TransactionalEventListener
    public void sendVerificationEmail(VerificationEmailRequested request) {
        if (sender.isBlank()) {
            log.warn("Không gửi được email xác minh vì chưa cấu hình MAIL_USERNAME");
            return;
        }

        String verificationUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .pathSegment("verify-email")
                .queryParam("token", "{token}")
                .encode()
                .buildAndExpand(request.token())
                .toUriString();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(request.toEmail());
        message.setSubject("Xác minh tài khoản loiyeuthuong.vn");
        message.setText("""
                Chào %s,

                Mở liên kết sau để xác minh email và kích hoạt tài khoản loiyeuthuong.vn:
                %s

                Liên kết có hiệu lực trong 24 giờ. Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.
                """.formatted(request.fullName(), verificationUrl));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.error("Gửi email xác minh qua SMTP thất bại ({})", exception.getClass().getSimpleName());
        }
    }

    record VerificationEmailRequested(String toEmail, String fullName, String token) {
    }
}
