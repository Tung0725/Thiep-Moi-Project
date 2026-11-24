package com.wedding.admin.dto.response;

import com.wedding.template.entity.TemplateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Thông tin mẫu thiệp cưới hiển thị trong trang quản trị kèm thống kê lượt tạo thiệp.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTemplateResponse {

    private Long id;
    private String code;
    private String title;
    private String category;
    private String categoryLabel;
    private String style;
    private String badge;
    private String imageUrl;
    private String description;
    private Integer version;
    private TemplateStatus status;
    private Long viewsCount;
    private Long likesCount;
    private long invitationCount;
    private Instant createdAt;
    private Instant updatedAt;
}
