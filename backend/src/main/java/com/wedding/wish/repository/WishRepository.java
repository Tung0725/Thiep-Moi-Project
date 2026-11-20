package com.wedding.wish.repository;

import com.wedding.wish.entity.Wish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository truy vấn danh sách lời chúc và xác nhận tham dự tiệc cưới theo thiệp mời.
 */
@Repository
public interface WishRepository extends JpaRepository<Wish, Long> {

    Page<Wish> findByInvitationIdOrderByCreatedAtDesc(Long invitationId, Pageable pageable);

    long countByInvitationId(Long invitationId);
}
