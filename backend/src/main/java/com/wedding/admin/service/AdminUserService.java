package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminUserResponse;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.RefreshTokenRepository;
import com.wedding.auth.repository.UserRepository;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý nghiệp vụ quản trị tài khoản người dùng:
 * tìm kiếm/lọc phân trang, khóa/mở khóa tài khoản và phân quyền ROLE_USER/ROLE_ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Liệt kê danh sách người dùng theo phân trang với bộ lọc tìm kiếm, vai trò và trạng thái.
     * Sử dụng truy vấn group-by theo lô để tránh lỗi N+1 khi đếm số thiệp mời.
     *
     * @param search   Từ khóa tìm kiếm không phân biệt hoa thường theo email hoặc họ tên
     * @param role     Bộ lọc vai trò (tùy chọn)
     * @param status   Bộ lọc trạng thái (tùy chọn)
     * @param pageable Cấu hình phân trang
     * @return Trang dữ liệu AdminUserResponse
     */
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> listUsers(String search, Role role, UserStatus status, Pageable pageable) {
        String searchPattern = buildSearchPattern(search);
        Page<User> usersPage = userRepository.searchForAdmin(searchPattern, role, status, pageable);

        Map<UUID, Long> invitationCountMap = loadInvitationCountMap(usersPage.getContent());
        return usersPage.map(user -> toResponse(user, invitationCountMap.getOrDefault(user.getId(), 0L)));
    }

    /**
     * Khóa hoặc mở khóa tài khoản người dùng (ACTIVE hoặc LOCKED).
     * Chặn tự khóa chính mình, chặn khóa quản trị viên hoạt động cuối cùng và thu hồi refresh token khi khóa.
     *
     * @param targetUserId   ID người dùng cần thay đổi trạng thái
     * @param newStatus      Trạng thái mới (chỉ chấp nhận ACTIVE hoặc LOCKED)
     * @param currentAdminId ID quản trị viên đang thực hiện thao tác
     * @return AdminUserResponse sau khi cập nhật
     */
    @Transactional
    public AdminUserResponse updateUserStatus(UUID targetUserId, UserStatus newStatus, UUID currentAdminId) {
        if (newStatus == UserStatus.PENDING_VERIFICATION) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể chuyển trạng thái tài khoản về PENDING_VERIFICATION.");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng yêu cầu."));

        if (newStatus == UserStatus.LOCKED) {
            if (user.getId().equals(currentAdminId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể tự khóa tài khoản của chính mình.");
            }
            if (user.getRole() == Role.ROLE_ADMIN
                    && user.getStatus() == UserStatus.ACTIVE
                    && userRepository.countByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.ACTIVE) <= 1) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể khóa tài khoản quản trị viên đang hoạt động cuối cùng.");
            }
        }

        user.setStatus(newStatus);
        User saved = userRepository.save(user);

        if (newStatus == UserStatus.LOCKED) {
            refreshTokenRepository.revokeAllByUser(saved);
        }

        long invitationCount = invitationRepository.countByUserId(saved.getId());
        return toResponse(saved, invitationCount);
    }

    /**
     * Thay đổi vai trò của người dùng giữa ROLE_USER và ROLE_ADMIN.
     * Chặn tự hạ quyền chính mình, chặn hạ quyền quản trị viên hoạt động cuối cùng và thu hồi refresh token khi hạ quyền.
     *
     * @param targetUserId   ID người dùng cần thay đổi vai trò
     * @param newRole        Vai trò mới
     * @param currentAdminId ID quản trị viên đang thực hiện thao tác
     * @return AdminUserResponse sau khi cập nhật
     */
    @Transactional
    public AdminUserResponse updateUserRole(UUID targetUserId, Role newRole, UUID currentAdminId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng yêu cầu."));

        Role previousRole = user.getRole();
        if (newRole == Role.ROLE_USER) {
            if (user.getId().equals(currentAdminId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể tự hạ quyền quản trị của chính mình.");
            }
            if (previousRole == Role.ROLE_ADMIN
                    && user.getStatus() == UserStatus.ACTIVE
                    && userRepository.countByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.ACTIVE) <= 1) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể hạ quyền tài khoản quản trị viên đang hoạt động cuối cùng.");
            }
        }

        user.setRole(newRole);
        User saved = userRepository.save(user);

        if (previousRole == Role.ROLE_ADMIN && newRole == Role.ROLE_USER) {
            refreshTokenRepository.revokeAllByUser(saved);
        }

        long invitationCount = invitationRepository.countByUserId(saved.getId());
        return toResponse(saved, invitationCount);
    }

    private Map<UUID, Long> loadInvitationCountMap(List<User> users) {
        if (users.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UUID> userIds = users.stream().map(User::getId).toList();
        Map<UUID, Long> counts = new HashMap<>();
        for (Object[] row : invitationRepository.countGroupByUserIdIn(userIds)) {
            counts.put((UUID) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private String buildSearchPattern(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }
        return "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private AdminUserResponse toResponse(User user, long invitationCount) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .invitationCount(invitationCount)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
