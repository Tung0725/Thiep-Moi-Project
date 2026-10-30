# 🗺️ BẢN KẾ HOẠCH TRIỂN KHAI CHI TIẾT (MASTER EXECUTION PLAN)
## Kiểm Soát Chất Lượng Dự Án Thiệp Cưới Trực Tuyến (JSON-Driven UI)

> **Mục tiêu tối thượng:** Chia nhỏ dự án thành **5 Giai đoạn Module Độc lập (Isolated Technical Modules)** với định dạng **Checklist Kỹ thuật**.
> **Nguyên tắc "Quality Gate":** Mỗi giai đoạn đều có tiêu chí nghiệm thu độc lập (**QA Gate**). Lập trình viên **tuyệt đối không nhảy cóc** sang giai đoạn tiếp theo khi chưa vượt qua 100% bài kiểm tra của giai đoạn hiện tại.
> **Quy tắc làm việc:** Mỗi thời điểm chỉ mở đúng 1 nhánh Git và 1 Giai đoạn. Viết Backend trước $\rightarrow$ Test Postman xanh 100% $\rightarrow$ Mới chuyển sang viết Frontend $\rightarrow$ Kiểm định độc lập trước khi merge.

---

## 📊 Bảng Tóm Tắt 5 Giai Đoạn & Quality Gates

| Giai đoạn | Nhánh Git | Trọng tâm kỹ thuật | QA Gate nghiệm thu độc lập |
|:---|:---|:---|:---|
| **Giai đoạn 1** | `feat/module-rsvp` | Khối tương tác khách mời (RSVP & Lời chúc thực tế) | Postman test 400 Bad Request, 201 Created; UI gửi 3 lời chúc liên tiếp mượt mà, F5 giữ nguyên dữ liệu từ DB. |
| **Giai đoạn 2** | `feat/module-dashboard` | Khối quản trị chủ thiệp (User Dashboard & Thống kê) | Chặn truy cập 403 Forbidden chéo tài khoản; Mở file CSV bằng Excel hiển thị chuẩn tiếng Việt UTF-8 BOM, khớp số liệu tiệc. |
| **Giai đoạn 3** | `feat/module-media` | Khối lưu trữ đa phương tiện (Media & S3/MinIO Upload) | Backend chặn file giả mạo/vượt dung lượng; Upload từ Studio cập nhật Live Canvas và nạp URL vào Schema tức thì. |
| **Giai đoạn 4** | `feat/module-billing` | Khối thanh toán tự động & Kích hoạt gói VIP (VietQR/Webhook) | Postman giả lập Webhook xử lý đúng Idempotency; Polling UI tự động kích hoạt VIP và ẩn dải Watermark chân trang. |
| **Giai đoạn 5** | `feat/module-free-canvas` | Khối biên tập kéo thả tự do (Free-form Canvas Engine) | Mẫu STACK cũ chạy bình thường (tương thích ngược 100%); Thiệp FREE_CANVAS hiển thị chuẩn tỷ lệ tọa độ trên mọi màn hình. |

---

## 🔍 Bảng Đối Chiếu Kỹ Thuật (Codebase Thực Tế vs Đề Xuất Mới)

