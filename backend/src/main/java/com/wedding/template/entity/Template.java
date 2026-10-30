package com.wedding.template.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Thực thể đại diện cho một mẫu thiết kế thiệp cưới trong hệ thống.
 * Chứa toàn bộ cây cấu trúc JSON Schema (content_schema), thông tin phân loại,
 * hỗ trợ cơ chế nhân bản (forked_from_id) và quản lý phiên bản.
 */
@Entity
@Table(name = "templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 50)
    private String category;

    @Column(name = "category_label", length = 50)
    private String categoryLabel;

    @Column(length = 100)
    private String style;

    @Column(length = 30)
    private String badge;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "forked_from_id")
    private Long forkedFromId;

    @Builder.Default
    @Column(nullable = false)
    private Integer version = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TemplateStatus status;

    @Column(name = "default_data", columnDefinition = "TEXT")
    private String defaultData;

    @Column(name = "content_schema", columnDefinition = "TEXT", nullable = false)
    private String contentSchema;

    @Builder.Default
    @Column(name = "views_count", nullable = false)
    private Long viewsCount = 0L;

    @Builder.Default
    @Column(name = "likes_count", nullable = false)
    private Long likesCount = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = TemplateStatus.PUBLISHED;
        }
        if (this.version == null) {
            this.version = 1;
        }
        if (this.viewsCount == null) {
            this.viewsCount = 0L;
        }
        if (this.likesCount == null) {
            this.likesCount = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
