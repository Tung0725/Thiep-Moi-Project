package com.wedding.template.repository;

import com.wedding.template.entity.Template;
import com.wedding.template.entity.TemplateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {

    Optional<Template> findByCode(String code);

    boolean existsByCode(String code);

    List<Template> findByStatusOrderByCreatedAtDesc(TemplateStatus status);

    List<Template> findByStatusAndCategoryOrderByCreatedAtDesc(TemplateStatus status, String category);

    @Query("SELECT t FROM Template t WHERE t.code = :codeOrId OR CAST(t.id AS string) = :codeOrId")
    Optional<Template> findByCodeOrId(@Param("codeOrId") String codeOrId);

    long countByStatus(TemplateStatus status);

    @Query("""
            SELECT t FROM Template t
            WHERE (:status IS NULL OR t.status = :status)
              AND (:category = '' OR LOWER(COALESCE(t.category, '')) = LOWER(:category))
              AND (
                  :searchPattern = ''
                  OR LOWER(t.code) LIKE :searchPattern
                  OR LOWER(t.title) LIKE :searchPattern
              )
            ORDER BY t.updatedAt DESC, t.createdAt DESC
            """)
    Page<Template> searchForAdmin(
            @Param("searchPattern") String searchPattern,
            @Param("status") TemplateStatus status,
            @Param("category") String category,
            Pageable pageable
    );
}
