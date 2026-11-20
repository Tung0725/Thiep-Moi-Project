package com.wedding.wish.entity;

import com.wedding.invitation.entity.Invitation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Thực thể đại diện cho lời chúc mừng và phản hồi tham dự tiệc cưới (RSVP)
 * của khách mời gửi tới một thiệp mời cụ thể.
 */
@Entity
@Table(
        name = "wishes",
        indexes = {
                @Index(name = "idx_wishes_invitation_created", columnList = "invitation_id, created_at DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitation_id", nullable = false)
    private Invitation invitation;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", nullable = false, length = 20)
    private AttendanceStatus attendanceStatus;

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.attendanceStatus == AttendanceStatus.DECLINED) {
            this.guestCount = 0;
        } else if (this.guestCount == null || this.guestCount < 1) {
            this.guestCount = 1;
        }
    }
}
