package com.wedding.admin.dto.request;

import com.wedding.auth.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload cập nhật vai trò phân quyền của tài khoản người dùng (ROLE_USER hoặc ROLE_ADMIN).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    @NotNull(message = "Vai trò người dùng không được để trống")
    private Role role;
}
