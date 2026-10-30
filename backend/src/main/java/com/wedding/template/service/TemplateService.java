package com.wedding.template.service;

import com.wedding.common.exception.AppException;
import com.wedding.template.dto.request.CloneTemplateRequest;
import com.wedding.template.dto.request.CreateTemplateRequest;
import com.wedding.template.dto.request.UpdateTemplateRequest;
import com.wedding.template.dto.response.TemplateDetailResponse;
import com.wedding.template.dto.response.TemplateSummaryResponse;
import com.wedding.template.entity.Template;
import com.wedding.template.entity.TemplateStatus;
import com.wedding.template.repository.TemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý nghiệp vụ kho mẫu thiệp cưới.
 * Xử lý truy xuất danh sách mẫu, chi tiết mẫu, tạo mới, cập nhật bản thảo Studio
 * và nhân bản (clone) mẫu thiết kế trong 1 click.
 */
@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    /**
     * Lấy danh sách mẫu thiệp đã xuất bản phục vụ hiển thị trên Landing Page và Kho Mẫu.
     *
     * @param category Phân loại danh mục (tùy chọn)
     * @return Danh sách TemplateSummaryResponse
     */
    @Transactional(readOnly = true)
    public List<TemplateSummaryResponse> getAllTemplates(String category) {
        List<Template> templates;
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            templates = templateRepository.findByStatusAndCategoryOrderByCreatedAtDesc(TemplateStatus.PUBLISHED, category);
        } else {
            templates = templateRepository.findByStatusOrderByCreatedAtDesc(TemplateStatus.PUBLISHED);
        }

        return templates.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Truy xuất toàn bộ chi tiết và cây JSON Schema của mẫu thiệp theo code hoặc ID.
     *
     * @param codeOrId Mã định danh hoặc ID của mẫu
     * @return TemplateDetailResponse chứa cây JSON Schema
     */
    @Transactional(readOnly = true)
    public TemplateDetailResponse getTemplateByCodeOrId(String codeOrId) {
        Template template = templateRepository.findByCodeOrId(codeOrId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu thiệp yêu cầu."));

        return toDetailResponse(template);
    }

    /**
     * Khởi tạo một mẫu thiệp mới từ Studio Editor.
     *
     * @param request DTO chứa thông tin và cây JSON Schema của mẫu
     * @return TemplateDetailResponse của mẫu vừa tạo
     */
    @Transactional
    public TemplateDetailResponse createTemplate(CreateTemplateRequest request) {
        if (templateRepository.existsByCode(request.getCode())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã mẫu thiệp đã tồn tại trong hệ thống.");
        }

        Template template = Template.builder()
                .code(request.getCode().toLowerCase().trim())
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .categoryLabel(request.getCategoryLabel())
                .style(request.getStyle())
                .badge(request.getBadge())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .defaultData(request.getDefaultData())
                .contentSchema(request.getContentSchema())
                .status(TemplateStatus.PUBLISHED)
                .version(1)
                .build();

        return toDetailResponse(templateRepository.save(template));
    }

    /**
     * Nhân bản một mẫu thiết kế có sẵn thành bản sao mới để tiếp tục sáng tạo.
     *
     * @param sourceId ID mẫu gốc cần nhân bản
     * @param request DTO chứa mã mới và tên mới cho bản sao
     * @return TemplateDetailResponse của bản sao vừa tạo
     */
    @Transactional
    public TemplateDetailResponse cloneTemplate(Long sourceId, CloneTemplateRequest request) {
        Template source = templateRepository.findById(sourceId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu gốc để nhân bản."));

        if (templateRepository.existsByCode(request.getNewCode())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã mẫu mới đã tồn tại, vui lòng chọn mã khác.");
        }

        Template cloned = Template.builder()
                .code(request.getNewCode().toLowerCase().trim())
                .title(request.getNewTitle().trim())
                .category(source.getCategory())
                .categoryLabel(source.getCategoryLabel())
                .style(source.getStyle())
                .badge(source.getBadge())
                .imageUrl(source.getImageUrl())
                .description(source.getDescription())
                .forkedFromId(source.getId())
                .version(1)
                .status(TemplateStatus.DRAFT)
                .defaultData(source.getDefaultData())
                .contentSchema(source.getContentSchema())
                .build();

        return toDetailResponse(templateRepository.save(cloned));
    }

    /**
     * Cập nhật thông tin và cây cấu trúc JSON Schema của mẫu từ Studio.
     *
     * @param id ID mẫu cần cập nhật
     * @param request DTO chứa các thông tin chỉnh sửa
     * @return TemplateDetailResponse sau cập nhật
     */
    @Transactional
    public TemplateDetailResponse updateTemplate(Long id, UpdateTemplateRequest request) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu thiệp để cập nhật."));

        if (request.getTitle() != null) template.setTitle(request.getTitle().trim());
        if (request.getCategory() != null) template.setCategory(request.getCategory());
        if (request.getCategoryLabel() != null) template.setCategoryLabel(request.getCategoryLabel());
        if (request.getStyle() != null) template.setStyle(request.getStyle());
        if (request.getBadge() != null) template.setBadge(request.getBadge());
        if (request.getImageUrl() != null) template.setImageUrl(request.getImageUrl());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getDefaultData() != null) template.setDefaultData(request.getDefaultData());
        if (request.getContentSchema() != null) template.setContentSchema(request.getContentSchema());
        if (request.getStatus() != null) template.setStatus(request.getStatus());

        template.setVersion(template.getVersion() + 1);

        return toDetailResponse(templateRepository.save(template));
    }

    /**
     * Tự động khởi tạo dữ liệu mẫu mặc định (Seed Data) khi ứng dụng khởi động.
     */
    @PostConstruct
    public void seedInitialTemplates() {
        if (!templateRepository.existsByCode("hb04-basic")) {
            Template hb04 = Template.builder()
                    .code("hb04-basic")
                    .title("Giao diện HB04 - Basic")
                    .category("wedding")
                    .categoryLabel("Cưới")
                    .style("Tươi sáng & Thanh lịch")
                    .badge("Miễn phí")
                    .imageUrl("/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp")
                    .description("Giao diện thiết kế tươi sáng mát mẻ, tạo cảm giác dễ chịu, vui vẻ cho người xem. Nơi lưu giữ kỷ niệm tuyệt vời cho dâu rể.")
                    .status(TemplateStatus.PUBLISHED)
                    .version(1)
                    .defaultData("{\"groomName\":\"Hà Văn Bách\",\"brideName\":\"Lưu Khánh Ly\",\"eventDate\":\"2026-12-25\",\"eventTime\":\"16:00\",\"venueName\":\"Tư Gia Nhà Trai - Thôn Trong\",\"venueAddress\":\"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang\",\"coverImageUrl\":\"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp\"}")
                    .contentSchema(buildHb04Schema())
                    .build();
            templateRepository.save(hb04);
        }
    }

    private String buildHb04Schema() {
        return "{\"version\":1,\"layoutMode\":\"STACK\",\"theme\":{\"primaryColor\":\"#A80606\",\"backgroundColor\":\"#FFFFFF\",\"headingFont\":\"serif\",\"bodyFont\":\"sans-serif\"},\"effects\":{\"fallingType\":\"PETALS\",\"musicUrl\":\"/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3\",\"openingEffect\":{\"enabled\":true,\"leftImage\":\"/templates/hb04/opening/left-thiep.webp\",\"rightImage\":\"/templates/hb04/opening/right-thiep.webp\",\"delayMs\":1200}},\"blocks\":[{\"id\":\"hero-1\",\"type\":\"HERO\",\"props\":{\"title\":\"SAVE THE DATE\",\"subtitle\":\"Trân trọng kính mời quý khách đến dự lễ thành hôn của\",\"groomName\":\"Văn Bách\",\"brideName\":\"Khánh Ly\",\"eventDate\":\"25 . 12 . 2026\",\"coverImageUrl\":\"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp\"}},{\"id\":\"couple-1\",\"type\":\"COUPLE\",\"props\":{\"sectionTitle\":\"Chú Rể & Cô Dâu\",\"quote\":\"Hôn nhân không phải là nơi thuyền tình cập bến, mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.\",\"groom\":{\"name\":\"Hà Văn Bách\",\"role\":\"GROOM\",\"photoUrl\":\"/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp\",\"fatherName\":\"Hà Văn Nam\",\"motherName\":\"Bùi Thị Như\",\"address\":\"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang\",\"storyQuote\":\"Anh chưa từng nghĩ mình có thể dành nhiều cảm xúc cho một người đến thế, rồi anh nhận ra điều đó khi gặp và yêu em.\"},\"bride\":{\"name\":\"Lưu Khánh Ly\",\"role\":\"BRIDE\",\"photoUrl\":\"/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp\",\"fatherName\":\"Lưu Hoàng Hải\",\"motherName\":\"Đỗ Thị Hảo\",\"address\":\"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang\",\"storyQuote\":\"Ở thời điểm phù hợp nhất, mặc lên người bộ váy cưới đẹp nhất, gả cho người đáng tin cậy nhất... người đó chỉ có thể là anh.\"}}},{\"id\":\"countdown-1\",\"type\":\"COUNTDOWN\",\"props\":{\"title\":\"Cùng Đếm Ngược Ngày Chung Đôi\",\"description\":\"Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình\",\"targetDate\":\"2026-12-25T16:00:00\"}},{\"id\":\"events-1\",\"type\":\"EVENTS\",\"props\":{\"title\":\"Sự Kiện Cưới\",\"groomEvents\":[{\"title\":\"Tiệc Cưới Nhà Trai\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp\"},{\"title\":\"Lễ Thành Hôn\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp\"}],\"brideEvents\":[{\"title\":\"Tiệc Cưới Nhà Gái\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Gái\",\"address\":\"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp\"},{\"title\":\"Lễ Vu Quy\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Gái\",\"address\":\"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp\"}]}},{\"id\":\"gallery-1\",\"type\":\"GALLERY\",\"props\":{\"title\":\"Album Ảnh Cưới\",\"subtitle\":\"Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa\",\"images\":[\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp\",\"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp\",\"/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp\",\"/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp\"]}},{\"id\":\"giftbox-1\",\"type\":\"GIFTBOX\",\"props\":{\"title\":\"Hộp Mừng Cưới\",\"subtitle\":\"Gửi món quà chúc phúc cho ngày vui của chúng mình\",\"groomAccount\":{\"ownerName\":\"HÀ VĂN BÁCH\",\"bankName\":\"MB Bank (Quân Đội)\",\"accountNumber\":\"0988123456\",\"qrCodeUrl\":\"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp\",\"label\":\"Mừng Cưới Chú Rể\"},\"brideAccount\":{\"ownerName\":\"LƯU KHÁNH LY\",\"bankName\":\"Techcombank\",\"accountNumber\":\"190366889988\",\"qrCodeUrl\":\"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp\",\"label\":\"Mừng Cưới Cô Dâu\"}}},{\"id\":\"thankyou-1\",\"type\":\"THANKYOU\",\"props\":{\"title\":\"Thank You\",\"message\":\"Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ.\",\"imageUrl\":\"/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp\"}},{\"id\":\"wishes-1\",\"type\":\"WISHES\",\"props\":{\"title\":\"Sổ Lưu Bút & Lời Chúc\",\"subtitle\":\"Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể\",\"allowRsvp\":true}}]}";
    }

    private TemplateSummaryResponse toSummaryResponse(Template template) {
        return TemplateSummaryResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .title(template.getTitle())
                .category(template.getCategory())
                .categoryLabel(template.getCategoryLabel())
                .style(template.getStyle())
                .badge(template.getBadge())
                .imageUrl(template.getImageUrl())
                .description(template.getDescription())
                .viewsCount(template.getViewsCount())
                .likesCount(template.getLikesCount())
                .createdAt(template.getCreatedAt())
                .build();
    }

    private TemplateDetailResponse toDetailResponse(Template template) {
        return TemplateDetailResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .title(template.getTitle())
                .category(template.getCategory())
                .categoryLabel(template.getCategoryLabel())
                .style(template.getStyle())
                .badge(template.getBadge())
                .imageUrl(template.getImageUrl())
                .description(template.getDescription())
                .forkedFromId(template.getForkedFromId())
                .version(template.getVersion())
                .status(template.getStatus())
                .defaultData(template.getDefaultData())
                .contentSchema(template.getContentSchema())
                .viewsCount(template.getViewsCount())
                .likesCount(template.getLikesCount())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
