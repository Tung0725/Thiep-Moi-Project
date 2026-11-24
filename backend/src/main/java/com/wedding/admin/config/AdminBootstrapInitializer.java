package com.wedding.admin.config;

import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.UserRepository;
import com.wedding.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;

/**
 * Khởi tạo tài khoản quản trị viên (ROLE_ADMIN) mặc định đầu tiên khi ứng dụng khởi động
 * dựa trên biến môi trường ADMIN_EMAIL, ADMIN_PASSWORD và ADMIN_FULL_NAME.
 * Chỉ tạo đúng một lần nếu email chưa tồn tại và không bao giờ ghi mật khẩu ra log.
 */
@Component
@RequiredArgsConstructor
public class AdminBootstrapInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapInitializer.class);
    private static final String DEFAULT_ADMIN_FULL_NAME = "System Administrator";

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Thực thi kiểm tra cấu hình và tự động seed tài khoản ROLE_ADMIN nếu đủ điều kiện.
     *
     * @param args Tham số khởi động của ứng dụng Spring Boot
     */
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppProperties.Admin adminConfig = appProperties.getAdmin();
        if (adminConfig == null
                || !StringUtils.hasText(adminConfig.getEmail())
                || !StringUtils.hasText(adminConfig.getPassword())) {
            log.info("Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.");
            return;
        }

        String normalizedEmail = adminConfig.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            log.info("Admin bootstrap skipped: account already exists for configured email.");
            return;
        }

        String fullName = StringUtils.hasText(adminConfig.getFullName())
                ? adminConfig.getFullName().trim()
                : DEFAULT_ADMIN_FULL_NAME;

        User adminUser = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(adminConfig.getPassword()))
                .fullName(fullName)
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();

        userRepository.save(adminUser);
        log.info("Bootstrapped initial ROLE_ADMIN account for email={}", normalizedEmail);
    }
}
