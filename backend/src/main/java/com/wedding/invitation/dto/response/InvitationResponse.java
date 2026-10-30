package com.wedding.invitation.dto.response;

import com.wedding.invitation.entity.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO phản hồi thông tin tổng quát sau khi khởi tạo hoặc cập nhật thiệp cưới.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {

    private Long id;
    private String slug;
    private String templateId;
    private String title;
    private String groomName;
    private String brideName;
    private String eventDate;
    private String venueName;
    private InvitationStatus status;
    private String publicUrl;
    private Instant createdAt;
}
