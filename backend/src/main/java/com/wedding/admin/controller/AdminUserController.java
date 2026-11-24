package com.wedding.admin.controller;

import com.wedding.admin.dto.request.UpdateUserRoleRequest;
import com.wedding.admin.dto.request.UpdateUserStatusRequest;
import com.wedding.admin.dto.response.AdminUserResponse;
import com.wedding.admin.service.AdminUserService;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.UserStatus;
import com.wedding.common.dto.response.ApiResponse;
import com.wedding.config.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controller quản trị tài khoản người dùng (tìm kiếm, lọc, khóa/mở khóa và phân quyền).
 * Yêu cầu quyền ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private static final int MAX_PAGE_SIZE = 50;

    private final AdminUserService adminUserService;

    /**
     * Lấy danh sách người dùng có lọc và phân trang cho màn hình quản trị.
     *
     * @param search Từ khóa tìm theo email hoặc họ tên (tùy chọn)
     * @param role   Lọc theo vai trò (tùy chọn)
     * @param status Lọc theo trạng thái (tùy chọn)
     * @param page   Chỉ số trang (mặc định 0)
     * @param size   Kích thước trang (mặc định 20, giới hạn 1..50)
     * @return ApiResponse chứa Page&lt;AdminUserResponse&gt;
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<AdminUserResponse> users = adminUserService.listUsers(search, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(200, "Lấy danh sách người dùng thành công", users));
    }

    /**
     * Khóa hoặc mở khóa tài khoản người dùng (ACTIVE hoặc LOCKED).
     *
     * @param id        UUID của tài khoản cần cập nhật
     * @param request   Payload chứa trạng thái mới
     * @param principal Thông tin quản trị viên đang đăng nhập
     * @return ApiResponse chứa AdminUserResponse sau cập nhật
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentAdminId = principal != null ? principal.getId() : null;
        AdminUserResponse updated = adminUserService.updateUserStatus(id, request.getStatus(), currentAdminId);
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật trạng thái người dùng thành công", updated));
    }

    /**
     * Thay đổi vai trò tài khoản người dùng giữa ROLE_USER và ROLE_ADMIN.
     *
     * @param id        UUID của tài khoản cần cập nhật
     * @param request   Payload chứa vai trò mới
     * @param principal Thông tin quản trị viên đang đăng nhập
     * @return ApiResponse chứa AdminUserResponse sau cập nhật
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentAdminId = principal != null ? principal.getId() : null;
        AdminUserResponse updated = adminUserService.updateUserRole(id, request.getRole(), currentAdminId);
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật vai trò người dùng thành công", updated));
    }
}
