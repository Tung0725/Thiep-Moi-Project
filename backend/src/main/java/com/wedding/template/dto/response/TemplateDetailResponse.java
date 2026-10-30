package com.wedding.template.dto.response;

import com.wedding.template.entity.TemplateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO chi tiết toàn diện của mẫu thiệp cưới chứa cây JSON Schema phục vụ trình dựng và Studio Editor.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateDetailResponse {

    private Long id;
    private String code;
    private String title;
    private String category;
    private String categoryLabel;
    private String style;
    private String badge;
    private String imageUrl;
    private String description;
    private Long forkedFromId;
    private Integer version;
    private TemplateStatus status;
    private String defaultData;
    private String contentSchema;
    private Long viewsCount;
    private Long likesCount;
    private Instant createdAt;
    private Instant updatedAt;
}
