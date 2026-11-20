package com.wedding.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.io.IOException;
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
     * Tự động khởi tạo hoặc nâng cấp dữ liệu mẫu mặc định (Seed Data v2 chuẩn 1:1 HB04) khi ứng dụng khởi động.
     */
    @PostConstruct
    public void seedInitialTemplates() {
        seedMinimalismTemplate();
        seedSongHyTemplate();
        var existingOpt = templateRepository.findByCodeOrId("hb04-basic");
        if (existingOpt.isEmpty()) {
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
                    .version(2)
                    .defaultData("{\"groomName\":\"Hà Văn Bách\",\"brideName\":\"Lưu Khánh Ly\",\"eventDate\":\"2026-12-25\",\"eventTime\":\"16:00\",\"venueName\":\"Tư Gia Nhà Trai - Thôn Trong\",\"venueAddress\":\"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang\",\"coverImageUrl\":\"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp\"}")
                    .contentSchema(buildHb04Schema())
                    .build();
            templateRepository.save(hb04);
            return;
        }

        Template existing = existingOpt.get();
        if (existing.getVersion() == null || existing.getVersion() < 2) {
            existing.setContentSchema(buildHb04Schema());
            existing.setVersion(2);
            templateRepository.save(existing);
        }
    }

    private void seedMinimalismTemplate() {
        if (templateRepository.existsByCode("minimalism-do-dam")) {
            return;
        }

        try (var input = new ClassPathResource("templates/minimalism-do-dam.json").getInputStream()) {
            var objectMapper = new ObjectMapper();
            var data = objectMapper.readTree(input);
            var request = CreateTemplateRequest.builder()
                    .code(data.path("id").asText())
                    .title(data.path("title").asText())
                    .category(data.path("category").asText())
                    .categoryLabel(data.path("categoryLabel").asText())
                    .style(data.path("style").asText())
                    .badge(data.path("badge").asText())
                    .imageUrl(data.path("imageUrl").asText())
                    .description(data.path("description").asText())
                    .defaultData(objectMapper.writeValueAsString(data.path("defaultData")))
                    .contentSchema(objectMapper.writeValueAsString(data.path("schema")))
                    .build();
            createTemplate(request);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load Minimalism wedding template seed", exception);
        }
    }

    private void seedSongHyTemplate() {
        if (templateRepository.existsByCode("song-hy-xanh")) {
            return;
        }
        try (var input = new ClassPathResource("templates/song-hy-xanh.json").getInputStream()) {
            var mapper = new ObjectMapper();
            var data = mapper.readTree(input);
            createTemplate(CreateTemplateRequest.builder()
                    .code(data.path("id").asText())
                    .title(data.path("title").asText())
                    .category(data.path("category").asText())
                    .categoryLabel(data.path("categoryLabel").asText())
                    .style(data.path("style").asText())
                    .badge(data.path("badge").asText())
                    .imageUrl(data.path("imageUrl").asText())
                    .description(data.path("description").asText())
                    .defaultData(mapper.writeValueAsString(data.path("defaultData")))
                    .contentSchema(mapper.writeValueAsString(data.path("schema")))
                    .build());
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load Song Hy wedding template seed", exception);
        }
    }

    private String buildHb04Schema() {
        return "{\"version\":2,\"layoutMode\":\"STACK\",\"theme\":{\"primaryColor\":\"#A80606\",\"backgroundColor\":\"#FFFFFF\",\"headingFont\":\"serif\",\"bodyFont\":\"sans-serif\"},\"effects\":{\"fallingType\":\"SNOW\",\"musicUrl\":\"/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3\",\"openingEffect\":{\"enabled\":true,\"leftImage\":\"/templates/hb04/opening/left-thiep.webp\",\"rightImage\":\"/templates/hb04/opening/right-thiep.webp\",\"delayMs\":500,\"durationMs\":1350}},\"blocks\":[{\"id\":\"hero-1\",\"type\":\"HERO\",\"props\":{\"title\":\"Save The Date\",\"subtitle\":\"For The Wedding Of\",\"groomName\":\"Văn Bách\",\"brideName\":\"Khánh Ly\",\"eventDate\":\"25 . 12 . 2026\",\"coverImageUrl\":\"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp\"}},{\"id\":\"couple-1\",\"type\":\"COUPLE\",\"props\":{\"sectionTitle\":\"Chú Rể & Cô Dâu\",\"weddingDateText\":\"Ngày 25 Tháng 12 Năm 2026\",\"quote\":\"Hôn nhân không phải là nơi thuyền tình cập bến,mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.\",\"groom\":{\"name\":\"Hà Văn Bách\",\"displayName\":\"Văn Bách\",\"role\":\"GROOM\",\"photoUrl\":\"/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp\",\"fatherName\":\"Hà Văn Nam\",\"motherName\":\"Bùi Thị Như\",\"address\":\"Thôn Trong, Xã Đông Phú Huyện Lục Nam, Tỉnh Bắc Giang\",\"storyQuote\":\"Anh chưa từng nghĩ mình có thể dành nhiều cảm xúc cho một người đến thế, rồi anh nhận ra điều đó khi gặp và yêu em. Yêu em và chung đôi bên cạnh em là cảm giác tuyệt vời nhất đối với anh. Em chính là nguồn động lực tích cực để anh luôn cố gắng cho tương lai hai đứa mình. Nhân sinh là vô thường. Không cầu sẽ ổn định, chỉ cầu được sống là chính mình, cùng em.\"},\"bride\":{\"name\":\"Lưu Khánh Ly\",\"displayName\":\"Khánh Ly\",\"role\":\"BRIDE\",\"photoUrl\":\"/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp\",\"fatherName\":\"Lưu Hoàng Hải\",\"motherName\":\"Đỗ Thị Hảo\",\"address\":\"Xã Tam Dị, Huyện Lục Nam Tỉnh Bắc Giang\",\"storyQuote\":\"Có điều này chắc chắn anh chưa bao giờ nghĩ tới, đó là lúc chúng ta mới bắt đầu em đã biết mình sẽ về chung một nhà. Chưa bao giờ em cảm thấy mình được yêu, mình được thương và được trân trọng khi ở cạnh một người như thế! Ngày chung đôi là ngày em hạnh phúc nhất!\\nỞ thời điểm phù hợp nhất, mặc lên người bộ váy cưới đẹp nhất, gả cho người đáng tin cậy nhất, người đó chỉ có thể… là anh.\"}}},{\"id\":\"events-1\",\"type\":\"EVENTS\",\"props\":{\"title\":\"Sự Kiện Cưới\",\"groomEvents\":[{\"title\":\"TIỆC CƯỚI NHÀ TRAI\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú\\nHuyện Lục Nam Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp\"},{\"title\":\"LỄ THÀNH HÔN\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú\\nHuyện Lục Nam Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp\"}],\"brideEvents\":[{\"title\":\"TIỆC CƯỚI NHÀ GÁI\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú\\nHuyện Lục Nam Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp\"},{\"title\":\"LỄ VU QUY\",\"timeText\":\"Vào Lúc 16:00 Thứ Bảy\",\"dateText\":\"Ngày 24/12/2026\",\"locationName\":\"Tư Gia Nhà Trai\",\"address\":\"Thôn Trong, Xã Đông Phú\\nHuyện Lục Nam Tỉnh Bắc Giang\",\"illustrationUrl\":\"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp\"}]}},{\"id\":\"gallery-1\",\"type\":\"GALLERY\",\"props\":{\"title\":\"Album Ảnh Cưới\",\"images\":[\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\",\"/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp\"]}},{\"id\":\"giftbox-1\",\"type\":\"GIFTBOX\",\"props\":{\"title\":\"Hộp Mừng Cưới\",\"groomPhotoUrl\":\"/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp\",\"bridePhotoUrl\":\"/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp\",\"groomAccount\":{\"ownerName\":\"HÀ VĂN BÁCH\",\"bankName\":\"MB Bank (Quân Đội)\",\"accountNumber\":\"0988123456\",\"qrCodeUrl\":\"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp\",\"label\":\"MỪNG CƯỚI CHÚ RỂ\"},\"brideAccount\":{\"ownerName\":\"LƯU KHÁNH LY\",\"bankName\":\"Techcombank\",\"accountNumber\":\"190366889988\",\"qrCodeUrl\":\"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp\",\"label\":\"MỪNG CƯỚI CÔ DÂU\"}}},{\"id\":\"thankyou-1\",\"type\":\"THANKYOU\",\"props\":{\"title\":\"Thank You\",\"message\":\"Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.\",\"imageUrl\":\"/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp\"}},{\"id\":\"wishes-1\",\"type\":\"WISHES\",\"props\":{\"title\":\"Sổ Lưu Bút & Lời Chúc\",\"subtitle\":\"Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể\",\"allowRsvp\":true}}]}";
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
