package com.wedding.auth.repository;

import com.wedding.auth.entity.Role;
import com.wedding.auth.entity.User;
import com.wedding.auth.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSubject(String googleSubject);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, UserStatus status);

    List<User> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT u FROM User u
            WHERE (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (
                  :searchPattern = ''
                  OR LOWER(u.email) LIKE :searchPattern
                  OR LOWER(u.fullName) LIKE :searchPattern
              )
            ORDER BY u.createdAt DESC
            """)
    Page<User> searchForAdmin(
            @Param("searchPattern") String searchPattern,
            @Param("role") Role role,
            @Param("status") UserStatus status,
            Pageable pageable
    );
}
