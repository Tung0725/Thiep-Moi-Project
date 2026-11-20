package com.wedding.wish.dto.response;

import com.wedding.wish.entity.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO trả về thông tin lời chúc và trạng thái tham dự của khách mời.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishResponseDto {

    private Long id;
    private String guestName;
    private AttendanceStatus attendanceStatus;
    private Integer guestCount;
    private String message;
    private Instant createdAt;
}
