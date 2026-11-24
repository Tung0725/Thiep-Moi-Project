package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminUserResponse;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.RefreshTokenRepository;
import com.wedding.auth.repository.UserRepository;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.repository.InvitationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test
    @DisplayName("listUsers - Gắn đúng invitationCount theo batch map không gây N+1")
    void listUsers_PopulatesBatchInvitationCounts() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .fullName("Nguyễn Văn A")
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        PageRequest pageable = PageRequest.of(0, 20);
        when(userRepository.searchForAdmin("%nguyen%", Role.ROLE_USER, UserStatus.ACTIVE, pageable))
                .thenReturn(new PageImpl<>(List.of(user), pageable, 1));
        when(invitationRepository.countGroupByUserIdIn(List.of(userId)))
                .thenReturn(List.<Object[]>of(new Object[]{userId, 4L}));

        Page<AdminUserResponse> result = adminUserService.listUsers("  NGUYEN ", Role.ROLE_USER, UserStatus.ACTIVE, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(4L, result.getContent().get(0).getInvitationCount());
        assertEquals("user@example.com", result.getContent().get(0).getEmail());
    }

    @Test
    @DisplayName("updateUserStatus - Từ chối chuyển về PENDING_VERIFICATION với mã 400")
    void updateUserStatus_PendingVerification_Throws400() {
        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserStatus(UUID.randomUUID(), UserStatus.PENDING_VERIFICATION, UUID.randomUUID()));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUserStatus - Chặn Admin tự khóa chính mình với mã 400")
    void updateUserStatus_SelfLock_Throws400() {
        UUID adminId = UUID.randomUUID();
        User admin = User.builder()
                .id(adminId)
                .email("admin@example.com")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserStatus(adminId, UserStatus.LOCKED, adminId));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(refreshTokenRepository, never()).revokeAllByUser(any());
    }

    @Test
    @DisplayName("updateUserStatus - Chặn khóa Admin đang hoạt động cuối cùng với mã 400")
    void updateUserStatus_LockLastActiveAdmin_Throws400() {
        UUID targetAdminId = UUID.randomUUID();
        UUID callerAdminId = UUID.randomUUID();
        User targetAdmin = User.builder()
                .id(targetAdminId)
                .email("last-admin@example.com")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(targetAdminId)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.ACTIVE)).thenReturn(1L);

        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserStatus(targetAdminId, UserStatus.LOCKED, callerAdminId));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUserStatus - Khóa tài khoản thường thành công và thu hồi toàn bộ refresh token")
    void updateUserStatus_LockNormalUser_RevokesTokens() {
        UUID userId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("normal@example.com")
                .fullName("Người dùng A")
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(invitationRepository.countByUserId(userId)).thenReturn(2L);

        AdminUserResponse response = adminUserService.updateUserStatus(userId, UserStatus.LOCKED, adminId);

        assertEquals(UserStatus.LOCKED, response.getStatus());
        assertEquals(2L, response.getInvitationCount());
        verify(refreshTokenRepository).revokeAllByUser(user);
    }

    @Test
    @DisplayName("updateUserRole - Chặn Admin tự hạ quyền chính mình với mã 400")
    void updateUserRole_SelfDemote_Throws400() {
        UUID adminId = UUID.randomUUID();
        User admin = User.builder()
                .id(adminId)
                .email("admin@example.com")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserRole(adminId, Role.ROLE_USER, adminId));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(refreshTokenRepository, never()).revokeAllByUser(any());
    }

    @Test
    @DisplayName("updateUserRole - Chặn hạ quyền Admin đang hoạt động cuối cùng với mã 400")
    void updateUserRole_DemoteLastActiveAdmin_Throws400() {
        UUID targetAdminId = UUID.randomUUID();
        UUID callerAdminId = UUID.randomUUID();
        User targetAdmin = User.builder()
                .id(targetAdminId)
                .email("admin@example.com")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(targetAdminId)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.ACTIVE)).thenReturn(1L);

        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserRole(targetAdminId, Role.ROLE_USER, callerAdminId));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUserRole - Hạ quyền Admin khác khi còn nhiều Admin sẽ thu hồi refresh token")
    void updateUserRole_DemoteOtherAdmin_RevokesTokens() {
        UUID targetAdminId = UUID.randomUUID();
        UUID callerAdminId = UUID.randomUUID();
        User targetAdmin = User.builder()
                .id(targetAdminId)
                .email("admin2@example.com")
                .fullName("Admin 2")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(targetAdminId)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.ACTIVE)).thenReturn(2L);
        when(userRepository.save(targetAdmin)).thenReturn(targetAdmin);
        when(invitationRepository.countByUserId(targetAdminId)).thenReturn(0L);

        AdminUserResponse response = adminUserService.updateUserRole(targetAdminId, Role.ROLE_USER, callerAdminId);

        assertEquals(Role.ROLE_USER, response.getRole());
        verify(refreshTokenRepository).revokeAllByUser(targetAdmin);
    }

    @Test
    @DisplayName("updateUserRole - Không tìm thấy user ném 404 NOT_FOUND")
    void updateUserRole_NotFound_Throws404() {
        UUID missingId = UUID.randomUUID();
        when(userRepository.findById(missingId)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class,
                () -> adminUserService.updateUserRole(missingId, Role.ROLE_ADMIN, UUID.randomUUID()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
