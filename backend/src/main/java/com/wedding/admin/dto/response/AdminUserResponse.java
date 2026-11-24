package com.wedding.admin.dto.response;

import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Thông tin người dùng hiển thị trên màn hình quản trị kèm tổng số thiệp đã tạo.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private UserStatus status;
    private boolean emailVerified;
    private long invitationCount;
    private Instant createdAt;
    private Instant updatedAt;
}