| Hạng mục kỹ thuật | Tài liệu cũ / Đề xuất thô | Hiện trạng Codebase thực tế | Quyết định chuẩn hóa trong Lộ trình mới |
|:---|:---|:---|:---|
| **Khóa chính & Ngoại của `wishes`** | Khóa ngoại `invitation_id` kiểu `UUID` | `Invitation.java` dùng `Long id` (`GenerationType.IDENTITY`) | **Bắt buộc:** `wishes.invitation_id` là kiểu `BIGINT NOT NULL REFERENCES invitations(id)`. Khóa chính `wishes.id` dùng `BIGSERIAL` (hoặc UUID). |
| **Tên cột xác nhận tham dự** | `sender_name`, `attendance` ('ATTENDING', 'DECLINED') | Frontend `types/api.ts` dùng `senderName`, `attendance` | **Nâng cấp:** Đổi sang `guest_name`, `attendance_status`, bổ sung cột `guest_count` (INT, default 1) để dâu rể chốt mâm cỗ chuẩn xác. |
| **REST API Context Path & Security** | Gọi trực tiếp `/api/v1/invitations/{slug}/wishes` | `application.yml` có `context-path: /api/v1`; `SecurityConfig.java` chỉ mở `permitAll()` cho `/auth/**`, `/public/**`, `/templates/**` | Dùng `/public/invitations/{slug}/wishes` (hoặc mở quyền trong `SecurityConfig`) cho API khách mời; mở `.requestMatchers("/webhooks/**").permitAll()` cho Webhook thanh toán. |
| **Tên Component Block Frontend** | Đề xuất: `RsvpAndWishesBlock` | `ComponentRegistry.ts` đã đăng ký type `WISHES` $\rightarrow$ `WishesBlock.tsx` | **Giữ nguyên tên Block:** Giữ `type: "WISHES"` để tương thích hoàn toàn với Schema mẫu `hb04-basic` trong DB, nâng cấp code bên trong `WishesBlock.tsx`. |
| **Trạng thái cột `user_id` & API Sửa Thiệp** | Cần chạy ALTER TABLE bổ sung `user_id` | `Invitation.java` đã có sẵn `private UUID userId;`, nhưng `/editor/studio` hiện mới chỉ sửa `Template` | Gán `user_id` cho thiệp mẫu; bổ sung API `GET` & `PUT /api/v1/me/invitations/{id}` và nâng cấp `/editor/studio?id=...` để tải/lưu `Invitation` của User. |
| **Thư viện S3 / MinIO & Multipart Limit** | Đề xuất: Thêm dependency AWS SDK S3 | `backend/pom.xml` đã có `software.amazon.awssdk:s3` v2.28.27; `application.yml` đang giới hạn `max-file-size: 10MB` | Giữ nguyên `pom.xml`, nâng `max-file-size` & `max-request-size` lên `15MB`, kiểm tra **Magic Bytes (File Signature)** trong `MediaService` để chặn file giả mạo. |
| **Thuộc tính Góc Xoay (`ElementLayout`)** | Đề xuất dùng `layout.rotate` | `frontend/src/types/schema.ts` đã định nghĩa `rotation?: number` trong `ElementLayout` | Đồng bộ sử dụng `layout.rotation` ở cả `PageRenderer.tsx` và trình kéo thả Studio để khớp 100% với TypeScript Schema. |
| **Cấu trúc Design Principles** | Tùy biến tự do | Tuân thủ nghiêm ngặt **Master Agent Rules**: No Impl, DTO request/response, Max lines, Constructor Injection | Bắt buộc áp dụng toàn bộ chuẩn Clean Code, OWASP Top 10 và ApiResponse wrapper vào từng Task. |

---

## 🚀 GIAI ĐOẠN 1: KHỐI TƯƠNG TÁC KHÁCH MỜI (RSVP & LỜI CHÚC)
**Nhánh Git:** `feat/module-rsvp`  
**Mục tiêu cô lập:** Không đụng vào trang quản trị hay logic tạo thiệp. Sử dụng 1 thiệp mẫu đã có sẵn trong Database (ví dụ slug = `"hb04-demo"` hoặc `"test-thiep"`) để làm nơi gửi và hiển thị lời chúc theo thời gian thực.

### 1.1. Tầng Database (PostgreSQL)
- [ ] **Viết script DDL tạo bảng `wishes`:**
  - `id`: `BIGSERIAL` (hoặc `UUID DEFAULT gen_random_uuid()`) làm Primary Key.
  - `invitation_id`: `BIGINT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE`.
  - `guest_name`: `VARCHAR(100) NOT NULL` (Tên khách mời).
  - `attendance_status`: `VARCHAR(20) NOT NULL` (`ATTENDING`, `DECLINED`, `MAYBE`).
  - `guest_count`: `INT NOT NULL DEFAULT 1` (Số lượng người đi cùng; gán = 0 nếu `DECLINED`).
  - `message`: `VARCHAR(500)` (Nội dung lời chúc, cho phép NULL nếu khách chỉ xác nhận dự tiệc).
  - `created_at`: `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`.
- [ ] **Tạo Index truy vấn hiệu năng cao:**
  - `CREATE INDEX idx_wishes_invitation_created ON wishes(invitation_id, created_at DESC);`

### 1.2. Tầng Backend (Spring Boot 3 - Java 21)
- [ ] **Tạo Entity & Repository:**
  - Thực thể `com.wedding.wish.entity.Wish.java` (Lombok, JpaRepository).
  - Khai báo `com.wedding.wish.repository.WishRepository.java` với hàm:
    - `Page<Wish> findByInvitationIdOrderByCreatedAtDesc(Long invitationId, Pageable pageable);`
    - `long countByInvitationId(Long invitationId);`
