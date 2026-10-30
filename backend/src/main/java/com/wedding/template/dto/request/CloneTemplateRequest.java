package com.wedding.template.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload yêu cầu nhân bản (clone) một mẫu thiệp thành bản sao mới.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloneTemplateRequest {

    @NotBlank(message = "Mã định danh mẫu mới không được để trống")
    @Size(max = 64, message = "Mã định danh mẫu tối đa 64 ký tự")
    private String newCode;

    @NotBlank(message = "Tên mẫu mới không được để trống")
    @Size(max = 255, message = "Tên mẫu tối đa 255 ký tự")
    private String newTitle;
}
