package com.wedding.admin.service;

import com.wedding.admin.dto.request.AdminUpdateTemplateMetaRequest;
import com.wedding.admin.dto.response.AdminTemplateResponse;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.repository.InvitationRepository;
import com.wedding.template.entity.Template;
import com.wedding.template.entity.TemplateStatus;
import com.wedding.template.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Service xử lý nghiệp vụ quản trị kho mẫu thiệp cưới:
 * liệt kê tất cả trạng thái, chuyển đổi trạng thái hiển thị nhanh và cập nhật metadata quản trị.
 */
@Service
@RequiredArgsConstructor
public class AdminTemplateService {

    private final TemplateRepository templateRepository;
    private final InvitationRepository invitationRepository;

    /**
     * Lấy danh sách toàn bộ mẫu thiệp (DRAFT, PUBLISHED, ARCHIVED) có lọc và phân trang.
     *
     * @param search   Từ khóa tìm kiếm theo code hoặc title
     * @param status   Trạng thái mẫu cần lọc (tùy chọn)
     * @param category Danh mục mẫu cần lọc (tùy chọn)
     * @param pageable Cấu hình phân trang
     * @return Trang dữ liệu AdminTemplateResponse
     */
    @Transactional(readOnly = true)
    public Page<AdminTemplateResponse> listTemplates(
            String search,
            TemplateStatus status,
            String category,
            Pageable pageable
    ) {
        String searchPattern = buildSearchPattern(search);
        String normalizedCategory = normalizeCategory(category);
        Page<Template> templatesPage = templateRepository.searchForAdmin(searchPattern, status, normalizedCategory, pageable);

        Map<String, Long> countByTemplateKey = loadInvitationCountMap(templatesPage.getContent());
        return templatesPage.map(template -> toResponse(template, resolveInvitationCount(template, countByTemplateKey)));
    }

    /**
     * Đổi trạng thái hiển thị nhanh của mẫu thiệp mà không tăng phiên bản schema.
     *
     * @param id     ID mẫu thiệp
     * @param status Trạng thái mới (DRAFT, PUBLISHED, ARCHIVED)
     * @return AdminTemplateResponse sau khi cập nhật
     */
    @Transactional
    public AdminTemplateResponse updateTemplateStatus(Long id, TemplateStatus status) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu thiệp yêu cầu."));

        template.setStatus(status);
        Template saved = templateRepository.save(template);

        long invitationCount = countInvitationsForTemplate(saved);
        return toResponse(saved, invitationCount);
    }

    /**
     * Cập nhật metadata quản trị của mẫu thiệp, giữ nguyên contentSchema và defaultData.
     *
     * @param id      ID mẫu thiệp
     * @param request Payload chứa các trường metadata cần cập nhật
     * @return AdminTemplateResponse sau khi cập nhật
     */
    @Transactional
    public AdminTemplateResponse updateTemplateMeta(Long id, AdminUpdateTemplateMetaRequest request) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu thiệp yêu cầu."));

        if (request.getTitle() != null) {
            if (request.getTitle().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Tiêu đề mẫu thiệp không được để trống.");
            }
            template.setTitle(request.getTitle().trim());
        }
        if (request.getCategory() != null) {
            template.setCategory(request.getCategory().trim());
        }
        if (request.getCategoryLabel() != null) {
            template.setCategoryLabel(request.getCategoryLabel().trim());
        }
        if (request.getStyle() != null) {
            template.setStyle(request.getStyle().trim());
        }
        if (request.getBadge() != null) {
            template.setBadge(request.getBadge().trim());
        }
        if (request.getImageUrl() != null) {
            template.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            template.setStatus(request.getStatus());
        }

        Template saved = templateRepository.save(template);
        long invitationCount = countInvitationsForTemplate(saved);
        return toResponse(saved, invitationCount);
    }

    private Map<String, Long> loadInvitationCountMap(List<Template> templates) {
        if (templates.isEmpty()) {
            return Collections.emptyMap();
        }
        Set<String> lookupKeys = new HashSet<>();
        for (Template template : templates) {
            if (template.getCode() != null) {
                lookupKeys.add(template.getCode());
            }
            if (template.getId() != null) {
                lookupKeys.add(String.valueOf(template.getId()));
            }
        }
        if (lookupKeys.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : invitationRepository.countGroupByTemplateIdIn(lookupKeys)) {
            counts.put((String) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private long resolveInvitationCount(Template template, Map<String, Long> countByKey) {
        long count = 0L;
        String code = template.getCode();
        String idAsString = template.getId() != null ? String.valueOf(template.getId()) : null;

        if (code != null) {
            count += countByKey.getOrDefault(code, 0L);
        }
        if (idAsString != null && !idAsString.equals(code)) {
            count += countByKey.getOrDefault(idAsString, 0L);
        }
        return count;
    }

    private long countInvitationsForTemplate(Template template) {
        Set<String> keys = new HashSet<>();
        if (template.getCode() != null) {
            keys.add(template.getCode());
        }
        if (template.getId() != null) {
            keys.add(String.valueOf(template.getId()));
        }
        if (keys.isEmpty()) {
            return 0L;
        }
        return invitationRepository.countByTemplateIdIn(keys);
    }

    private String buildSearchPattern(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }
        return "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("all")) {
            return "";
        }
        return category.trim();
    }

    private AdminTemplateResponse toResponse(Template template, long invitationCount) {
        return AdminTemplateResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .title(template.getTitle())
                .category(template.getCategory())
                .categoryLabel(template.getCategoryLabel())
                .style(template.getStyle())
                .badge(template.getBadge())
                .imageUrl(template.getImageUrl())
                .description(template.getDescription())
                .version(template.getVersion())
                .status(template.getStatus())
                .viewsCount(template.getViewsCount())
                .likesCount(template.getLikesCount())
                .invitationCount(invitationCount)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