- [ ] **Tạo DTOs chuẩn cấu trúc (`dto.request` & `dto.response`):**
  - `dto.request.SubmitWishRequest`:
    - `@NotBlank(message = "Tên khách mời không được để trống") @Size(max = 100) String guestName;`
    - `@NotBlank @Pattern(regexp = "ATTENDING|DECLINED|MAYBE") String attendanceStatus;`
    - `@Min(0) @Max(10) Integer guestCount;`
    - `@Size(max = 500, message = "Lời chúc không vượt quá 500 ký tự") String message;`
  - `dto.response.WishResponseDto`: `id`, `guestName`, `attendanceStatus`, `guestCount`, `message`, `createdAt`.
- [ ] **Tạo Service `WishService.java` (Không dùng interface/impl):**
  - Sử dụng Constructor Injection.
  - Hàm `WishResponseDto submitWish(String slug, SubmitWishRequest request)`: Tìm `invitation` theo `slug` (nếu không thấy ném `ResourceNotFoundException(404)`). Lưu `Wish` mới vào DB và trả về DTO.
  - Hàm `Page<WishResponseDto> getWishesBySlug(String slug, Pageable pageable)`: Trả về danh sách phân trang sắp xếp mới nhất.
- [ ] **Tạo Controller `WishController.java` & Cấu hình Security:**
  - Annotation `@RestController`, `@RequestMapping("/public/invitations/{slug}/wishes")` (nằm trong nhánh `/public/**` đã được `permitAll()` tại `SecurityConfig.java`, đồng bộ với `PublicInvitationController`).
  - **API 1 (Public):** `POST /api/v1/public/invitations/{slug}/wishes` $\rightarrow$ Trả về `201 Created` kèm `ApiResponse<WishResponseDto>`.
  - **API 2 (Public):** `GET /api/v1/public/invitations/{slug}/wishes?page=0&size=10` $\rightarrow$ Trả về `200 OK` kèm `ApiResponse<Page<WishResponseDto>>`.

### 1.3. Tầng Frontend (Next.js 14)
- [ ] **Cập nhật Service & Types:**
  - Bổ sung interface `SubmitWishPayload` và `WishItemResponse` vào `frontend/src/types/api.ts`.
  - Thêm 2 hàm gọi API vào `frontend/src/services/invitationService.ts`:
    - `submitWish(slug: string, payload: SubmitWishPayload): Promise<WishItemResponse>`
    - `getWishes(slug: string, page?: number, size?: number): Promise<PageResponse<WishItemResponse>>`
- [ ] **Nâng cấp `frontend/src/components/renderer/blocks/WishesBlock.tsx`:**
  - Đọc `slug` từ props truyền xuống từ `PageRenderer`.
  - **Khu vực Form nhập liệu:**
    - Input nhập Tên khách mời (`guestName`, bắt buộc).
    - Bộ nút chọn trạng thái tham dự (`ATTENDING` / `DECLINED`).
    - Ô chọn số người đi cùng (`guestCount` từ 1 đến 5). Khi chọn `DECLINED` $\rightarrow$ tự động gán `guestCount = 0` và ẩn/vô hiệu hóa ô này.
    - Textarea nhập lời chúc mừng (bỏ thuộc tính `required` cứng trên thẻ `<textarea>` để cho phép khách chỉ xác nhận RSVP nhanh mà không bắt buộc gõ lời chúc).
    - Nút bấm "Gửi Lời Chúc" có hiệu ứng loading khi đang gửi.
  - **Khu vực Sổ lưu bút (Wish List Feed):**
    - Tải danh sách lời chúc thực tế từ backend khi mount component.
    - Khung cuộn mượt mà có phân trang hoặc nút "Xem thêm lời chúc".
    - Khi submit thành công: Tự động chèn ngay lời chúc mới lên đầu danh sách (Optimistic UI) kèm thông báo thành công.

### 1.4. Kiểm Định Độc Lập (QA Gate 1)
- [ ] **Test Postman (Backend API - Không truyền JWT Token):**
  - Gửi request `POST` để trống `guestName` $\rightarrow$ Nhận đúng mã `400 Bad Request` kèm message lỗi cụ thể.
  - Gửi request `POST` với slug không tồn tại (`/public/invitations/slug-fake-123/wishes`) $\rightarrow$ Nhận đúng mã `404 Not Found`.
  - Gửi request `POST` hợp lệ $\rightarrow$ Nhận đúng mã `201 Created` và dữ liệu trả về nằm trong wrapper `ApiResponse<T>`.
  - Gọi `GET /api/v1/public/invitations/{slug}/wishes?page=0&size=5` $\rightarrow$ Nhận đúng danh sách lời chúc vừa tạo.
