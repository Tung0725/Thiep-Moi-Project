-- ==============================================================================
-- SQL Seed Script: Mẫu thiệp cưới HB04 - Basic (Hà Văn Bách & Lưu Khánh Ly)
-- Bảng đích: templates (PostgreSQL)
-- ==============================================================================

-- 1. Tạo bảng nếu chưa tồn tại (Dành cho chạy thủ công trên pgAdmin/DBeaver)
CREATE TABLE IF NOT EXISTS templates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    category_label VARCHAR(50),
    style VARCHAR(100),
    badge VARCHAR(30),
    image_url VARCHAR(500),
    description TEXT,
    forked_from_id BIGINT,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    default_data TEXT,
    content_schema TEXT NOT NULL,
    views_count BIGINT NOT NULL DEFAULT 0,
    likes_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chèn dữ liệu mẫu HB04 - Basic
INSERT INTO templates (
    code,
    title,
    category,
    category_label,
    style,
    badge,
    image_url,
    description,
    version,
    status,
    default_data,
    content_schema,
    views_count,
    likes_count,
    created_at,
    updated_at
)
VALUES (
    'hb04-basic',
    'Giao diện HB04 - Basic',
    'wedding',
    'Cưới',
    'Tươi sáng & Thanh lịch',
    'Miễn phí',
    '/templates/hb04/assets/75c863c2-a372-4fca-8fa5-335d3a30795e-full.webp',
    'Giao diện thiết kế tươi sáng mát mẻ, tạo cảm giác dễ chịu, vui vẻ cho người xem. Nơi lưu giữ kỷ niệm tuyệt vời cho dâu rể.',
    1,
    'PUBLISHED',
    '{"groomName":"Hà Văn Bách","brideName":"Lưu Khánh Ly","eventDate":"2026-12-25","eventTime":"16:00","venueName":"Tư Gia Nhà Trai - Thôn Trong","venueAddress":"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang","coverImageUrl":"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp"}',
    '{"version":1,"layoutMode":"STACK","theme":{"primaryColor":"#A80606","backgroundColor":"#FFFFFF","headingFont":"serif","bodyFont":"sans-serif"},"effects":{"fallingType":"PETALS","musicUrl":"/templates/hb04/audio/4360425c-05a9-4611-8ba7-45da2c47ab1d.mp3","openingEffect":{"enabled":true,"leftImage":"/templates/hb04/opening/left-thiep.webp","rightImage":"/templates/hb04/opening/right-thiep.webp","delayMs":1200}},"blocks":[{"id":"hero-1","type":"HERO","props":{"title":"SAVE THE DATE","subtitle":"Trân trọng kính mời quý khách đến dự lễ thành hôn của","groomName":"Văn Bách","brideName":"Khánh Ly","eventDate":"25 . 12 . 2026","coverImageUrl":"/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp"}},{"id":"couple-1","type":"COUPLE","props":{"sectionTitle":"Chú Rể & Cô Dâu","quote":"Hôn nhân không phải là nơi thuyền tình cập bến, mà là nơi hai người quyết định cùng giăng buồm vượt sóng ra khơi.","groom":{"name":"Hà Văn Bách","role":"GROOM","photoUrl":"/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp","fatherName":"Hà Văn Nam","motherName":"Bùi Thị Như","address":"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang","storyQuote":"Anh chưa từng nghĩ mình có thể dành nhiều cảm xúc cho một người đến thế, rồi anh nhận ra điều đó khi gặp và yêu em."},"bride":{"name":"Lưu Khánh Ly","role":"BRIDE","photoUrl":"/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp","fatherName":"Lưu Hoàng Hải","motherName":"Đỗ Thị Hảo","address":"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang","storyQuote":"Ở thời điểm phù hợp nhất, mặc lên người bộ váy cưới đẹp nhất, gả cho người đáng tin cậy nhất... người đó chỉ có thể là anh."}}},{"id":"countdown-1","type":"COUNTDOWN","props":{"title":"Cùng Đếm Ngược Ngày Chung Đôi","description":"Từng giây từng phút hướng về ngày hạnh phúc nhất của hai đứa mình","targetDate":"2026-12-25T16:00:00"}},{"id":"events-1","type":"EVENTS","props":{"title":"Sự Kiện Cưới","groomEvents":[{"title":"Tiệc Cưới Nhà Trai","timeText":"Vào Lúc 16:00 Thứ Bảy","dateText":"Ngày 24/12/2026","locationName":"Tư Gia Nhà Trai","address":"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang","illustrationUrl":"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp"},{"title":"Lễ Thành Hôn","timeText":"Vào Lúc 16:00 Thứ Bảy","dateText":"Ngày 24/12/2026","locationName":"Tư Gia Nhà Trai","address":"Thôn Trong, Xã Đông Phú, Huyện Lục Nam, Tỉnh Bắc Giang","illustrationUrl":"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp"}],"brideEvents":[{"title":"Tiệc Cưới Nhà Gái","timeText":"Vào Lúc 16:00 Thứ Bảy","dateText":"Ngày 24/12/2026","locationName":"Tư Gia Nhà Gái","address":"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang","illustrationUrl":"/templates/hb04/assets/83f091a9-45ce-4560-8ac8-085190c752cd-full.webp"},{"title":"Lễ Vu Quy","timeText":"Vào Lúc 16:00 Thứ Bảy","dateText":"Ngày 24/12/2026","locationName":"Tư Gia Nhà Gái","address":"Xã Tam Dị, Huyện Lục Nam, Tỉnh Bắc Giang","illustrationUrl":"/templates/hb04/assets/74f60f44-0ddd-4624-a57b-864692d07b67-full.webp"}]}},{"id":"gallery-1","type":"GALLERY","props":{"title":"Album Ảnh Cưới","subtitle":"Khoảnh khắc ngọt ngào ghi dấu tình yêu đôi lứa","images":["/templates/hb04/assets/21f2743d-5a44-43b0-ab13-41653668eefb-full.webp","/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp","/templates/hb04/assets/77f50417-11dc-4fe7-aa0e-05bbe6d27a4f-full.webp","/templates/hb04/assets/59d63e36-3928-4799-8298-717958d7a52e-full.webp","/templates/hb04/assets/c5528130-cef8-4fdc-8a0b-1aac3443e480-full.webp"]}},{"id":"giftbox-1","type":"GIFTBOX","props":{"title":"Hộp Mừng Cưới","subtitle":"Gửi món quà chúc phúc cho ngày vui của chúng mình","groomAccount":{"ownerName":"HÀ VĂN BÁCH","bankName":"MB Bank (Quân Đội)","accountNumber":"0988123456","qrCodeUrl":"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp","label":"Mừng Cưới Chú Rể"},"brideAccount":{"ownerName":"LƯU KHÁNH LY","bankName":"Techcombank","accountNumber":"190366889988","qrCodeUrl":"/templates/hb04/assets/c5fb8762-18cf-4bf1-97cb-483930f0c75b.webp","label":"Mừng Cưới Cô Dâu"}}},{"id":"thankyou-1","type":"THANKYOU","props":{"title":"Thank You","message":"Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ.","imageUrl":"/templates/hb04/assets/52f38fef-91a8-49b5-bff3-bb7303e1a59b-full.webp"}},{"id":"wishes-1","type":"WISHES","props":{"title":"Sổ Lưu Bút & Lời Chúc","subtitle":"Hãy gửi những lời chúc tốt đẹp nhất tới cô dâu & chú rể","allowRsvp":true}}]}',
    6600,
    142,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (code) DO UPDATE
SET
    title = EXCLUDED.title,
    content_schema = EXCLUDED.content_schema,
    default_data = EXCLUDED.default_data,
    updated_at = CURRENT_TIMESTAMP;
