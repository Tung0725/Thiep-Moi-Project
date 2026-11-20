package com.wedding.wish.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO nhận dữ liệu xác nhận tham dự tiệc cưới (RSVP) và lời chúc từ khách mời.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitWishRequest {

    @NotBlank(message = "Tên khách mời không được để trống")
    @Size(max = 100, message = "Tên khách mời tối đa 100 ký tự")
    private String guestName;

    @NotBlank(message = "Trạng thái tham dự không được để trống")
    @Pattern(
            regexp = "ATTENDING|DECLINED|MAYBE",
            message = "Trạng thái tham dự chỉ chấp nhận ATTENDING, DECLINED hoặc MAYBE"
    )
    private String attendanceStatus;

    @Min(value = 0, message = "Số người tham dự không hợp lệ")
    @Max(value = 10, message = "Số người đi cùng tối đa là 10")
    private Integer guestCount;

    @Size(max = 500, message = "Lời chúc không vượt quá 500 ký tự")
    private String message;
}
