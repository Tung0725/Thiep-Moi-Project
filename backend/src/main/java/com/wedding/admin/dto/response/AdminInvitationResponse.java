package com.wedding.admin.dto.response;

import com.wedding.invitation.entity.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Thông tin thiệp mời hiển thị trong trang quản trị kèm thông tin chủ sở hữu và số lời chúc.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInvitationResponse {

    private Long id;
    private String slug;
    private String publicUrl;
    private String templateId;
    private String title;
    private String groomName;
    private String brideName;
    private String phoneNumber;
    private String eventDate;
    private String venueName;
    private InvitationStatus status;
    private UUID userId;
    private String ownerEmail;
    private String ownerFullName;
    private long wishCount;
    private Instant createdAt;
    private Instant updatedAt;
}
