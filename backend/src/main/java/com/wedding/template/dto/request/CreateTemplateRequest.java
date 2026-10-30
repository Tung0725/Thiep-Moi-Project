package com.wedding.template.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload yêu cầu khởi tạo mẫu thiệp cưới mới trong Studio.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateRequest {

    @NotBlank(message = "Mã định danh mẫu không được để trống")
    @Size(max = 64, message = "Mã định danh mẫu tối đa 64 ký tự")
    private String code;

    @NotBlank(message = "Tên mẫu thiệp không được để trống")
    @Size(max = 255, message = "Tên mẫu thiệp tối đa 255 ký tự")
    private String title;

    private String category;
    private String categoryLabel;
    private String style;
    private String badge;
    private String imageUrl;
    private String description;
    private String defaultData;

    @NotBlank(message = "Cấu trúc Schema của mẫu không được để trống")
    private String contentSchema;
}
