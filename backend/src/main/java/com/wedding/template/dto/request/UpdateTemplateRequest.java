package com.wedding.template.dto.request;

import com.wedding.template.entity.TemplateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload yêu cầu cập nhật thuộc tính hoặc cây JSON Schema của mẫu từ Studio.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTemplateRequest {

    private String title;
    private String category;
    private String categoryLabel;
    private String style;
    private String badge;
    private String imageUrl;
    private String description;
    private String defaultData;
    private String contentSchema;
    private TemplateStatus status;
}
