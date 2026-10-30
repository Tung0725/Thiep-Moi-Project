package com.wedding.invitation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload tiếp nhận thông tin khởi tạo thiệp cưới nhanh từ Landing Page.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuickCreateInvitationRequest {

    private String templateId;

    @NotBlank(message = "Tên chú rể không được để trống")
    private String groomName;

    @NotBlank(message = "Tên cô dâu không được để trống")
    private String brideName;

    private String phoneNumber;

    @NotBlank(message = "Ngày cưới không được để trống")
    private String eventDate;

    private String eventTime;

    @NotBlank(message = "Tên trung tâm tiệc cưới không được để trống")
    private String venueName;

    private String venueAddress;

    private String coverImageUrl;

    @NotBlank(message = "Cấu trúc Schema thiệp không được để trống")
    private String contentSchema;
}
