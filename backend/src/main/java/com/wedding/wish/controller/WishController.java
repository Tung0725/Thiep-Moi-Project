package com.wedding.wish.controller;

import com.wedding.common.dto.response.ApiResponse;
import com.wedding.wish.dto.request.SubmitWishRequest;
import com.wedding.wish.dto.response.WishResponseDto;
import com.wedding.wish.service.WishService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cung cấp các API công khai cho khách mời gửi lời chúc mừng,
 * xác nhận tham dự tiệc cưới (RSVP) và xem sổ lưu bút trên trang thiệp (/t/{slug}).
 */
@RestController
@RequestMapping("/public/invitations/{slug}/wishes")
@RequiredArgsConstructor
public class WishController {

    private static final int MAX_PAGE_SIZE = 50;

    private final WishService wishService;

    /**
     * Gửi xác nhận tham dự tiệc cưới (RSVP) và lời chúc mừng tới cô dâu chú rể.
     * Endpoint công khai, không yêu cầu khách mời đăng nhập.
     *
     * @param slug    Đường dẫn định danh công khai của thiệp mời
     * @param request Payload chứa tên khách, trạng thái tham dự, số người và lời chúc
     * @return ApiResponse chứa thông tin lời chúc vừa tạo kèm mã 201 Created
     */
    @PostMapping
    public ResponseEntity<ApiResponse<WishResponseDto>> submitWish(
            @PathVariable String slug,
            @Valid @RequestBody SubmitWishRequest request
    ) {
        WishResponseDto created = wishService.submitWish(slug, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<WishResponseDto>builder()
                        .code(HttpStatus.CREATED.value())
                        .message("Gửi lời chúc và xác nhận tham dự thành công!")
                        .data(created)
                        .build()
        );
    }

    /**
     * Lấy danh sách lời chúc của thiệp mời theo phân trang (mới nhất xếp đầu).
     * Endpoint công khai phục vụ hiển thị Sổ lưu bút trên thiệp.
     *
     * @param slug Đường dẫn định danh công khai của thiệp mời
     * @param page Chỉ số trang (bắt đầu từ 0)
     * @param size Số lượng lời chúc mỗi trang (tối đa 50)
     * @return ApiResponse chứa trang dữ liệu lời chúc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<WishResponseDto>>> getWishes(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<WishResponseDto> wishesPage = wishService.getWishesBySlug(slug, pageable);

        return ResponseEntity.ok(
                ApiResponse.<Page<WishResponseDto>>builder()
                        .code(HttpStatus.OK.value())
                        .message("Lấy danh sách lời chúc thành công!")
                        .data(wishesPage)
                        .build()
        );
    }
}
