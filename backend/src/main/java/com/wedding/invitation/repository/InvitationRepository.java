package com.wedding.invitation.repository;

import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository truy vấn dữ liệu thiệp mời từ cơ sở dữ liệu.
 */
@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByStatus(InvitationStatus status);

    long countByUserId(UUID userId);

    long countByTemplateIdIn(Collection<String> templateIds);

    List<Invitation> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT i.userId, COUNT(i) FROM Invitation i WHERE i.userId IN :userIds GROUP BY i.userId")
    List<Object[]> countGroupByUserIdIn(@Param("userIds") Collection<UUID> userIds);

    @Query("SELECT i.templateId, COUNT(i) FROM Invitation i WHERE i.templateId IN :templateIds GROUP BY i.templateId")
    List<Object[]> countGroupByTemplateIdIn(@Param("templateIds") Collection<String> templateIds);

    @Query(
            value = """
                    SELECT i FROM Invitation i
                    LEFT JOIN User u ON u.id = i.userId
                    WHERE (:status IS NULL OR i.status = :status)
                      AND (:templateId = '' OR i.templateId = :templateId)
                      AND (
                          :searchPattern = ''
                          OR LOWER(i.slug) LIKE :searchPattern
                          OR LOWER(COALESCE(i.groomName, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(i.brideName, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(i.title, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(u.email, '')) LIKE :searchPattern
                      )
                    ORDER BY i.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(i) FROM Invitation i
                    LEFT JOIN User u ON u.id = i.userId
                    WHERE (:status IS NULL OR i.status = :status)
                      AND (:templateId = '' OR i.templateId = :templateId)
                      AND (
                          :searchPattern = ''
                          OR LOWER(i.slug) LIKE :searchPattern
                          OR LOWER(COALESCE(i.groomName, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(i.brideName, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(i.title, '')) LIKE :searchPattern
                          OR LOWER(COALESCE(u.email, '')) LIKE :searchPattern
                      )
                    """
    )
    Page<Invitation> searchForAdmin(
            @Param("searchPattern") String searchPattern,
            @Param("status") InvitationStatus status,
            @Param("templateId") String templateId,
            Pageable pageable
    );
}