- [ ] **Test Giao diện (Frontend End-to-End):**
  - Mở link `/t/{slug}` trên tab ẩn danh trình duyệt.
  - Gửi liên tiếp 3 lời chúc mừng với các trạng thái khác nhau (1 Đi 2 người, 1 Bận không đến, 1 Đi 1 người).
  - Danh sách lời chúc lập tức hiển thị cả 3 lời chúc trên giao diện.
  - F5 tải lại trang: Dữ liệu 3 lời chúc vẫn hiển thị nguyên vẹn từ Database PostgreSQL.

---

## 👥 GIAI ĐOẠN 2: KHỐI QUẢN TRỊ KHÁCH HÀNG (USER DASHBOARD)
**Nhánh Git:** `feat/module-dashboard`  
**Mục tiêu cô lập:** Quản lý danh sách thiệp của người dùng và bảng điều khiển tổng hợp số liệu khách mời từ bảng `wishes` của Giai đoạn 1. Tạm thời coi mọi thiệp là gói `FREE` và dùng ảnh bìa mặc định.

### 2.1. Tầng Database (PostgreSQL)
- [ ] **Kiểm tra liên kết User & Thiệp:**
  - Xác nhận bảng `invitations` đã có cột `user_id` liên kết với bảng `users(id)`.
  - Viết câu lệnh SQL cập nhật gán thiệp mẫu hiện có cho `user_id` của tài khoản thử nghiệm của bạn để hiển thị trên Dashboard.

### 2.2. Tầng Backend (Spring Boot 3)
- [ ] **DTOs cho Dashboard & Chỉnh sửa Thiệp:**
  - `dto.response.MyInvitationSummaryDto`: `id`, `slug`, `title`, `coverImageUrl`, `status`, `createdAt`, `totalWishes`.
  - `dto.response.MyInvitationDetailDto`: Bổ sung `contentSchema` và metadata để nạp vào Studio khi chỉnh sửa thiệp.
  - `dto.request.UpdateInvitationRequest`: `title`, `groomName`, `brideName`, `eventDate`, `eventTime`, `venueName`, `venueAddress`, `status`, `contentSchema`.
  - `dto.response.InvitationStatsDto`: `totalWishes`, `totalAttendingGuests` (tổng số người tham dự), `totalDeclined` (số người báo bận), `totalMaybe`.
- [ ] **Service & Query Aggregation:**
  - Trong `WishRepository`:
    - Viết câu truy vấn tổng hợp: `SELECT COALESCE(SUM(w.guestCount), 0) FROM Wish w WHERE w.invitation.id = :invitationId AND w.attendanceStatus = 'ATTENDING'`.
    - Viết đếm số lượng theo trạng thái: `long countByInvitationIdAndAttendanceStatus(Long invitationId, String status);`.
- [ ] **APIs Quản trị Người dùng (Bắt buộc xác thực JWT):**
  - Tạo `DashboardController.java` với `@RequestMapping("/me/invitations")`:
  - **API 1:** `GET /api/v1/me/invitations` $\rightarrow$ Lấy danh sách thiệp do chính user đang đăng nhập sở hữu (trích xuất `userId` từ `UserPrincipal`).
  - **API 2:** `GET /api/v1/me/invitations/{id}` & `PUT /api/v1/me/invitations/{id}` $\rightarrow$ Kiểm tra quyền sở hữu (`invitation.userId.equals(currentUserId)`), lấy chi tiết hoặc lưu cập nhật `contentSchema` của thiệp từ Studio.
  - **API 3:** `GET /api/v1/me/invitations/{id}/stats` $\rightarrow$ Kiểm tra quyền sở hữu (`invitation.userId.equals(currentUserId)`), nếu sai trả về `403 Forbidden`. Trả về `InvitationStatsDto`.
  - **API 4:** `GET /api/v1/me/invitations/{id}/wishes/export` $\rightarrow$ Xuất toàn bộ danh sách khách mời và lời chúc dưới định dạng chuỗi CSV chuẩn kèm mã `\uFEFF` (UTF-8 BOM) để mở trực tiếp trên Microsoft Excel không bị lỗi font tiếng Việt.

### 2.3. Tầng Frontend (Next.js 14)
- [ ] **Xây dựng Route `/dashboard` (Bảo vệ đăng nhập):**
  - Kiểm tra trạng thái xác thực từ `authService`/Zustand store; nếu chưa đăng nhập điều hướng về `/login`.
