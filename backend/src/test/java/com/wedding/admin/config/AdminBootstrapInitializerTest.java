package com.wedding.admin.config;

import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.UserRepository;
import com.wedding.config.AppProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapInitializerTest {

    @Mock
    private AppProperties appProperties;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminBootstrapInitializer initializer;

    @Test
    @DisplayName("run - Bỏ qua khi ADMIN_EMAIL hoặc ADMIN_PASSWORD bị trống")
    void run_MissingCredentials_SkipsBootstrap() {
        AppProperties.Admin adminConfig = new AppProperties.Admin();
        adminConfig.setEmail("admin@example.com");
        adminConfig.setPassword("   ");
        when(appProperties.getAdmin()).thenReturn(adminConfig);

        initializer.run(new DefaultApplicationArguments());

        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("run - Bỏ qua khi tài khoản Admin với email đã tồn tại")
    void run_ExistingEmail_SkipsBootstrap() {
        AppProperties.Admin adminConfig = new AppProperties.Admin();
        adminConfig.setEmail("  Admin@Example.com ");
        adminConfig.setPassword("StrongPass123!");
        when(appProperties.getAdmin()).thenReturn(adminConfig);
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(true);

        initializer.run(new DefaultApplicationArguments());

        verify(userRepository).existsByEmail("admin@example.com");
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("run - Tạo tài khoản ROLE_ADMIN ACTIVE đã xác thực email khi đủ cấu hình và chưa tồn tại")
    void run_ValidConfigAndNotExists_CreatesAdminAccount() {
        AppProperties.Admin adminConfig = new AppProperties.Admin();
        adminConfig.setEmail("  Admin@Wedding.VN ");
        adminConfig.setPassword("SuperSecret!2026");
        adminConfig.setFullName("  Quản Trị Hệ Thống  ");
        when(appProperties.getAdmin()).thenReturn(adminConfig);
        when(userRepository.existsByEmail("admin@wedding.vn")).thenReturn(false);
        when(passwordEncoder.encode("SuperSecret!2026")).thenReturn("$2a$12$encodedHash");

        initializer.run(new DefaultApplicationArguments());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User saved = userCaptor.getValue();
        assertEquals("admin@wedding.vn", saved.getEmail());
        assertEquals("$2a$12$encodedHash", saved.getPasswordHash());
        assertEquals("Quản Trị Hệ Thống", saved.getFullName());
        assertEquals(Role.ROLE_ADMIN, saved.getRole());
        assertEquals(UserStatus.ACTIVE, saved.getStatus());
        assertTrue(saved.isEmailVerified());
    }
}
