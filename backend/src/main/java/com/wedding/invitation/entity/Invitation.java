package com.wedding.invitation.entity;

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
import java.util.UUID;

/**
 * Thực thể đại diện cho một thiệp mời đám cưới trực tuyến.
 * Chứa thông tin dâu rể cơ bản, định danh đường dẫn công khai (slug)
 * và toàn bộ cây JSON Schema của thiệp (content_schema).
 */
@Entity
@Table(name = "invitations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "template_id", length = 64)
    private String templateId;

    @Column(length = 255)
    private String title;

    @Column(name = "groom_name", length = 100)
    private String groomName;

    @Column(name = "bride_name", length = 100)
    private String brideName;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "event_date", length = 50)
    private String eventDate;

    @Column(name = "event_time", length = 20)
    private String eventTime;

    @Column(name = "venue_name", length = 255)
    private String venueName;

    @Column(name = "venue_address", length = 500)
    private String venueAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvitationStatus status;

    @Column(name = "content_schema", columnDefinition = "TEXT", nullable = false)
    private String contentSchema;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) {
            this.status = InvitationStatus.PUBLISHED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
