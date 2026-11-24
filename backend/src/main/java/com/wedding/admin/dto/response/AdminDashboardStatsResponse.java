package com.wedding.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Dữ liệu tổng quan KPI và hoạt động gần đây cho trang Dashboard quản trị.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {

    private UserStats users;
    private TemplateStats templates;
    private InvitationStats invitations;
    private WishStats wishes;
    private List<AdminInvitationResponse> recentInvitations;
    private List<AdminUserResponse> recentUsers;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long total;
        private long active;
        private long locked;
        private long pendingVerification;
        private long admins;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateStats {
        private long total;
        private long published;
        private long draft;
        private long archived;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitationStats {
        private long total;
        private long published;
        private long draft;
        private long archived;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishStats {
        private long total;
        private long attending;
        private long declined;
        private long maybe;
        private long totalExpectedGuests;
    }
}
