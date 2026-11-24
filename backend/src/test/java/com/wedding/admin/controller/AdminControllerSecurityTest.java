package com.wedding.admin.controller;

import com.wedding.admin.dto.response.AdminDashboardStatsResponse;
import com.wedding.admin.dto.response.AdminInvitationResponse;
import com.wedding.admin.dto.response.AdminTemplateResponse;
import com.wedding.admin.dto.response.AdminUserResponse;
import com.wedding.admin.dto.response.AdminWishResponse;
import com.wedding.admin.service.AdminDashboardService;
import com.wedding.admin.service.AdminInvitationService;
import com.wedding.admin.service.AdminTemplateService;
import com.wedding.admin.service.AdminUserService;
import com.wedding.admin.service.AdminWishService;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.UserStatus;
import com.wedding.common.exception.GlobalExceptionHandler;
import com.wedding.config.JwtAuthenticationFilter;
import com.wedding.config.JwtTokenProvider;
import com.wedding.config.SecurityConfig;
import com.wedding.config.UserPrincipal;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.template.controller.TemplateController;
import com.wedding.template.entity.TemplateStatus;
import com.wedding.template.service.TemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = AdminControllerSecurityTest.TestConfig.class)
class AdminControllerSecurityTest {

    @Configuration
    @EnableWebMvc
    @Import({
            SecurityConfig.class,
            JwtAuthenticationFilter.class,
            GlobalExceptionHandler.class,
            AdminDashboardController.class,
            AdminUserController.class,
            AdminTemplateController.class,
            AdminInvitationController.class,
            AdminWishController.class,
            TemplateController.class
    })
    static class TestConfig {

        @Bean
        JwtTokenProvider jwtTokenProvider() {
            return Mockito.mock(JwtTokenProvider.class);
        }

        @Bean
        AdminDashboardService adminDashboardService() {
            return Mockito.mock(AdminDashboardService.class);
        }

        @Bean
        AdminUserService adminUserService() {
            return Mockito.mock(AdminUserService.class);
        }

        @Bean
        AdminTemplateService adminTemplateService() {
            return Mockito.mock(AdminTemplateService.class);
        }

        @Bean
        AdminInvitationService adminInvitationService() {
            return Mockito.mock(AdminInvitationService.class);
        }

        @Bean
        AdminWishService adminWishService() {
            return Mockito.mock(AdminWishService.class);
        }

        @Bean
        TemplateService templateService() {
            return Mockito.mock(TemplateService.class);
        }
    }

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminTemplateService adminTemplateService;

    @Autowired
    private AdminInvitationService adminInvitationService;

    @Autowired
    private AdminWishService adminWishService;

    @Autowired
    private TemplateService templateService;

    private MockMvc mockMvc;

