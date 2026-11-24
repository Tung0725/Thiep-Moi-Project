package com.wedding.wish.service;

import com.wedding.common.exception.AppException;
import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.invitation.repository.InvitationRepository;
import com.wedding.wish.dto.request.SubmitWishRequest;
import com.wedding.wish.dto.response.WishResponseDto;
import com.wedding.wish.entity.AttendanceStatus;
import com.wedding.wish.entity.Wish;
import com.wedding.wish.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý nghiệp vụ tương tác khách mời: lưu lời chúc mừng,
 * xác nhận tham dự tiệc cưới (RSVP) và truy vấn sổ lưu bút theo phân trang.
 */
@Service
@RequiredArgsConstructor
public class WishService {

    private final WishRepository wishRepository;
    private final InvitationRepository invitationRepository;

    /**
     * Ghi nhận phản hồi tham dự tiệc cưới (RSVP) và lời chúc mới từ khách mời.
     * Tự động chuẩn hóa số lượng khách đi cùng về 0 nếu khách báo bận (DECLINED).
     *
     * @param slug    Đường dẫn định danh công khai của thiệp mời
     * @param request Thông tin khách mời, trạng thái tham dự, số người đi cùng và lời chúc
     * @return WishResponseDto chứa dữ liệu lời chúc vừa lưu
     */
    @Transactional
    public WishResponseDto submitWish(String slug, SubmitWishRequest request) {
        Invitation invitation = findPublishedInvitationOrThrow(slug);

        AttendanceStatus status = AttendanceStatus.valueOf(request.getAttendanceStatus());
        int normalizedGuestCount = resolveGuestCount(status, request.getGuestCount());
        String trimmedMessage = (request.getMessage() != null && !request.getMessage().isBlank())
                ? request.getMessage().trim()
                : null;

        Wish wish = Wish.builder()
                .invitation(invitation)
                .guestName(request.getGuestName().trim())
                .attendanceStatus(status)
                .guestCount(normalizedGuestCount)
                .message(trimmedMessage)
                .build();

        Wish saved = wishRepository.save(wish);
        return toDto(saved);
    }

    /**
     * Truy xuất danh sách lời chúc của một thiệp mời theo thứ tự thời gian mới nhất.
     *
     * @param slug     Đường dẫn định danh công khai của thiệp mời
     * @param pageable Cấu hình phân trang (page, size)
     * @return Trang dữ liệu WishResponseDto
     */
    @Transactional(readOnly = true)
    public Page<WishResponseDto> getWishesBySlug(String slug, Pageable pageable) {
        Invitation invitation = findPublishedInvitationOrThrow(slug);

        return wishRepository
                .findByInvitationIdOrderByCreatedAtDesc(invitation.getId(), pageable)
                .map(this::toDto);
    }

    private Invitation findPublishedInvitationOrThrow(String slug) {
        Invitation invitation = invitationRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời với đường dẫn yêu cầu."));

        if (invitation.getStatus() != InvitationStatus.PUBLISHED) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời với đường dẫn yêu cầu.");
        }
        return invitation;
    }

    private int resolveGuestCount(AttendanceStatus status, Integer requestedCount) {
        if (status == AttendanceStatus.DECLINED) {
            return 0;
        }
        if (requestedCount == null || requestedCount < 1) {
            return 1;
        }
        return requestedCount;
    }

    private WishResponseDto toDto(Wish wish) {
        return WishResponseDto.builder()
                .id(wish.getId())
                .guestName(wish.getGuestName())
                .attendanceStatus(wish.getAttendanceStatus())
                .guestCount(wish.getGuestCount())
                .message(wish.getMessage())
                .createdAt(wish.getCreatedAt())
                .build();
    }
}
