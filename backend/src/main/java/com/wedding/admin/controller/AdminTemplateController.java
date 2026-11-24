package com.wedding.admin.controller;

import com.wedding.admin.dto.request.AdminUpdateTemplateMetaRequest;
import com.wedding.admin.dto.request.UpdateTemplateStatusRequest;
import com.wedding.admin.dto.response.AdminTemplateResponse;
import com.wedding.admin.service.AdminTemplateService;
import com.wedding.common.dto.response.ApiResponse;
import com.wedding.template.entity.TemplateStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản trị kho mẫu thiệp cưới (xem mọi trạng thái, đổi trạng thái nhanh và cập nhật metadata).
 * Yêu cầu quyền ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin/templates")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminTemplateController {

    private static final int MAX_PAGE_SIZE = 50;

    private final AdminTemplateService adminTemplateService;

    /**
     * Lấy danh sách mẫu thiệp cưới ở tất cả trạng thái có lọc và phân trang.
     *
     * @param search   Từ khóa tìm theo code hoặc title (tùy chọn)
     * @param status   Trạng thái mẫu cần lọc (tùy chọn)
     * @param category Danh mục mẫu cần lọc (tùy chọn)
     * @param page     Chỉ số trang (mặc định 0)
     * @param size     Kích thước trang (mặc định 20, giới hạn 1..50)
     * @return ApiResponse chứa Page&lt;AdminTemplateResponse&gt;
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminTemplateResponse>>> listTemplates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TemplateStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<AdminTemplateResponse> templates = adminTemplateService.listTemplates(search, status, category, pageable);
        return ResponseEntity.ok(ApiResponse.success(200, "Lấy danh sách mẫu thiệp thành công", templates));
    }

    /**
     * Đổi nhanh trạng thái hiển thị của mẫu thiệp (DRAFT, PUBLISHED, ARCHIVED).
     *
     * @param id      ID mẫu thiệp
     * @param request Payload chứa trạng thái mới
     * @return ApiResponse chứa AdminTemplateResponse sau cập nhật
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> updateTemplateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTemplateStatusRequest request
    ) {
        AdminTemplateResponse updated = adminTemplateService.updateTemplateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật trạng thái mẫu thiệp thành công", updated));
    }

    /**
     * Cập nhật metadata quản trị của mẫu thiệp, giữ nguyên contentSchema và defaultData.
     *
     * @param id      ID mẫu thiệp
     * @param request Payload chứa metadata cần cập nhật
     * @return ApiResponse chứa AdminTemplateResponse sau cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> updateTemplateMeta(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateTemplateMetaRequest request
    ) {
        AdminTemplateResponse updated = adminTemplateService.updateTemplateMeta(id, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật thông tin mẫu thiệp thành công", updated));
    }
}