- [ ] **Khu vực 1: Danh Sách Thiệp Của Tôi (`MyCardsSection`):**
  - Hiển thị danh sách thiệp dạng lưới thẻ hiện đại.
  - Mỗi thẻ hiển thị: Tên dâu rể, trạng thái (`DRAFT` / `PUBLISHED`), đường dẫn `/t/{slug}`.
  - Các nút tác vụ: Nút **[Chỉnh sửa Studio]** (trỏ tới `/editor/studio?id=...`, nâng cấp `StudioEditorPage` để khi có query `?id=` thì tải và lưu `Invitation` của User qua `invitationService` thay vì sửa `Template`), nút **[Sao chép link]**, và nút **[Tải mã QR]** (sử dụng thư viện `qrcode.react` tạo file PNG trực tiếp trên trình duyệt).
- [ ] **Khu vực 2: Bảng Thống Kê & Quản Lý Khách Mời (`GuestStatsSection`):**
  - Khi người dùng click chọn 1 thiệp:
    - 3 Khối Metric Card nổi bật: **Tổng phản hồi**, **Tổng số khách đi dự tiệc (đặt bàn)**, **Số khách báo bận**.
    - Bảng chi tiết danh sách lời chúc bên dưới có hỗ trợ tìm kiếm theo tên khách.
    - Nút **[Xuất File Excel/CSV]**: Bấm tải file CSV về máy tính.

### 2.4. Kiểm Định Độc Lập (QA Gate 2)
- [ ] **Test Phân Quyền & Bảo Mật (Postman):**
  - Đăng nhập tài khoản User A lấy Access Token. Đăng nhập tài khoản User B lấy Access Token.
  - Dùng Token của User B gọi API thống kê `GET /api/v1/me/invitations/{id_cua_A}/stats` $\rightarrow$ Hệ thống bắt buộc từ chối với mã `403 Forbidden`.
- [ ] **Test Nghiệp Vụ & Dữ Liệu:**
  - Thêm 2 lời chúc mới cho thiệp: 1 khách đi 3 người, 1 khách đi 2 người $\rightarrow$ Màn hình Dashboard phải nhảy số `Tổng số khách dự tiệc` tăng đúng 5 người.
  - Tải file CSV về máy, mở bằng phần mềm Microsoft Excel: Tiếng Việt có dấu hiển thị chuẩn xác 100%, không bị lỗi font `???` hay `Ã¡`.

---

## 🖼️ GIAI ĐOẠN 3: KHỐI LƯU TRỮ ĐA PHƯƠNG TIỆN (MEDIA & UPLOAD SERVICE)
**Nhánh Git:** `feat/module-media`  
**Mục tiêu cô lập:** Xây dựng một dịch vụ độc lập tiếp nhận tệp tải lên (Ảnh JPEG/PNG/WebP và Âm thanh MP3) và trả về đường dẫn URL tĩnh. Khi dịch vụ chạy hoàn hảo độc lập mới tích hợp vào thanh Inspector của Studio.

### 3.1. Tầng Hạ Tầng & Database
- [ ] **Khởi chạy Object Storage (MinIO Local / Cloudflare R2):**
  - Chạy `docker compose up -d minio` (đã khai báo trong `docker-compose.yml`).
  - Thiết lập bucket `wedding-media` với chính sách **Public Read** để link ảnh/nhạc có thể xem được từ bên ngoài.
- [ ] **Tạo bảng `media_files` trong Database:**
  - `id`: `BIGSERIAL PRIMARY KEY`.
  - `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`.
  - `file_name`: `VARCHAR(255) NOT NULL`.
  - `file_url`: `VARCHAR(500) NOT NULL`.
  - `content_type`: `VARCHAR(100) NOT NULL`.
  - `file_size`: `BIGINT NOT NULL`.
  - `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.

### 3.2. Tầng Backend (Spring Boot 3)
- [ ] **Cấu hình Multipart & AWS S3 Client:**
  - Nâng giới hạn trong `application.yml`: `spring.servlet.multipart.max-file-size: 15MB` và `max-request-size: 15MB` (bắt ngoại lệ `MaxUploadSizeExceededException` trong `GlobalExceptionHandler` để trả về `400 Bad Request`).
  - Tạo cấu hình `S3Config.java` kết nối tới MinIO / S3 endpoint qua `app.storage` trong `application.yml`.
- [ ] **Service `MediaService.java`:**
  - Hàm `UploadFileResponse uploadMedia(MultipartFile file, UUID userId)`:
    - Kiểm tra định dạng thực tế (**Magic Bytes / File Signature** từ `InputStream` kết hợp MIME Type): Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp` ($\le 5\text{MB}$) và `audio/mpeg` ($\le 15\text{MB}$). Chặn triệt để các file giả mạo như `.pdf` hoặc `.exe` đổi đuôi thành `.png`.
    - Chuẩn hóa tên tệp: Sinh chuỗi duy nhất `UUID + "." + extension` tránh lỗi trùng tên và ký tự tiếng Việt.
    - Đẩy file lên Bucket qua `s3Client.putObject(...)`.
    - Ghi lại bản ghi vào bảng `media_files`.
