package com.wedding.invitation.repository;

import com.wedding.invitation.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository truy vấn dữ liệu thiệp mời từ cơ sở dữ liệu.
 */
@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
