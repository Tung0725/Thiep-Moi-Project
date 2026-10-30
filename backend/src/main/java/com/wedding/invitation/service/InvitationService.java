package com.wedding.invitation.service;

import com.wedding.common.exception.AppException;
import com.wedding.invitation.dto.request.QuickCreateInvitationRequest;
import com.wedding.invitation.dto.response.InvitationResponse;
import com.wedding.invitation.dto.response.PublicCardResponse;
import com.wedding.invitation.entity.Invitation;
import com.wedding.invitation.entity.InvitationStatus;
import com.wedding.invitation.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Service xử lý nghiệp vụ tạo nhanh và truy xuất thiệp mời công khai.
 * Quản lý vòng đời thiệp, chuẩn hóa chuỗi slug duy nhất và lưu trữ
 * cấu trúc JSON Schema vào cơ sở dữ liệu.
 */
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Khởi tạo nhanh thiệp cưới từ thông tin tùy biến trên Landing Page.
     * Tự động sinh slug duy nhất, gán trạng thái PUBLISHED và lưu toàn bộ JSON Schema.
     *
     * @param request DTO chứa thông tin dâu rể, thời gian, địa điểm và JSON Schema
     * @param userId  ID người dùng đăng nhập (nếu có, null nếu là khách vãng lai)
     * @return InvitationResponse chứa mã thiệp và đường link công khai
     */
    @Transactional
    public InvitationResponse createQuickInvitation(QuickCreateInvitationRequest request, java.util.UUID userId) {
        String baseSlug = generateBaseSlug(request.getGroomName(), request.getBrideName());
        String uniqueSlug = ensureUniqueSlug(baseSlug);

        String title = String.format("Lễ Thành Hôn - %s & %s", request.getGroomName(), request.getBrideName());

        Invitation invitation = Invitation.builder()
                .userId(userId)
                .slug(uniqueSlug)
                .templateId(request.getTemplateId())
                .title(title)
                .groomName(request.getGroomName())
                .brideName(request.getBrideName())
                .phoneNumber(request.getPhoneNumber())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .venueName(request.getVenueName())
                .venueAddress(request.getVenueAddress())
                .status(InvitationStatus.PUBLISHED)
                .contentSchema(request.getContentSchema())
                .build();

        Invitation saved = invitationRepository.save(invitation);

        return InvitationResponse.builder()
                .id(saved.getId())
                .slug(saved.getSlug())
                .templateId(saved.getTemplateId())
                .title(saved.getTitle())
                .groomName(saved.getGroomName())
                .brideName(saved.getBrideName())
                .eventDate(saved.getEventDate())
                .venueName(saved.getVenueName())
                .status(saved.getStatus())
                .publicUrl("/t/" + saved.getSlug())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    /**
     * Truy xuất dữ liệu thiệp mời công khai theo đường dẫn slug cho khách xem.
     *
     * @param slug Chuỗi slug duy nhất của thiệp
     * @return PublicCardResponse chứa dữ liệu Schema và metadata tiệc cưới
     */
    @Transactional(readOnly = true)
    public PublicCardResponse getPublicCardBySlug(String slug) {
        Invitation invitation = invitationRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời với đường dẫn yêu cầu."));

        return PublicCardResponse.builder()
                .slug(invitation.getSlug())
                .title(invitation.getTitle())
                .groomName(invitation.getGroomName())
                .brideName(invitation.getBrideName())
                .eventDate(invitation.getEventDate())
                .venueName(invitation.getVenueName())
                .contentSchema(invitation.getContentSchema())
                .build();
    }

    private String generateBaseSlug(String groomName, String brideName) {
        String combined = (groomName + "-" + brideName)
                .replace("đ", "d")
                .replace("Đ", "d");
        String nowhitespace = WHITESPACE.matcher(combined).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("").toLowerCase(Locale.ENGLISH);
        slug = slug.replaceAll("-+", "-").replaceAll("^-|-$", "");
        return slug.isEmpty() ? "thiep-cuoi" : slug;
    }

    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        if (!invitationRepository.existsBySlug(slug)) {
            return slug;
        }

        String randomSuffix = UUID.randomUUID().toString().substring(0, 5);
        return baseSlug + "-" + randomSuffix;
    }
}
