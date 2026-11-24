package com.wedding.admin.controller;

import com.wedding.admin.dto.response.AdminDashboardStatsResponse;
import com.wedding.admin.service.AdminDashboardService;
import com.wedding.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cung cấp API thống kê tổng quan KPI và hoạt động mới nhất cho Admin Dashboard.
 * Yêu cầu quyền ROLE_ADMIN.
 */
@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Lấy toàn bộ số liệu KPI hệ thống và danh sách 5 thiệp mời, 5 người dùng gần đây nhất.
     *
     * @return ApiResponse chứa AdminDashboardStatsResponse
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(200, "Lấy thống kê tổng quan thành công", stats));
    }
}
