package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminDashboardStatsResponse;
import com.wedding.admin.dto.response.AdminInvitationResponse;
import com.wedding.admin.dto.response.AdminUserResponse;
import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import com.wedding.auth.repository.UserRepository;
import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.invitation.repository.InvitationRepository;
import com.wedding.template.entity.TemplateStatus;
import com.wedding.template.repository.TemplateRepository;
import com.wedding.wish.entity.AttendanceStatus;
import com.wedding.wish.repository.WishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service tổng hợp số liệu thống kê KPI và danh sách hoạt động mới nhất
 * cho màn hình Tổng quan Quản trị (Admin Dashboard).
 */
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final TemplateRepository templateRepository;
    private final InvitationRepository invitationRepository;
    private final WishRepository wishRepository;

    /**
     * Thu thập toàn bộ chỉ số KPI của người dùng, mẫu thiệp, thiệp mời, lời chúc/RSVP
     * cùng 5 thiệp mời và 5 người dùng tạo gần đây nhất.
     *
     * @return AdminDashboardStatsResponse chứa số liệu tổng quan cho trang quản trị
     */
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse.UserStats userStats = AdminDashboardStatsResponse.UserStats.builder()
                .total(userRepository.count())
                .active(userRepository.countByStatus(UserStatus.ACTIVE))
                .locked(userRepository.countByStatus(UserStatus.LOCKED))
                .pendingVerification(userRepository.countByStatus(UserStatus.PENDING_VERIFICATION))
                .admins(userRepository.countByRole(Role.ROLE_ADMIN))
                .build();

        AdminDashboardStatsResponse.TemplateStats templateStats = AdminDashboardStatsResponse.TemplateStats.builder()
                .total(templateRepository.count())
                .published(templateRepository.countByStatus(TemplateStatus.PUBLISHED))
                .draft(templateRepository.countByStatus(TemplateStatus.DRAFT))
                .archived(templateRepository.countByStatus(TemplateStatus.ARCHIVED))
                .build();

        AdminDashboardStatsResponse.InvitationStats invitationStats = AdminDashboardStatsResponse.InvitationStats.builder()
                .total(invitationRepository.count())
                .published(invitationRepository.countByStatus(InvitationStatus.PUBLISHED))
                .draft(invitationRepository.countByStatus(InvitationStatus.DRAFT))
                .archived(invitationRepository.countByStatus(InvitationStatus.ARCHIVED))
                .build();

        AdminDashboardStatsResponse.WishStats wishStats = AdminDashboardStatsResponse.WishStats.builder()
                .total(wishRepository.count())
                .attending(wishRepository.countByAttendanceStatus(AttendanceStatus.ATTENDING))
                .declined(wishRepository.countByAttendanceStatus(AttendanceStatus.DECLINED))
                .maybe(wishRepository.countByAttendanceStatus(AttendanceStatus.MAYBE))
                .totalExpectedGuests(wishRepository.sumGuestCountByAttendanceStatus(AttendanceStatus.ATTENDING))
                .build();

        List<AdminInvitationResponse> recentInvitations = mapRecentInvitations(
                invitationRepository.findTop5ByOrderByCreatedAtDesc()
        );
        List<AdminUserResponse> recentUsers = mapRecentUsers(
                userRepository.findTop5ByOrderByCreatedAtDesc()
        );

        return AdminDashboardStatsResponse.builder()
                .users(userStats)
                .templates(templateStats)
                .invitations(invitationStats)
                .wishes(wishStats)
                .recentInvitations(recentInvitations)
                .recentUsers(recentUsers)
                .build();
    }

    private List<AdminInvitationResponse> mapRecentInvitations(List<Invitation> invitations) {
        if (invitations.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> ownerIds = invitations.stream()
                .map(Invitation::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, User> ownersById = ownerIds.isEmpty()
                ? Collections.emptyMap()
                : userRepository.findAllById(ownerIds).stream()
                        .collect(Collectors.toMap(User::getId, Function.identity()));

        List<Long> invitationIds = invitations.stream()
                .map(Invitation::getId)
                .toList();

        Map<Long, Long> wishCountByInvitationId = new HashMap<>();
        for (Object[] row : wishRepository.countGroupByInvitationIdIn(invitationIds)) {
            wishCountByInvitationId.put((Long) row[0], ((Number) row[1]).longValue());
        }

        return invitations.stream()
                .map(inv -> {
                    User owner = inv.getUserId() != null ? ownersById.get(inv.getUserId()) : null;
                    return AdminInvitationResponse.builder()
                            .id(inv.getId())
                            .slug(inv.getSlug())
                            .publicUrl("/t/" + inv.getSlug())
                            .templateId(inv.getTemplateId())
                            .title(inv.getTitle())
                            .groomName(inv.getGroomName())
                            .brideName(inv.getBrideName())
                            .phoneNumber(inv.getPhoneNumber())
                            .eventDate(inv.getEventDate())
                            .venueName(inv.getVenueName())
                            .status(inv.getStatus())
                            .userId(inv.getUserId())
                            .ownerEmail(owner != null ? owner.getEmail() : null)
                            .ownerFullName(owner != null ? owner.getFullName() : null)
                            .wishCount(wishCountByInvitationId.getOrDefault(inv.getId(), 0L))
                            .createdAt(inv.getCreatedAt())
                            .updatedAt(inv.getUpdatedAt())
                            .build();
                })
                .toList();
    }

    private List<AdminUserResponse> mapRecentUsers(List<User> users) {
        if (users.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> userIds = users.stream().map(User::getId).toList();
        Map<UUID, Long> invitationCountByUserId = new HashMap<>();
        for (Object[] row : invitationRepository.countGroupByUserIdIn(userIds)) {
            invitationCountByUserId.put((UUID) row[0], ((Number) row[1]).longValue());
        }

        return users.stream()
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .emailVerified(user.isEmailVerified())
                        .invitationCount(invitationCountByUserId.getOrDefault(user.getId(), 0L))
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .build())
                .toList();
    }
}
