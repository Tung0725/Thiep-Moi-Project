package com.wedding.auth.controller;

import com.wedding.auth.dto.request.ChangePasswordRequest;
import com.wedding.auth.dto.request.LoginRequest;
import com.wedding.auth.dto.request.RegisterRequest;
import com.wedding.auth.dto.response.AuthSessionResult;
import com.wedding.auth.dto.response.UserResponse;
import com.wedding.auth.service.AuthService;
import com.wedding.common.dto.response.ApiResponse;
import com.wedding.common.exception.UnauthorizedException;
import com.wedding.common.util.CookieUtils;
import com.wedding.config.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller cung cấp các endpoint xác thực người dùng: Đăng ký, Kích hoạt email,
 * Đăng nhập với HttpOnly Cookie, Làm mới token ngầm (Refresh Token Rotation), Đăng xuất
 * và truy vấn hồ sơ cá nhân.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean isCookieSecure;

    private static final String ACCESS_COOKIE_NAME = "access_token";
    private static final String REFRESH_COOKIE_NAME = "refresh_token";
    private static final String API_V1_PATH = "/api/v1";
    private static final String REFRESH_PATH = "/api/v1/auth/refresh";
    private static final long REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60L;

    /**
     * Tiếp nhận yêu cầu đăng ký tài khoản mới và gửi email xác thực.
     *
     * @param request Payload chứa email, mật khẩu và họ tên
     * @return ApiResponse thông báo thành công và thông tin User
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đăng ký tài khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.", response));
    }

    /**
     * Kích hoạt tài khoản người dùng qua mã token nhận từ liên kết email.
     *
     * @param token Chuỗi mã xác thực
     * @return ApiResponse thông báo kích hoạt thành công
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<UserResponse>> verifyEmail(@RequestParam("token") String token) {
        UserResponse response = authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Kích hoạt tài khoản thành công", response));
    }

    /**
     * Gửi lại liên kết kích hoạt tài khoản qua email.
     *
     * @param email Địa chỉ email cần gửi lại
     * @return ApiResponse thông báo đã gửi
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam("email") String email) {
        authService.resendVerification(email);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Liên kết kích hoạt mới đã được gửi tới email của bạn (nếu tài khoản tồn tại).", null));
    }

    /**
     * Xác thực thông tin đăng nhập và lưu Access Token, Refresh Token vào HttpOnly Cookie.
     *
     * @param request Payload chứa email và mật khẩu
     * @param response Đối tượng HttpServletResponse để thiết lập Set-Cookie
     * @return ApiResponse chứa hồ sơ người dùng
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthSessionResult session = authService.login(request);
        long accessMaxAgeSeconds = Math.max(1, session.expiresIn() / 1000);

        CookieUtils.addHttpOnlyCookie(response, ACCESS_COOKIE_NAME, session.accessToken(), accessMaxAgeSeconds, API_V1_PATH, isCookieSecure, "Lax");
        CookieUtils.addHttpOnlyCookie(response, REFRESH_COOKIE_NAME, session.refreshToken(), REFRESH_MAX_AGE_SECONDS, REFRESH_PATH, isCookieSecure, "Strict");

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Đăng nhập thành công", session.user()));
    }

    /**
     * Tự động làm mới Access Token và xoay vòng Refresh Token mới thông qua HttpOnly Cookie.
     *
     * @param request Đối tượng HttpServletRequest chứa Cookie refresh_token
     * @param response Đối tượng HttpServletResponse để thiết lập Cookie mới
     * @return ApiResponse chứa thông tin User
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<UserResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String rawRefreshToken = CookieUtils.getCookieValue(request, REFRESH_COOKIE_NAME)
                .orElseThrow(() -> new UnauthorizedException("Phiên làm việc không hợp lệ hoặc đã hết hạn"));

        AuthSessionResult session = authService.refreshToken(rawRefreshToken);
        long accessMaxAgeSeconds = Math.max(1, session.expiresIn() / 1000);

        CookieUtils.addHttpOnlyCookie(response, ACCESS_COOKIE_NAME, session.accessToken(), accessMaxAgeSeconds, API_V1_PATH, isCookieSecure, "Lax");
        CookieUtils.addHttpOnlyCookie(response, REFRESH_COOKIE_NAME, session.refreshToken(), REFRESH_MAX_AGE_SECONDS, REFRESH_PATH, isCookieSecure, "Strict");

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Làm mới phiên đăng nhập thành công", session.user()));
    }

    /**
     * Đăng xuất tài khoản, thu hồi Refresh Token trong DB và xóa toàn bộ HttpOnly Cookie trên trình duyệt.
     *
     * @param request Đối tượng HttpServletRequest
     * @param response Đối tượng HttpServletResponse
     * @return ApiResponse thông báo thành công
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        CookieUtils.getCookieValue(request, REFRESH_COOKIE_NAME).ifPresent(authService::logout);
        CookieUtils.deleteCookie(response, ACCESS_COOKIE_NAME, API_V1_PATH);
        CookieUtils.deleteCookie(response, REFRESH_COOKIE_NAME, REFRESH_PATH);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Đăng xuất thành công", null));
    }

    /**
     * Lấy thông tin hồ sơ của tài khoản đang đăng nhập.
     *
     * @param principal UserPrincipal đã được giải mã từ JWT
     * @return ApiResponse chứa UserResponse
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            throw new UnauthorizedException("Yêu cầu đăng nhập");
        }
        UserResponse response = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Cập nhật mật khẩu mới cho tài khoản người dùng đang đăng nhập.
     *
     * @param principal UserPrincipal xác thực
     * @param request Payload mật khẩu cũ và mới
     * @return ApiResponse thông báo thành công
     */
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (principal == null) {
            throw new UnauthorizedException("Yêu cầu đăng nhập");
        }
        authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Đổi mật khẩu thành công", null));
    }
}
