package com.wedding.template.controller;

import com.wedding.common.dto.response.ApiResponse;
import com.wedding.template.dto.request.CloneTemplateRequest;
import com.wedding.template.dto.request.CreateTemplateRequest;
import com.wedding.template.dto.request.UpdateTemplateRequest;
import com.wedding.template.dto.response.TemplateDetailResponse;
import com.wedding.template.dto.response.TemplateSummaryResponse;
import com.wedding.template.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller quản lý toàn bộ các API mẫu thiệp cưới phục vụ hiển thị kho mẫu,
 * xem thử chi tiết, sáng tạo mẫu mới và nhân bản (clone) mẫu từ Studio.
 */
@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    /**
     * Lấy danh sách mẫu thiệp cưới công khai cho Landing Page và Kho Mẫu.
     *
     * @param category Phân loại danh mục (tùy chọn)
     * @return ApiResponse danh sách TemplateSummaryResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateSummaryResponse>>> getTemplates(
            @RequestParam(required = false) String category
    ) {
        List<TemplateSummaryResponse> templates = templateService.getAllTemplates(category);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    /**
     * Lấy toàn bộ chi tiết và cây JSON Schema của một mẫu theo code hoặc id.
     *
     * @param codeOrId Mã code (ví dụ: hb04-basic) hoặc ID số
     * @return ApiResponse chứa TemplateDetailResponse
     */
    @GetMapping("/{codeOrId}")
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> getTemplate(@PathVariable String codeOrId) {
        TemplateDetailResponse template = templateService.getTemplateByCodeOrId(codeOrId);
        return ResponseEntity.ok(ApiResponse.success(template));
    }

    /**
     * Khởi tạo một mẫu thiệp cưới mới từ Studio Editor.
     *
     * @param request Payload chứa thông tin mẫu và cây JSON Schema
     * @return ApiResponse chứa TemplateDetailResponse vừa tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request
    ) {
        TemplateDetailResponse response = templateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<TemplateDetailResponse>builder()
                        .code(HttpStatus.CREATED.value())
                        .message("Tạo mẫu thiệp thành công!")
                        .data(response)
                        .build()
        );
    }

    /**
     * Nhân bản một mẫu thiết kế có sẵn thành mẫu mới trong 1 click.
     *
     * @param id ID của mẫu gốc cần nhân bản
     * @param request Payload chứa mã mới và tên mới
     * @return ApiResponse chứa TemplateDetailResponse của mẫu bản sao
     */
    @PostMapping("/{id}/clone")
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> cloneTemplate(
            @PathVariable Long id,
            @Valid @RequestBody CloneTemplateRequest request
    ) {
        TemplateDetailResponse response = templateService.cloneTemplate(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<TemplateDetailResponse>builder()
                        .code(HttpStatus.CREATED.value())
                        .message("Nhân bản mẫu thiệp thành công!")
                        .data(response)
                        .build()
        );
    }

    /**
     * Cập nhật thông tin hoặc cây JSON Schema của mẫu thiệp từ Studio.
     *
     * @param id ID của mẫu thiệp cần cập nhật
     * @param request Payload chứa các thuộc tính sửa đổi
     * @return ApiResponse chứa TemplateDetailResponse đã cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTemplateRequest request
    ) {
        TemplateDetailResponse response = templateService.updateTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success(200, "Cập nhật mẫu thiệp thành công!", response));
    }
}
