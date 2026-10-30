package com.wedding.invitation.controller;

import com.wedding.common.dto.response.ApiResponse;
import com.wedding.config.UserPrincipal;
import com.wedding.invitation.dto.request.QuickCreateInvitationRequest;
import com.wedding.invitation.dto.response.InvitationResponse;
import com.wedding.invitation.dto.response.PublicCardResponse;
import com.wedding.invitation.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cung cấp các API công khai cho khách xem thiệp và tạo thiệp nhanh từ Landing Page.
 * Mọi endpoint đều không bắt buộc phải đăng nhập trước (hỗ trợ trải nghiệm guest mượt mà).
 */
@RestController
@RequestMapping("/public/invitations")
@RequiredArgsConstructor
public class PublicInvitationController {

    private final InvitationService invitationService;

    /**
     * Tạo thiệp cưới nhanh từ thông tin dâu rể tùy biến trên Landing Page.
     *
     * @param request Payload chứa thông tin đám cưới và toàn bộ JSON Schema
     * @param principal Thông tin tài khoản đăng nhập (nếu khách đã đăng nhập)
     * @return ApiResponse chứa đường link thiệp /t/{slug} vừa tạo
     */
    @PostMapping("/quick-create")
    public ResponseEntity<ApiResponse<InvitationResponse>> quickCreateInvitation(
            @Valid @RequestBody QuickCreateInvitationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        java.util.UUID userId = (principal != null) ? principal.getId() : null;
        InvitationResponse response = invitationService.createQuickInvitation(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<InvitationResponse>builder()
                        .code(HttpStatus.CREATED.value())
                        .message("Khởi tạo thiệp mời thành công!")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy dữ liệu công khai của thiệp cưới qua slug để render lên màn hình khách mời.
     *
     * @param slug Chuỗi slug duy nhất của thiệp mời
     * @return ApiResponse chứa Schema thiệp và thông tin tiệc cưới
     */
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PublicCardResponse>> getPublicInvitation(@PathVariable String slug) {
        PublicCardResponse card = invitationService.getPublicCardBySlug(slug);

        return ResponseEntity.ok(
                ApiResponse.<PublicCardResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Lấy thông tin thiệp mời thành công!")
                        .data(card)
                        .build()
        );
    }
}
