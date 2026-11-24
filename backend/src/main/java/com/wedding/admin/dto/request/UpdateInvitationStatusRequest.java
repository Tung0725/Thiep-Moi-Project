package com.wedding.admin.dto.request;

import com.wedding.invitation.entity.InvitationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload cập nhật trạng thái của một thiệp mời (DRAFT, PUBLISHED, ARCHIVED).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInvitationStatusRequest {

    @NotNull(message = "Trạng thái thiệp mời không được để trống")
    private InvitationStatus status;
}
