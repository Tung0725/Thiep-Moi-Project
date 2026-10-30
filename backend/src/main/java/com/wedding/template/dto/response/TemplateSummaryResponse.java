package com.wedding.template.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO tóm tắt thông tin mẫu thiệp cưới phục vụ danh sách hiển thị trên Landing Page và Kho Mẫu.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateSummaryResponse {

    private Long id;
    private String code;
    private String title;
    private String category;
    private String categoryLabel;
    private String style;
    private String badge;
    private String imageUrl;
    private String description;
    private Long viewsCount;
    private Long likesCount;
    private Instant createdAt;
}
