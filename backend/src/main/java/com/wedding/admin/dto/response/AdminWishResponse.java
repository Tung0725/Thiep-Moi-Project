package com.wedding.admin.dto.response;

import com.wedding.wish.entity.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Thông tin lời chúc và phản hồi RSVP toàn hệ thống phục vụ kiểm duyệt quản trị.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWishResponse {

    private Long id;
    private Long invitationId;
    private String invitationSlug;
    private String invitationTitle;
    private String guestName;
    private AttendanceStatus attendanceStatus;
    private Integer guestCount;
    private String message;
    private Instant createdAt;
}
