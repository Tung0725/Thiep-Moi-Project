package com.wedding.admin.controller;

import com.wedding.admin.dto.request.UpdateInvitationStatusRequest;
import com.wedding.admin.dto.response.AdminInvitationResponse;
import com.wedding.admin.service.AdminInvitationService;
import com.wedding.common.dto.response.ApiResponse;
import com.wedding.invitation.entity.InvitationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản trị toàn bộ thiệp mời trong hệ thống (tìm kiếm, lọc, đổi trạng thái và xóa an toàn).
 * Yêu cầu quyền ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin/invitations")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminInvitationController {

    private static final int MAX_PAGE_SIZE = 50;

    private final AdminInvitationService adminInvitationService;

    /**
     * Lấy danh sách thiệp mời toàn hệ thống có lọc và phân trang.
     *
     * @param search     Từ khóa tìm theo slug, tên dâu rể, tiêu đề hoặc email chủ thiệp (tùy chọn)
     * @param status     Trạng thái thiệp cần lọc (tùy chọn)
     * @param templateId Mã mẫu thiệp cần lọc (tùy chọn)
     * @param page       Chỉ số trang (mặc định 0)
     * @param size       Kích thước trang (mặc định 20, giới hạn 1..50)
     * @return ApiResponse chứa Page&lt;AdminInvitationResponse&gt;
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminInvitationResponse>>> listInvitations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InvitationStatus status,
            @RequestParam(required = false) String templateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<AdminInvitationResponse> invitations = adminInvitationService.listInvitations(search, status, templateId, pageable);
        return ResponseEntity.ok(ApiResponse.success(200, "Lấy danh sách thiệp mời thành công", invitations));
    }

    /**
     * Đổi trạng thái thiệp mời (DRAFT, PUBLISHED, ARCHIVED).
     *
     * @param id      ID thiệp mời
     * @param request Payload chứa trạng thái mới
     * @return ApiResponse chứa AdminInvitationResponse sau cập nhật
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminInvitationResponse>> updateInvitationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvitationStatusRequest request
    ) {
        AdminInvitationResponse updated = adminInvitationService.updateInvitationStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật trạng thái thiệp mời thành công", updated));
    }

    /**
     * Xóa cứng thiệp mời cùng toàn bộ lời chúc đi kèm. Luôn trả về HTTP 200 kèm ApiResponse&lt;Void&gt;.
     *
     * @param id ID thiệp mời cần xóa
     * @return ApiResponse&lt;Void&gt; xác nhận xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvitation(@PathVariable Long id) {
        adminInvitationService.deleteInvitation(id);
        return ResponseEntity.ok(ApiResponse.success(200, "Xóa thiệp mời thành công", null));
    }
}
