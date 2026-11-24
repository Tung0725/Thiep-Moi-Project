package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminInvitationResponse;
import com.wedding.auth.entity.User;
import com.wedding.auth.repository.UserRepository;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.invitation.repository.InvitationRepository;
import com.wedding.wish.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ quản trị thiệp mời toàn hệ thống:
 * tìm kiếm/lọc phân trang kèm chủ thiệp & số lời chúc, đổi trạng thái và xóa thiệp an toàn.
 */
@Service
@RequiredArgsConstructor
public class AdminInvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final WishRepository wishRepository;

    /**
     * Liệt kê danh sách thiệp mời toàn hệ thống có lọc theo từ khóa, trạng thái và mẫu thiệp.
     * Nạp thông tin chủ thiệp và tổng số lời chúc theo lô để tránh lỗi N+1.
     *
     * @param search     Từ khóa tìm theo slug, tên dâu rể, tiêu đề hoặc email chủ thiệp
     * @param status     Trạng thái thiệp cần lọc (tùy chọn)
     * @param templateId Mã mẫu thiệp cần lọc (tùy chọn)
     * @param pageable   Cấu hình phân trang
     * @return Trang dữ liệu AdminInvitationResponse
     */
    @Transactional(readOnly = true)
    public Page<AdminInvitationResponse> listInvitations(
            String search,
            InvitationStatus status,
            String templateId,
            Pageable pageable
    ) {
        String searchPattern = buildSearchPattern(search);
        String normalizedTemplateId = (templateId == null || templateId.isBlank()) ? "" : templateId.trim();

        Page<Invitation> invitationsPage = invitationRepository.searchForAdmin(
                searchPattern, status, normalizedTemplateId, pageable
        );

        List<Invitation> content = invitationsPage.getContent();
        Map<UUID, User> ownersById = loadOwnersMap(content);
        Map<Long, Long> wishCountByInvitationId = loadWishCountMap(content);

        return invitationsPage.map(inv -> {
            User owner = inv.getUserId() != null ? ownersById.get(inv.getUserId()) : null;
            return toResponse(inv, owner, wishCountByInvitationId.getOrDefault(inv.getId(), 0L));
        });
    }

    /**
     * Cập nhật trạng thái của thiệp mời (DRAFT, PUBLISHED, ARCHIVED).
     * Khi chuyển sang DRAFT hoặc ARCHIVED, luồng công khai sẽ ẩn thiệp và trả 404.
     *
     * @param id     ID thiệp mời
     * @param status Trạng thái mới
     * @return AdminInvitationResponse sau khi cập nhật
     */
    @Transactional
    public AdminInvitationResponse updateInvitationStatus(Long id, InvitationStatus status) {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời yêu cầu."));

        invitation.setStatus(status);
        Invitation saved = invitationRepository.save(invitation);

        User owner = saved.getUserId() != null
                ? userRepository.findById(saved.getUserId()).orElse(null)
                : null;
        long wishCount = wishRepository.countByInvitationId(saved.getId());

        return toResponse(saved, owner, wishCount);
    }

    /**
     * Xóa cứng thiệp mời cùng toàn bộ lời chúc phụ thuộc trong cùng một giao dịch
     * để tránh vi phạm ràng buộc khóa ngoại.
     *
     * @param id ID thiệp mời cần xóa
     */
    @Transactional
    public void deleteInvitation(Long id) {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời yêu cầu."));

        wishRepository.deleteByInvitationId(invitation.getId());
        invitationRepository.delete(invitation);
    }

    private Map<UUID, User> loadOwnersMap(List<Invitation> invitations) {
        Set<UUID> userIds = invitations.stream()
                .map(Invitation::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private Map<Long, Long> loadWishCountMap(List<Invitation> invitations) {
        if (invitations.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Long> invitationIds = invitations.stream().map(Invitation::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : wishRepository.countGroupByInvitationIdIn(invitationIds)) {
            counts.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private String buildSearchPattern(String search) {
        if (search == null || search.isBlank()) {
            return "";
        }
        return "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private AdminInvitationResponse toResponse(Invitation invitation, User owner, long wishCount) {
        return AdminInvitationResponse.builder()
                .id(invitation.getId())
                .slug(invitation.getSlug())
                .publicUrl("/t/" + invitation.getSlug())
                .templateId(invitation.getTemplateId())
                .title(invitation.getTitle())
                .groomName(invitation.getGroomName())
                .brideName(invitation.getBrideName())
                .phoneNumber(invitation.getPhoneNumber())
                .eventDate(invitation.getEventDate())
                .venueName(invitation.getVenueName())
                .status(invitation.getStatus())
                .userId(invitation.getUserId())
                .ownerEmail(owner != null ? owner.getEmail() : null)
                .ownerFullName(owner != null ? owner.getFullName() : null)
                .wishCount(wishCount)
                .createdAt(invitation.getCreatedAt())
                .updatedAt(invitation.getUpdatedAt())
                .build();
    }
}