    private final UUID adminId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        Mockito.reset(
                adminDashboardService,
                adminUserService,
                adminTemplateService,
                adminInvitationService,
                adminWishService,
                templateService
        );
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private UsernamePasswordAuthenticationToken authAs(UUID id, String email, String role) {
        UserPrincipal principal = new UserPrincipal(id, email, role);
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    @Test
    @DisplayName("GET /admin/dashboard/stats - Chưa đăng nhập trả 401 Unauthorized")
    void dashboardStats_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/admin/dashboard/stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("GET /admin/dashboard/stats - ROLE_USER bị chặn với 403 Forbidden")
    void dashboardStats_RoleUser_Returns403() throws Exception {
        mockMvc.perform(get("/admin/dashboard/stats")
                        .with(authentication(authAs(userId, "user@example.com", "ROLE_USER"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @DisplayName("GET /admin/dashboard/stats - ROLE_ADMIN truy cập thành công trả 200 OK")
    void dashboardStats_RoleAdmin_Returns200() throws Exception {
        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .users(AdminDashboardStatsResponse.UserStats.builder().total(10).active(8).locked(1).pendingVerification(1).admins(2).build())
                .templates(AdminDashboardStatsResponse.TemplateStats.builder().total(4).published(3).draft(1).archived(0).build())
                .invitations(AdminDashboardStatsResponse.InvitationStats.builder().total(12).published(10).draft(1).archived(1).build())
                .wishes(AdminDashboardStatsResponse.WishStats.builder().total(30).attending(20).declined(5).maybe(5).totalExpectedGuests(45).build())
                .recentInvitations(List.of())
                .recentUsers(List.of())
                .build();
        when(adminDashboardService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/admin/dashboard/stats")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.users.total").value(10))
                .andExpect(jsonPath("$.data.wishes.totalExpectedGuests").value(45));
    }

    @Test
    @DisplayName("GET /templates - Vẫn công khai (permitAll) theo quyết định D2 khi chưa đăng nhập")
    void publicTemplates_Unauthenticated_RemainsAccessible() throws Exception {
        when(templateService.getAllTemplates(null)).thenReturn(List.of());

        mockMvc.perform(get("/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("PATCH /admin/users/{id}/status - Thiếu trường status trả 400 Bad Request")
    void updateUserStatus_InvalidPayload_Returns400() throws Exception {
        mockMvc.perform(patch("/admin/users/{id}/status", userId)
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("GET /admin/users - Clamp page size về tối đa 50")
    void listUsers_ClampsPageSizeTo50() throws Exception {
        when(adminUserService.listUsers(eq(null), eq(null), eq(null), eq(PageRequest.of(0, 50))))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

        mockMvc.perform(get("/admin/users?page=-2&size=500")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(adminUserService).listUsers(null, null, null, PageRequest.of(0, 50));
    }

    @Test
    @DisplayName("PATCH /admin/users/{id}/role - ROLE_ADMIN cập nhật vai trò thành công")
    void updateUserRole_ValidRequest_Returns200() throws Exception {
        AdminUserResponse updated = AdminUserResponse.builder()
                .id(userId)
                .email("user@example.com")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        when(adminUserService.updateUserRole(userId, Role.ROLE_ADMIN, adminId)).thenReturn(updated);

        mockMvc.perform(patch("/admin/users/{id}/role", userId)
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("PUT /admin/templates/{id} - ROLE_ADMIN cập nhật metadata thành công")
    void updateTemplateMeta_ValidRequest_Returns200() throws Exception {
        AdminTemplateResponse response = AdminTemplateResponse.builder()
                .id(1L)
                .code("hb04-basic")
                .title("Mẫu Mới")
                .status(TemplateStatus.PUBLISHED)
                .build();
        when(adminTemplateService.updateTemplateMeta(eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/admin/templates/1")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Mẫu Mới\",\"status\":\"PUBLISHED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.title").value("Mẫu Mới"));
    }

    @Test
    @DisplayName("PATCH /admin/invitations/{id}/status - ROLE_ADMIN cập nhật trạng thái thiệp thành công")
    void updateInvitationStatus_ValidRequest_Returns200() throws Exception {
        AdminInvitationResponse response = AdminInvitationResponse.builder()
                .id(5L)
                .slug("nam-lan")
                .publicUrl("/t/nam-lan")
                .status(InvitationStatus.ARCHIVED)
                .build();
        when(adminInvitationService.updateInvitationStatus(5L, InvitationStatus.ARCHIVED)).thenReturn(response);

        mockMvc.perform(patch("/admin/invitations/5/status")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ARCHIVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
    }

    @Test
    @DisplayName("DELETE /admin/invitations/{id} - Trả HTTP 200 kèm ApiResponse<Void> (không phải 204)")
    void deleteInvitation_ReturnsHttp200WithApiResponse() throws Exception {
        doNothing().when(adminInvitationService).deleteInvitation(5L);

        mockMvc.perform(delete("/admin/invitations/5")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(adminInvitationService).deleteInvitation(5L);
    }

    @Test
    @DisplayName("GET /admin/wishes và DELETE /admin/wishes/{id} - Trả HTTP 200 với ApiResponse")
    void wishesEndpoints_RoleAdmin_ReturnsHttp200() throws Exception {
        AdminWishResponse wish = AdminWishResponse.builder()
                .id(11L)
                .invitationId(5L)
                .invitationSlug("nam-lan")
                .guestName("Khách A")
                .build();
        when(adminWishService.listWishes(null, null, null, PageRequest.of(0, 20)))
                .thenReturn(new PageImpl<>(List.of(wish), PageRequest.of(0, 20), 1));
        doNothing().when(adminWishService).deleteWish(11L);

        mockMvc.perform(get("/admin/wishes")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content[0].invitationSlug").value("nam-lan"));

        mockMvc.perform(delete("/admin/wishes/11")
                        .with(authentication(authAs(adminId, "admin@example.com", "ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").doesNotExist());

        verify(adminWishService).deleteWish(11L);
    }
}
