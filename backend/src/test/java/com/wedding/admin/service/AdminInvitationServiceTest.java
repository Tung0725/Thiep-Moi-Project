package com.wedding.admin.service;

import com.wedding.admin.dto.response.AdminInvitationResponse;
import com.wedding.auth.entity.User;
import com.wedding.auth.repository.UserRepository;
import com.wedding.common.exception.AppException;
import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.invitation.repository.InvitationRepository;
import com.wedding.invitation.service.InvitationService;
import com.wedding.wish.repository.WishRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminInvitationServiceTest {

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WishRepository wishRepository;

    @InjectMocks
    private AdminInvitationService adminInvitationService;

    @Test
    @DisplayName("listInvitations - Nạp thông tin chủ thiệp và số lời chúc theo lô, hỗ trợ cả thiệp khách vãng lai")
    void listInvitations_PopulatesOwnersAndWishCounts() {
        UUID ownerId = UUID.randomUUID();
        User owner = User.builder()
                .id(ownerId)
                .email("owner@example.com")
                .fullName("Chủ Thiệp")
                .build();

        Invitation ownedInvitation = Invitation.builder()
                .id(1L)
                .userId(ownerId)
                .slug("nam-lan")
                .templateId("hb04-basic")
                .title("Lễ Thành Hôn - Nam & Lan")
                .groomName("Nam")
                .brideName("Lan")
                .status(InvitationStatus.PUBLISHED)
                .createdAt(Instant.now())
                .build();

        Invitation guestInvitation = Invitation.builder()
                .id(2L)
                .userId(null)
                .slug("khach-vang-lai")
                .templateId("song-hy-xanh")
                .title("Thiệp Khách")
                .status(InvitationStatus.DRAFT)
                .createdAt(Instant.now())
                .build();

        PageRequest pageable = PageRequest.of(0, 20);
        when(invitationRepository.searchForAdmin("", null, "", pageable))
                .thenReturn(new PageImpl<>(List.of(ownedInvitation, guestInvitation), pageable, 2));
        when(userRepository.findAllById(Set.of(ownerId))).thenReturn(List.of(owner));
        when(wishRepository.countGroupByInvitationIdIn(List.of(1L, 2L)))
                .thenReturn(List.<Object[]>of(new Object[]{1L, 7L}));

        Page<AdminInvitationResponse> result = adminInvitationService.listInvitations(null, null, null, pageable);

        assertEquals(2, result.getTotalElements());
        AdminInvitationResponse first = result.getContent().get(0);
        assertEquals("/t/nam-lan", first.getPublicUrl());
        assertEquals("owner@example.com", first.getOwnerEmail());
        assertEquals("Chủ Thiệp", first.getOwnerFullName());
        assertEquals(7L, first.getWishCount());

        AdminInvitationResponse second = result.getContent().get(1);
        assertNull(second.getOwnerEmail());
        assertNull(second.getOwnerFullName());
        assertEquals(0L, second.getWishCount());
    }

    @Test
    @DisplayName("updateInvitationStatus - Cập nhật trạng thái thiệp mời sang ARCHIVED")
    void updateInvitationStatus_Success() {
        Invitation invitation = Invitation.builder()
                .id(15L)
                .slug("minh-hoa")
                .status(InvitationStatus.PUBLISHED)
                .build();
        when(invitationRepository.findById(15L)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(invitation)).thenReturn(invitation);
        when(wishRepository.countByInvitationId(15L)).thenReturn(3L);

        AdminInvitationResponse updated = adminInvitationService.updateInvitationStatus(15L, InvitationStatus.ARCHIVED);

        assertEquals(InvitationStatus.ARCHIVED, updated.getStatus());
        assertEquals(3L, updated.getWishCount());
    }

    @Test
    @DisplayName("deleteInvitation - Xóa wishes trước rồi mới xóa invitation trong cùng transaction")
    void deleteInvitation_DeletesWishesBeforeInvitation() {
        Invitation invitation = Invitation.builder()
                .id(20L)
                .slug("thiep-can-xoa")
                .status(InvitationStatus.PUBLISHED)
                .build();
        when(invitationRepository.findById(20L)).thenReturn(Optional.of(invitation));

        adminInvitationService.deleteInvitation(20L);

        InOrder order = inOrder(wishRepository, invitationRepository);
        order.verify(wishRepository).deleteByInvitationId(20L);
        order.verify(invitationRepository).delete(invitation);
    }

    @Test
    @DisplayName("deleteInvitation - Thiệp không tồn tại ném 404 NOT_FOUND và không xóa wishes")
    void deleteInvitation_NotFound_Throws404() {
        when(invitationRepository.findById(999L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class,
                () -> adminInvitationService.deleteInvitation(999L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        verifyNoInteractions(wishRepository);
    }

    @Test
    @DisplayName("InvitationService.getPublicCardBySlug - Trả 404 khi thiệp ở trạng thái ARCHIVED hoặc DRAFT")
    void publicInvitationService_NonPublishedInvitation_Throws404() {
        InvitationService invitationService = new InvitationService(invitationRepository);
        Invitation archived = Invitation.builder()
                .id(30L)
                .slug("thiep-an")
                .status(InvitationStatus.ARCHIVED)
                .build();
        when(invitationRepository.findBySlug("thiep-an")).thenReturn(Optional.of(archived));

        AppException ex = assertThrows(AppException.class,
                () -> invitationService.getPublicCardBySlug("thiep-an"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
