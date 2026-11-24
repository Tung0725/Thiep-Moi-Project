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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishServiceTest {

    @Mock
    private WishRepository wishRepository;

    @Mock
    private InvitationRepository invitationRepository;

    @InjectMocks
    private WishService wishService;

    @Test
    @DisplayName("submitWish - Khách chọn ATTENDING đi 3 người lưu đúng guestCount = 3")
    void submitWish_AttendingWithGuestCount_SavesCorrectly() {
        Invitation invitation = Invitation.builder()
                .id(10L)
                .slug("van-bach-khanh-ly")
                .status(InvitationStatus.PUBLISHED)
                .build();

        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("  Gia đình Bác Hùng  ")
                .attendanceStatus("ATTENDING")
                .guestCount(3)
                .message("  Chúc hai cháu trăm năm hạnh phúc!  ")
                .build();

        when(invitationRepository.findBySlug("van-bach-khanh-ly")).thenReturn(Optional.of(invitation));
        when(wishRepository.save(any(Wish.class))).thenAnswer(invocation -> {
            Wish w = invocation.getArgument(0);
            w.setId(101L);
            w.setCreatedAt(Instant.now());
            return w;
        });

        WishResponseDto result = wishService.submitWish("van-bach-khanh-ly", request);

        assertEquals(101L, result.getId());
        assertEquals("Gia đình Bác Hùng", result.getGuestName());
        assertEquals(AttendanceStatus.ATTENDING, result.getAttendanceStatus());
        assertEquals(3, result.getGuestCount());
        assertEquals("Chúc hai cháu trăm năm hạnh phúc!", result.getMessage());
        assertNotNull(result.getCreatedAt());
    }

    @Test
    @DisplayName("submitWish - Khách chọn DECLINED tự động chuẩn hóa guestCount = 0 và cho phép message trống")
    void submitWish_Declined_NormalizesGuestCountToZero() {
        Invitation invitation = Invitation.builder()
                .id(10L)
                .slug("van-bach-khanh-ly")
                .status(InvitationStatus.PUBLISHED)
                .build();

        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("Bạn Minh")
                .attendanceStatus("DECLINED")
                .guestCount(5)
                .message("   ")
                .build();

        when(invitationRepository.findBySlug("van-bach-khanh-ly")).thenReturn(Optional.of(invitation));
        when(wishRepository.save(any(Wish.class))).thenAnswer(invocation -> {
            Wish w = invocation.getArgument(0);
            w.setId(102L);
            w.setCreatedAt(Instant.now());
            return w;
        });

        WishResponseDto result = wishService.submitWish("van-bach-khanh-ly", request);

        assertEquals(AttendanceStatus.DECLINED, result.getAttendanceStatus());
        assertEquals(0, result.getGuestCount());
        assertNull(result.getMessage());
    }

    @Test
    @DisplayName("submitWish - Slug không tồn tại ném AppException 404 NOT_FOUND")
    void submitWish_SlugNotFound_Throws404() {
        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("Khách A")
                .attendanceStatus("ATTENDING")
                .guestCount(1)
                .build();

        when(invitationRepository.findBySlug("slug-fake-123")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class,
                () -> wishService.submitWish("slug-fake-123", request));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    @DisplayName("getWishesBySlug - Trả về danh sách lời chúc phân trang theo thiệp")
    void getWishesBySlug_ValidSlug_ReturnsPage() {
        Invitation invitation = Invitation.builder()
                .id(10L)
                .slug("van-bach-khanh-ly")
                .status(InvitationStatus.PUBLISHED)
                .build();

        Wish wish = Wish.builder()
                .id(1L)
                .invitation(invitation)
                .guestName("Hội Bạn Đại Học")
                .attendanceStatus(AttendanceStatus.ATTENDING)
                .guestCount(2)
                .message("Chúc mừng hạnh phúc!")
                .createdAt(Instant.now())
                .build();

        PageRequest pageable = PageRequest.of(0, 10);
        when(invitationRepository.findBySlug("van-bach-khanh-ly")).thenReturn(Optional.of(invitation));
        when(wishRepository.findByInvitationIdOrderByCreatedAtDesc(10L, pageable))
                .thenReturn(new PageImpl<>(List.of(wish), pageable, 1));

        Page<WishResponseDto> page = wishService.getWishesBySlug("van-bach-khanh-ly", pageable);

        assertEquals(1, page.getTotalElements());
        assertEquals("Hội Bạn Đại Học", page.getContent().get(0).getGuestName());
        assertEquals(2, page.getContent().get(0).getGuestCount());
    }

    @Test
    @DisplayName("submitWish - Thiệp ở trạng thái ARCHIVED ném AppException 404 NOT_FOUND")
    void submitWish_ArchivedInvitation_Throws404() {
        Invitation archived = Invitation.builder()
                .id(10L)
                .slug("van-bach-khanh-ly")
                .status(InvitationStatus.ARCHIVED)
                .build();
        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("Khách A")
                .attendanceStatus("ATTENDING")
                .guestCount(1)
                .build();
        when(invitationRepository.findBySlug("van-bach-khanh-ly")).thenReturn(Optional.of(archived));

        AppException ex = assertThrows(AppException.class,
                () -> wishService.submitWish("van-bach-khanh-ly", request));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    @DisplayName("getWishesBySlug - Thiệp ở trạng thái DRAFT ném AppException 404 NOT_FOUND")
    void getWishesBySlug_DraftInvitation_Throws404() {
        Invitation draft = Invitation.builder()
                .id(10L)
                .slug("van-bach-khanh-ly")
                .status(InvitationStatus.DRAFT)
                .build();
        when(invitationRepository.findBySlug("van-bach-khanh-ly")).thenReturn(Optional.of(draft));

        AppException ex = assertThrows(AppException.class,
                () -> wishService.getWishesBySlug("van-bach-khanh-ly", PageRequest.of(0, 10)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
