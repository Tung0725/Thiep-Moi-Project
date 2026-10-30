package com.wedding.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wedding.auth.dto.request.ChangePasswordRequest;
import com.wedding.auth.dto.request.LoginRequest;
import com.wedding.auth.dto.request.RegisterRequest;
import com.wedding.auth.dto.response.AuthSessionResult;
import com.wedding.auth.dto.response.UserResponse;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.service.AuthService;
import com.wedding.common.exception.ConflictException;
import com.wedding.common.exception.GlobalExceptionHandler;
import com.wedding.common.exception.UnauthorizedException;
import com.wedding.config.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    private final UUID testUserId = UUID.randomUUID();
    private final UserPrincipal mockPrincipal = new UserPrincipal(testUserId, "test@example.com", "ROLE_USER");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                    }

                    @Override
                    public Object resolveArgument(MethodParameter parameter,
                                                  ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest,
                                                  WebDataBinderFactory binderFactory) {
                        return mockPrincipal;
                    }
                })
                .build();
    }

    @Test
    @DisplayName("POST /auth/register - Đăng ký thành công trả về 201 Created và thông tin user")
    void register_ValidRequest_Returns201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newuser@example.com")
                .password("Password123")
                .fullName("Nguyễn Văn A")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("newuser@example.com")
                .fullName("Nguyễn Văn A")
                .role(Role.ROLE_USER)
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .createdAt(Instant.now())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(userResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản."))
                .andExpect(jsonPath("$.data.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.data.status").value("PENDING_VERIFICATION"));
    }

    @Test
    @DisplayName("POST /auth/register - Thất bại khi email không đúng định dạng trả về 400 Bad Request")
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("invalid-email")
                .password("Password123")
                .fullName("Nguyễn Văn A")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("POST /auth/register - Trùng email trả về 409 Conflict")
    void register_DuplicateEmail_Returns409() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate@example.com")
                .password("Password123")
                .fullName("Nguyễn Văn A")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new ConflictException("Email này đã được sử dụng"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("Email này đã được sử dụng"));
    }

    @Test
    @DisplayName("POST /auth/login - Đăng nhập đúng trả về 200 OK và thiết lập HttpOnly Cookie")
    void login_Success_Returns200() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(testUserId)
                .email("test@example.com")
                .fullName("Nguyễn Văn A")
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .createdAt(Instant.now())
                .build();

        AuthSessionResult sessionResult = new AuthSessionResult(
                "mock_access_token",
                "mock_refresh_token",
                900000L,
                userResponse
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(sessionResult);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().httpOnly("access_token", true))
                .andExpect(cookie().exists("refresh_token"))
                .andExpect(cookie().httpOnly("refresh_token", true));
    }

    @Test
    @DisplayName("POST /auth/login - Sai mật khẩu trả về 401 Unauthorized")
    void login_WrongPassword_Returns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("WrongPassword")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("GET /auth/me - Lấy hồ sơ tài khoản hiện tại trả về 200 OK")
    void getCurrentUser_Returns200() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .id(testUserId)
                .email("test@example.com")
                .fullName("Chủ Thiệp")
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .createdAt(Instant.now())
                .build();

        when(authService.getCurrentUser(testUserId)).thenReturn(userResponse);

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.email").value("test@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Chủ Thiệp"));
    }

    @Test
    @DisplayName("PUT /auth/password - Đổi mật khẩu thành công trả về 200 OK")
    void changePassword_Success_Returns200() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword123")
                .newPassword("NewPassword456")
                .build();

        doNothing().when(authService).changePassword(eq(testUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(put("/auth/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Đổi mật khẩu thành công"));
    }
}