- [ ] **API Controller `MediaController.java`:**
  - `POST /api/v1/media/upload` (Yêu cầu JWT) $\rightarrow$ Trả về `201 Created` kèm `{ "fileUrl": "http://localhost:9000/wedding-media/..." }`.

### 3.3. Tầng Frontend (Next.js 14)
- [ ] **Tạo Component độc lập `<MediaUploader />`:**
  - Props: `accept` ('image/*' | 'audio/*'), `maxSizeMB`, `onUploadSuccess: (url: string) => void`.
  - Hiển thị thanh tiến trình tải lên (Progress bar / Loading state).
- [ ] **Tích hợp vào Template Studio (`/editor/studio`):**
  - Mở cột 3 (Property Inspector):
    - Khối Ảnh đại diện (Cover Image), Gallery ảnh cưới: Đặt nút `<MediaUploader />` cạnh ô nhập URL ảnh.
    - Cài đặt Nhạc nền: Đặt nút tải lên file MP3.
    - Khi upload hoàn tất $\rightarrow$ Tự động cập nhật trực tiếp URL mới vào cây Zustand Schema.

### 3.4. Kiểm Định Độc Lập (QA Gate 3)
- [ ] **Test Chặn Lỗi Đầu Vào (Security & Size Validation):**
  - Cố tình upload một file ảnh nặng > 5MB hoặc file `.pdf` đổi đuôi thành `.png` $\rightarrow$ Backend lập tức từ chối bằng kiểm tra Magic Bytes / Size và phản hồi lỗi `400 Bad Request`.
- [ ] **Test Tích Hợp Live Studio:**
  - Vào `/editor/studio?id=...`, tải 1 ảnh mới từ máy tính $\rightarrow$ Cột Live Canvas ở giữa đổi sang ảnh mới ngay lập tức.
  - Bấm **Lưu thiệp** $\rightarrow$ Mở trang `/t/{slug}` trên điện thoại thấy ảnh hiển thị sắc nét và nhạc nền phát chuẩn xác.

---

## 💳 GIAI ĐOẠN 4: KHỐI THANH TOÁN TỰ ĐỘNG & KÍCH HOẠT GÓI (BILLING & PAYMENT)
**Nhánh Git:** `feat/module-billing`  
**Mục tiêu cô lập:** Xây dựng cơ chế khóa/mở khóa tính năng VIP dựa trên đơn hàng. Hoàn thành toàn bộ quy trình với Webhook giả lập trước khi kết nối tài khoản SePay/VietQR thật.

### 4.1. Tầng Database (PostgreSQL)
- [ ] **Bổ sung cột cho bảng `invitations`:**
  - `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE';`
  - `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS is_watermark_removed BOOLEAN NOT NULL DEFAULT FALSE;`
  - `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;`
