package com.wedding.admin.controller;

import com.wedding.admin.dto.response.AdminWishResponse;
import com.wedding.admin.service.AdminWishService;
import com.wedding.common.dto.response.ApiResponse;
import com.wedding.wish.entity.AttendanceStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller kiểm duyệt lời chúc và phản hồi tham dự (RSVP) toàn hệ thống.
 * Yêu cầu quyền ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin/wishes")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminWishController {

    private static final int MAX_PAGE_SIZE = 50;

    private final AdminWishService adminWishService;

    /**
     * Lấy danh sách lời chúc toàn hệ thống có lọc theo từ khóa, trạng thái tham dự và ID thiệp.
     *
     * @param search           Từ khóa tìm theo tên khách, nội dung lời chúc hoặc slug thiệp (tùy chọn)
     * @param attendanceStatus Lọc theo trạng thái tham dự (tùy chọn)
     * @param invitationId     Lọc theo ID thiệp mời cụ thể (tùy chọn)
     * @param page             Chỉ số trang (mặc định 0)
     * @param size             Kích thước trang (mặc định 20, giới hạn 1..50)
     * @return ApiResponse chứa Page&lt;AdminWishResponse&gt;
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminWishResponse>>> listWishes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AttendanceStatus attendanceStatus,
            @RequestParam(required = false) Long invitationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<AdminWishResponse> wishes = adminWishService.listWishes(search, attendanceStatus, invitationId, pageable);
        return ResponseEntity.ok(ApiResponse.success(200, "Lấy danh sách lời chúc thành công", wishes));
    }

    /**
     * Xóa lời chúc spam hoặc vi phạm theo ID. Luôn trả về HTTP 200 kèm ApiResponse&lt;Void&gt;.
     *
     * @param id ID lời chúc cần xóa
     * @return ApiResponse&lt;Void&gt; xác nhận xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWish(@PathVariable Long id) {
        adminWishService.deleteWish(id);
        return ResponseEntity.ok(ApiResponse.success(200, "Xóa lời chúc thành công", null));
    }
}
