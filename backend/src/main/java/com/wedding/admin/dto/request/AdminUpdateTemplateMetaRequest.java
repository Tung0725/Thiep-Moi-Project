package com.wedding.admin.dto.request;

import com.wedding.template.entity.TemplateStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload cập nhật metadata quản trị của mẫu thiệp cưới.
 * Không thay đổi contentSchema hay defaultData của mẫu.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateTemplateMetaRequest {

    @Size(max = 255, message = "Tiêu đề mẫu thiệp không được vượt quá 255 ký tự")
    private String title;

    @Size(max = 50, message = "Danh mục không được vượt quá 50 ký tự")
    private String category;

    @Size(max = 50, message = "Nhãn danh mục không được vượt quá 50 ký tự")
    private String categoryLabel;

    @Size(max = 100, message = "Phong cách không được vượt quá 100 ký tự")
    private String style;

    @Size(max = 30, message = "Nhãn nổi bật (badge) không được vượt quá 30 ký tự")
    private String badge;

    @Size(max = 500, message = "Đường dẫn ảnh đại diện không được vượt quá 500 ký tự")
    private String imageUrl;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    private TemplateStatus status;
}