- [ ] **Tạo bảng `orders`:**
  - `id`: `BIGSERIAL PRIMARY KEY`.
  - `user_id`: `UUID NOT NULL REFERENCES users(id)`.
  - `invitation_id`: `BIGINT NOT NULL REFERENCES invitations(id)`.
  - `order_code`: `VARCHAR(50) NOT NULL UNIQUE` (Ví dụ: `WED83721` - dùng làm nội dung chuyển khoản).
  - `amount`: `BIGINT NOT NULL` (Ví dụ: `99000`).
  - `status`: `VARCHAR(20) NOT NULL DEFAULT 'PENDING'` (`PENDING`, `PAID`, `CANCELLED`).
  - `paid_at`: `TIMESTAMP WITH TIME ZONE`.
  - `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.

### 4.2. Tầng Backend (Spring Boot 3)
- [ ] **Cập nhật Entity & Public DTO:**
  - Bổ sung `planType`, `watermarkRemoved`, `expiresAt` vào `Invitation.java`.
  - Bổ sung `planType` và `watermarkRemoved` vào `PublicCardResponse.java` (để trang `/t/{slug}` đọc được trạng thái gói của thiệp).
- [ ] **API Tạo Đơn Hàng & Tra Cứu Trạng Thái (Cần JWT):**
  - `POST /api/v1/orders`: Nhận `invitationId`, tạo bản ghi đơn hàng với mã duy nhất `WED + RandomNumeric(6)`.
  - Trả về thông tin đơn hàng kèm URL ảnh VietQR động:
    - `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=99000&addInfo=WED83721`
  - `GET /api/v1/orders/{orderCode}`: Phục vụ Frontend Polling kiểm tra trạng thái đơn hàng (`PENDING` / `PAID`).
- [ ] **API Webhook Nhận Tiền (Bảo vệ bằng Secret Key Header):**
  - Mở quyền `.requestMatchers("/webhooks/**").permitAll()` trong `SecurityConfig.java` (vì SePay/Ngân hàng gọi Server-to-Server không dùng JWT của User).
  - Endpoint: `POST /api/v1/webhooks/payment`
  - **Kiểm tra Header:** Header `X-Webhook-Secret` phải khớp chính xác với `PAYMENT_WEBHOOK_SECRET` trong cấu hình (nếu sai trả về `401 Unauthorized` hoặc `403 Forbidden`).
  - **Xử lý Lũy đẳng (Idempotency):** Tìm `order` theo mã `order_code`. Nếu trạng thái đơn hàng đã là `PAID`, lập tức trả về `200 OK` và dừng lại (tránh xử lý lặp).
  - **Kích hoạt gói dịch vụ (Bọc trong `@Transactional`):**
    - Cập nhật `order.status = 'PAID'`, `order.paidAt = Instant.now()`.
    - Nâng cấp thiệp tương ứng: `invitation.setPlanType("VIP")`, `invitation.setWatermarkRemoved(true)`, gia hạn `expiresAt` thêm 1 năm.

### 4.3. Tầng Frontend (Next.js 14)
- [ ] **Giao diện Nâng Cấp VIP tại Dashboard:**
  - Cạnh mỗi thiệp gói `FREE` hiển thị nút **[Nâng cấp VIP]**.
  - Bấm vào mở Modal thanh toán: Hiển thị ảnh mã VietQR, Số tài khoản, Ngân hàng, Số tiền và Nội dung chuyển khoản in đậm kèm nút sao chép nhanh.
- [ ] **Cơ chế Tự Động Kích Hoạt (Polling):**
  - Khi Modal thanh toán đang mở, tự động gọi API kiểm tra trạng thái đơn hàng mỗi 3 giây (polling) kèm nút bấm thủ công "Tôi đã chuyển khoản".
  - Khi nhận `status === 'PAID'` $\rightarrow$ Bắn hiệu ứng pháo hoa, đổi nhãn thiệp thành **VIP** và đóng modal.
- [ ] **Kiểm soát Watermark tại `PageRenderer` (`/t/{slug}`):**
  - Đọc `planType` / `watermarkRemoved` từ `PublicCardResult` truyền xuống `PageRenderer`.
  - Nếu `planType === 'FREE'` (hoặc `!watermarkRemoved`): Hiển thị dải băng mờ cố định ở góc dưới: *"Thiệp cưới tạo miễn phí tại loiyeuthuong.vn"*.
  - Nếu `planType === 'VIP'` (hoặc `watermarkRemoved === true`): Ẩn hoàn toàn dải băng này.

### 4.4. Kiểm Định Độc Lập (QA Gate 4)
- [ ] **Test Giả Lập Webhook Ngân Hàng (Postman):**
  - Mở đơn hàng trên giao diện lấy mã `WED98231`.
  - Dùng Postman gửi request giả lập Webhook gọi tới `/api/v1/webhooks/payment` kèm mã đó $\rightarrow$ Modal trên trình duyệt tự động cập nhật sang trạng thái "Thanh toán thành công!".
- [ ] **Test Chống Xử Lý Lặp (Idempotency Test):**
  - Bấm nút Send trên Postman thêm 5 lần liên tiếp với cùng payload đó $\rightarrow$ Hệ thống vẫn trả về `200 OK`, cơ sở dữ liệu không bị lỗi và thời hạn sử dụng không bị cộng dồn thành 5 năm.

---

## 🎨 GIAI ĐOẠN 5: KHỐI BIÊN TẬP KÉO THẢ TỰ DO (FREE-FORM CANVAS)
**Nhánh Git:** `feat/module-free-canvas`  
**Mục tiêu cô lập:** Tập trung 100% tại Frontend Next.js. Cơ sở dữ liệu và Backend giữ nguyên vì `PageSchema` (`frontend/src/types/schema.ts`) đã có sẵn trường `layout: { x, y, width, height, rotation, zIndex }`.

### 5.1. Chuẩn Hóa Hệ Tọa Độ & Scale Factor
- [ ] **Quy ước Canvas Gốc:**
  - Khung Mobile chuẩn: Chiều rộng cố định $W_{base} = 375\text{px}$. Chiều cao section mẫu cố định $650\text{px}$.
  - Tính toán tỷ lệ co giãn linh hoạt:  
    $$\text{Scale Factor} = \frac{\text{Chiều rộng màn hình thực tế}}{375}$$
  - Áp dụng qua thuộc tính CSS `transform: scale(scaleFactor)` để giao diện hiển thị đồng nhất 100% trên mọi kích thước màn hình từ iPhone Mini đến iPhone Pro Max.

### 5.2. Nâng Cấp Engine Hiển Thị (`PageRenderer.tsx`)
- [ ] **Hỗ trợ Chế độ Kép (Hybrid Rendering):**
  - Kiểm tra `schema.layoutMode`:
    - **`STACK` (Mặc định):** Giữ nguyên logic xếp chồng dọc bằng Flexbox/CSS Grid hiện tại (đảm bảo an toàn tuyệt đối cho toàn bộ thiệp cũ).
    - **`FREE_CANVAS`:** Khung bao ngoài nhận `position: relative; width: 375px; overflow: hidden;`. Từng Block con được bọc trong `div` có `position: absolute; left: layout.x; top: layout.y; width: layout.width; height: layout.height; z-index: layout.zIndex; transform: rotate(${layout.rotation ?? 0}deg);`.

### 5.3. Nâng Cấp Trình Biên Tập Studio (`/editor/studio`)
- [ ] **Tích hợp Thư viện Tương tác Kéo - Thả:**
  - Tích hợp `react-rnd` (hoặc `react-moveable`) cho khu vực Live Canvas Preview.
  - Khi người dùng click chọn một khối:
    - Bật khung bao tương tác 8 điểm co giãn (Resize handles).
    - Sự kiện `onDragStop`: Cập nhật tọa độ `x`, `y` mới vào Zustand Store.
    - Sự kiện `onResizeStop`: Cập nhật kích thước `width`, `height` mới vào Zustand Store.
- [ ] **Thước Căn Dóng Thông Minh (Snap Alignment):**
  - Bổ sung lưới gióng hàng (Snap Grid mỗi 5px) hoặc đường dóng tâm dọc/ngang giúp người dùng căn giữa chữ và ảnh dễ dàng.

### 5.4. Kiểm Định Độc Lập (QA Gate 5)
- [ ] **Test Tương Thích Ngược (Backwards Compatibility):**
  - Mở lại thiệp mẫu `hb04-basic` (sử dụng chế độ `STACK`) $\rightarrow$ Toàn bộ giao diện hiển thị và chỉnh sửa bình thường, không xảy ra bất kỳ lỗi vỡ layout nào.
- [ ] **Test Đa Thiết Bị (Cross-Device Pixel Precision):**
  - Tạo thiệp ở chế độ `FREE_CANVAS`, kéo ảnh chú rể đè lên một góc ảnh cô dâu và đặt chữ thư pháp nằm nghiêng góc $15^\circ$.
  - Mở liên kết `/t/{slug}` trên điện thoại iPhone thật và trên màn hình máy tính desktop $\rightarrow$ Vị trí tương đối và kích thước giữa chữ và ảnh khớp chính xác từng pixel, không bị tràn hay xô lệch giao diện.

---

## 🛡️ NGUYÊN TẮC VÀNG THỰC THI (GOLDEN RULES)

1. **Mỗi thời điểm chỉ mở 1 Giai đoạn duy nhất:** Khi đang ở Giai đoạn 1, coi như các Giai đoạn 2, 3, 4, 5 thuộc về tương lai xa. Tập trung giải quyết dứt điểm mục tiêu cô lập.
2. **Backend Trước $\rightarrow$ Test Postman $\rightarrow$ Frontend Sau:** Tuyệt đối không viết song song khi API chưa chạy. Khi API đã được chứng minh chạy đúng trên Postman, mọi lỗi hiển thị trên giao diện chắc chắn 100% nằm ở code Frontend.
3. **Không phá vỡ Schema cũ:** Mọi tính năng bổ sung phải có giá trị mặc định (`default value`) hoặc tương thích ngược để không làm gián đoạn các thiệp đã tạo trước đó.
4. **Không "Hack" để qua bài test:** Xử lý triệt để nguyên nhân gốc rễ (Root Cause), tuân thủ giới hạn dòng mã (Backend $\le 300$ dòng, Frontend $\le 500$ dòng) và luôn bọc phản hồi API trong `ApiResponse<T>`.