package com.wedding.auth.service;

import com.wedding.auth.dto.request.ChangePasswordRequest;
import com.wedding.auth.dto.request.LoginRequest;
import com.wedding.auth.dto.request.RegisterRequest;
import com.wedding.auth.dto.response.AuthSessionResult;
import com.wedding.auth.dto.response.UserResponse;
import com.wedding.auth.entity.EmailVerificationToken;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.EmailVerificationTokenRepository;
import com.wedding.auth.repository.UserRepository;
import com.wedding.common.exception.AppException;
import com.wedding.common.exception.ConflictException;
import com.wedding.common.exception.UnauthorizedException;
import com.wedding.config.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private LoginAttemptService loginAttemptService;
    @Mock
    private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, emailVerificationTokenRepository, passwordEncoder, jwtTokenProvider, refreshTokenService, loginAttemptService, emailService);
    }

    @Test
    @DisplayName("Đăng ký tài khoản thành công khi email chưa tồn tại")
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder().email("test@example.com").password("Password123").fullName("Nguyễn Văn A").build();
        UUID generatedId = UUID.randomUUID();
        User savedUser = User.builder().id(generatedId).email("test@example.com").passwordHash("hashed_password").fullName("Nguyễn Văn A").role(Role.ROLE_USER).status(UserStatus.PENDING_VERIFICATION).emailVerified(false).createdAt(Instant.now()).updatedAt(Instant.now()).build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getStatus()).isEqualTo(UserStatus.PENDING_VERIFICATION);
        assertThat(response.isEmailVerified()).isFalse();
        verify(userRepository).save(any(User.class));
        verify(emailVerificationTokenRepository).save(any(EmailVerificationToken.class));
        verify(emailService).sendVerificationEmail(eq("test@example.com"), eq("Nguyễn Văn A"), any());
    }

    @Test
    @DisplayName("Ném ConflictException khi đăng ký với email đã tồn tại")
    void register_DuplicateEmail_ThrowsConflictException() {
        RegisterRequest request = RegisterRequest.builder().email("duplicate@example.com").password("Password123").fullName("Nguyễn Văn B").build();
        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email này đã được sử dụng");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập thành công với thông tin xác thực chính xác và tài khoản đã kích hoạt")
    void login_Success() {
        LoginRequest request = LoginRequest.builder().email("test@example.com").password("Password123").build();
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("test@example.com").passwordHash("hashed_password").fullName("Nguyễn Văn A").role(Role.ROLE_USER).status(UserStatus.ACTIVE).emailVerified(true).createdAt(Instant.now()).build();

        when(loginAttemptService.isBlocked("test@example.com")).thenReturn(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(eq(userId), eq("test@example.com"), eq("ROLE_USER"))).thenReturn("valid_jwt_token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(900000L);
        when(refreshTokenService.createRefreshToken(user)).thenReturn("valid_refresh_token");

        AuthSessionResult response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("valid_jwt_token");
        assertThat(response.refreshToken()).isEqualTo("valid_refresh_token");
        assertThat(response.user().getEmail()).isEqualTo("test@example.com");
        verify(loginAttemptService).loginSucceeded("test@example.com");
    }

    @Test
    @DisplayName("Ném AppException khi đăng nhập tài khoản chưa kích hoạt email")
    void login_UnverifiedAccount_ThrowsAppException() {
        LoginRequest request = LoginRequest.builder().email("unverified@example.com").password("Password123").build();
        User user = User.builder().id(UUID.randomUUID()).email("unverified@example.com").passwordHash("hashed_password").role(Role.ROLE_USER).status(UserStatus.PENDING_VERIFICATION).emailVerified(false).build();

        when(loginAttemptService.isBlocked("unverified@example.com")).thenReturn(false);
        when(userRepository.findByEmail("unverified@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "hashed_password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Tài khoản chưa được kích hoạt");
    }

    @Test
    @DisplayName("Ném UnauthorizedException khi tài khoản bị khóa do nhập sai quá 5 lần")
    void login_BlockedAccount_ThrowsUnauthorizedException() {
        LoginRequest request = LoginRequest.builder().email("locked@example.com").password("Password123").build();
        when(loginAttemptService.isBlocked("locked@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần");
    }

    @Test
    @DisplayName("Ném UnauthorizedException khi đăng nhập với mật khẩu sai và tăng số lần sai")
    void login_WrongPassword_ThrowsUnauthorizedException() {
        LoginRequest request = LoginRequest.builder().email("test@example.com").password("WrongPassword").build();
        User user = User.builder().id(UUID.randomUUID()).email("test@example.com").passwordHash("hashed_password").role(Role.ROLE_USER).status(UserStatus.ACTIVE).emailVerified(true).build();

        when(loginAttemptService.isBlocked("test@example.com")).thenReturn(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");
        verify(loginAttemptService).loginFailed("test@example.com");
    }

    @Test
    @DisplayName("Đổi mật khẩu thành công khi mật khẩu hiện tại chính xác")
    void changePassword_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").passwordHash("old_hashed_password").build();
        ChangePasswordRequest request = ChangePasswordRequest.builder().currentPassword("OldPassword123").newPassword("NewPassword456").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPassword123", "old_hashed_password")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword456")).thenReturn("new_hashed_password");

        authService.changePassword(userId, request);

        assertThat(user.getPasswordHash()).isEqualTo("new_hashed_password");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Ném UnauthorizedException khi đổi mật khẩu với mật khẩu hiện tại sai")
    void changePassword_WrongCurrentPassword_ThrowsUnauthorizedException() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).passwordHash("old_hashed_password").build();
        ChangePasswordRequest request = ChangePasswordRequest.builder().currentPassword("WrongOldPassword").newPassword("NewPassword456").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongOldPassword", "old_hashed_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(userId, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Mật khẩu hiện tại không chính xác");
    }

    @Test
    @DisplayName("Ném AppException khi mật khẩu mới trùng với mật khẩu cũ")
    void changePassword_SamePassword_ThrowsAppException() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).passwordHash("hashed_password").build();
        ChangePasswordRequest request = ChangePasswordRequest.builder().currentPassword("SamePassword123").newPassword("SamePassword123").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SamePassword123", "hashed_password")).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword(userId, request))
                .isInstanceOf(AppException.class)
                .hasMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại");
    }

    @Test
    @DisplayName("Lấy thông tin người dùng hiện tại theo ID thành công")
    void getCurrentUser_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").fullName("Chủ Thiệp").role(Role.ROLE_USER).status(UserStatus.ACTIVE).emailVerified(true).createdAt(Instant.now()).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(userId);
        assertThat(response.getEmail()).isEqualTo("user@example.com");
        assertThat(response.getFullName()).isEqualTo("Chủ Thiệp");
    }
}
