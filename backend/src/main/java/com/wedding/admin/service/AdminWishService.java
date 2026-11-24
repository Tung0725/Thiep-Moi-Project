package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminWishResponse;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.entity.Invitation;
import com.wedding.wish.entity.AttendanceStatus;
import com.wedding.wish.entity.Wish;
import com.wedding.wish.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Service xử lý nghiệp vụ kiểm duyệt lời chúc và phản hồi tham dự (RSVP) toàn hệ thống.
 */
@Service
@RequiredArgsConstructor
public class AdminWishService {

    private final WishRepository wishRepository;

    /**
     * Liệt kê danh sách lời chúc toàn hệ thống có lọc theo từ khóa, trạng thái tham dự và ID thiệp.
     *
     * @param search           Từ khóa tìm theo tên khách, nội dung lời chúc hoặc slug thiệp
     * @param attendanceStatus Trạng thái tham dự cần lọc (tùy chọn)
     * @param invitationId     ID thiệp mời cần lọc (tùy chọn)
     * @param pageable         Cấu hình phân trang
     * @return Trang dữ liệu AdminWishResponse
     */
    @Transactional(readOnly = true)
    public Page<AdminWishResponse> listWishes(
            String search,
            AttendanceStatus attendanceStatus,
            Long invitationId,
            Pageable pageable
    ) {
        String searchPattern = buildSearchPattern(search);
        return wishRepository.searchForAdmin(searchPattern, attendanceStatus, invitationId, pageable)
                .map(this::toResponse);
    }

    /**
     * Xóa lời chúc vi phạm hoặc spam theo ID.
     *
     * @param id ID lời chúc cần xóa
     */
    @Transactional
    public void deleteWish(Long id) {
        Wish wish = wishRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lời chúc yêu cầu."));

        wishRepository.delete(wish);
    }

    private String buildSearchPattern(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }
        return "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private AdminWishResponse toResponse(Wish wish) {
        Invitation invitation = wish.getInvitation();
        return AdminWishResponse.builder()
                .id(wish.getId())
                .invitationId(invitation != null ? invitation.getId() : null)
                .invitationSlug(invitation != null ? invitation.getSlug() : null)
                .invitationTitle(invitation != null ? invitation.getTitle() : null)
                .guestName(wish.getGuestName())
                .attendanceStatus(wish.getAttendanceStatus())
                .guestCount(wish.getGuestCount())
                .message(wish.getMessage())
                .createdAt(wish.getCreatedAt())
                .build();
    }
}
