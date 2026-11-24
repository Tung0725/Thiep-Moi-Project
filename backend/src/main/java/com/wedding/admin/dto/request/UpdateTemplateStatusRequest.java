package com.wedding.admin.dto.request;

import com.wedding.template.entity.TemplateStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload cập nhật nhanh trạng thái hiển thị của mẫu thiệp cưới (DRAFT, PUBLISHED, ARCHIVED).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTemplateStatusRequest {

    @NotNull(message = "Trạng thái mẫu thiệp không được để trống")
    private TemplateStatus status;
}
