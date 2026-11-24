package com.wedding.wish.repository;

import com.wedding.wish.entity.AttendanceStatus;
import com.wedding.wish.entity.Wish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Repository truy vấn danh sách lời chúc và xác nhận tham dự tiệc cưới theo thiệp mời.
 */
@Repository
public interface WishRepository extends JpaRepository<Wish, Long> {

    Page<Wish> findByInvitationIdOrderByCreatedAtDesc(Long invitationId, Pageable pageable);

    long countByInvitationId(Long invitationId);

    long countByAttendanceStatus(AttendanceStatus attendanceStatus);

    @Query("SELECT COALESCE(SUM(w.guestCount), 0) FROM Wish w WHERE w.attendanceStatus = :status")
    long sumGuestCountByAttendanceStatus(@Param("status") AttendanceStatus status);

    @Query("SELECT w.invitation.id, COUNT(w) FROM Wish w WHERE w.invitation.id IN :invitationIds GROUP BY w.invitation.id")
    List<Object[]> countGroupByInvitationIdIn(@Param("invitationIds") Collection<Long> invitationIds);

    @Modifying
    @Query("DELETE FROM Wish w WHERE w.invitation.id = :invitationId")
    void deleteByInvitationId(@Param("invitationId") Long invitationId);

    @Query(
            value = """
                    SELECT w FROM Wish w
                    JOIN FETCH w.invitation i
                    WHERE (:attendanceStatus IS NULL OR w.attendanceStatus = :attendanceStatus)
                      AND (:invitationId IS NULL OR i.id = :invitationId)
                      AND (
                          :searchPattern = ''
                          OR LOWER(w.guestName) LIKE :searchPattern
                          OR LOWER(COALESCE(w.message, '')) LIKE :searchPattern
                          OR LOWER(i.slug) LIKE :searchPattern
                      )
                    ORDER BY w.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(w) FROM Wish w
                    JOIN w.invitation i
                    WHERE (:attendanceStatus IS NULL OR w.attendanceStatus = :attendanceStatus)
                      AND (:invitationId IS NULL OR i.id = :invitationId)
                      AND (
                          :searchPattern = ''
                          OR LOWER(w.guestName) LIKE :searchPattern
                          OR LOWER(COALESCE(w.message, '')) LIKE :searchPattern
                          OR LOWER(i.slug) LIKE :searchPattern
                      )
                    """
    )
    Page<Wish> searchForAdmin(
            @Param("searchPattern") String searchPattern,
            @Param("attendanceStatus") AttendanceStatus attendanceStatus,
            @Param("invitationId") Long invitationId,
            Pageable pageable
    );
}
