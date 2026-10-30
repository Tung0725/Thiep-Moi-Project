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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Service xử lý các nghiệp vụ định danh người dùng: đăng ký tài khoản với trạng thái chờ kích hoạt,
 * xác thực email, cấp phát cặp Access Token / Refresh Token, xoay vòng token, đăng nhập an toàn
 * và quản lý hồ sơ người dùng.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final LoginAttemptService loginAttemptService;
    private final EmailService emailService;

    /**
     * Tiếp nhận yêu cầu đăng ký tài khoản mới, tạo người dùng với trạng thái PENDING_VERIFICATION
     * và phát sinh mã xác thực gửi qua hòm thư điện tử.
     *
     * @param request Payload chứa email, mật khẩu và họ tên
     * @return UserResponse chứa thông tin tài khoản vừa tạo
     * @throws ConflictException nếu email đã tồn tại trong cơ sở dữ liệu
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email này đã được sử dụng");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank() ? request.getPhoneNumber().trim() : null)
                .role(Role.ROLE_USER)
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(savedUser)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFullName(), verificationToken.getToken());

        return UserResponse.fromEntity(savedUser);
    }

    /**
     * Kích hoạt tài khoản người dùng dựa trên mã token gửi qua email.
     *
     * @param token Chuỗi mã định danh xác thực nhận từ liên kết email
     * @return UserResponse với trạng thái ACTIVE và emailVerified = true
     */
    @Transactional
    public UserResponse verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Mã kích hoạt không tồn tại hoặc đã được sử dụng"));

        if (verificationToken.isExpired()) {
            emailVerificationTokenRepository.deleteByToken(token);
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã kích hoạt đã hết hạn. Vui lòng yêu cầu gửi lại email kích hoạt.");
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        User activatedUser = userRepository.save(user);

        emailVerificationTokenRepository.deleteByToken(token);

        return UserResponse.fromEntity(activatedUser);
    }

    /**
     * Gửi lại mã kích hoạt tài khoản qua email cho người dùng chưa xác thực.
     *
     * @param email Địa chỉ email yêu cầu gửi lại liên kết kích hoạt
     */
    @Transactional
    public void resendVerification(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null || user.isEmailVerified()) {
            return;
        }

        emailVerificationTokenRepository.deleteAllByUser(user);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString().replace("-", ""))
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken.getToken());
    }

    /**
     * Xác thực đăng nhập người dùng, kiểm tra trạng thái kích hoạt tài khoản
     * và sinh cặp Access Token cùng Refresh Token an toàn.
     *
     * @param request Payload chứa email và mật khẩu
     * @return AuthSessionResult chứa Access Token, Refresh Token và thông tin User
     */
    @Transactional(readOnly = true)
    public AuthSessionResult login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (loginAttemptService.isBlocked(normalizedEmail)) {
            throw new UnauthorizedException("Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.");
        }

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginAttemptService.loginFailed(normalizedEmail);
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        if (!user.isEmailVerified() || user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực tài khoản.");
        }

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        loginAttemptService.loginSucceeded(normalizedEmail);
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthSessionResult(accessToken, refreshToken, jwtTokenProvider.getExpirationMs(), UserResponse.fromEntity(user));
    }

    /**
     * Làm mới Access Token và xoay vòng Refresh Token mới khi Access Token hết hạn.
     *
     * @param rawRefreshToken Refresh Token cũ nhận từ HttpOnly Cookie
     * @return AuthSessionResult chứa Access Token mới và Refresh Token xoay vòng
     */
    @Transactional
    public AuthSessionResult refreshToken(String rawRefreshToken) {
        RefreshTokenService.RotatedTokenResult rotated = refreshTokenService.verifyAndRotate(rawRefreshToken);
        User user = rotated.user();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Tài khoản không ở trạng thái hoạt động");
        }

        String newAccessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthSessionResult(newAccessToken, rotated.newRawToken(), jwtTokenProvider.getExpirationMs(), UserResponse.fromEntity(user));
    }

    /**
     * Thu hồi phiên đăng nhập của người dùng tương ứng với Refresh Token được gửi lên.
     *
     * @param rawRefreshToken Chuỗi Refresh Token cần hủy
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revokeToken(rawRefreshToken);
    }

    /**
     * Truy vấn thông tin hồ sơ của tài khoản đang đăng nhập từ Security Context.
     *
     * @param userId UUID định danh người dùng
     * @return UserResponse chứa chi tiết hồ sơ
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại hoặc đã bị khóa"));
        return UserResponse.fromEntity(user);
    }

    /**
     * Cập nhật mật khẩu mới cho tài khoản người dùng đang đăng nhập.
     *
     * @param userId UUID định danh tài khoản
     * @param request Payload mật khẩu cũ và mới
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại hoặc đã bị khóa"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Mật khẩu hiện tại không chính xác");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
