# 🚀 Agile Backlog & Traceability Matrix

> **Dự án:** Nền tảng Tạo và Chia sẻ Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)  
> **Tài liệu tham chiếu thượng nguồn (Upstream):** [docs/ADD.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/ADD.md) | [docs/Event_Storming.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/Event_Storming.md) | [docs/PRD.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/PRD.md) | [docs/BRD.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/BRD.md)  
> **Người thực hiện:** Technical Project Manager & Scrum Master  
> **Trạng thái:** Hoàn tất (DoD Certified)

---

## 1. Phase 0: Foundation Setup Tasks (Nền Tảng Hạ Tầng)

### `[TASK-00]` Khởi Tạo Cấu Trúc Dự Án Skeleton (Spring Boot 4 + Next.js + PostgreSQL)
- **Type:** Infrastructure | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `NFR-PERF-01`, `NFR-COMP-01` | **Depends on:** Không
- **User Story:** Là một Lập trình viên, tôi muốn khởi tạo khung dự án Spring Boot 4 và Next.js 14+ kèm Docker Compose chạy PostgreSQL để sẵn sàng cho việc phát triển các lát cắt nghiệp vụ.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Khởi chạy thành công ứng dụng Spring Boot 4 kết nối cơ sở dữ liệu PostgreSQL 16 qua Docker Compose; port `8080` phản hồi healthcheck `UP`.
  - [ ] **AC 2:** Khởi chạy thành công ứng dụng Next.js với Tailwind CSS và TypeScript; port `3000` hiển thị trang chủ không có lỗi console.

---

### `[TASK-01]` Xây Dựng Security Baseline, Exception Handler & API Wrapper
- **Type:** Infrastructure | **Priority:** High (Must) | **Estimate:** 3 SP | **Status:** [ ] Todo
- **Traces to:** `NFR-SEC-01`, `NFR-SEC-02` | **Depends on:** `TASK-00`
- **User Story:** Là một Lập trình viên, tôi muốn thiết lập bộ lọc Spring Security, chuẩn hóa lớp `ApiResponse<T>` và `GlobalExceptionHandler` để đảm bảo mọi response đều thống nhất và an toàn.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Mọi response API trả về client đều được bao bọc trong định dạng `ApiResponse<T>` (`code`, `message`, `data`).
  - [ ] **AC 2:** Khi phát sinh ngoại lệ validation (`@Valid`), `GlobalExceptionHandler` bắt và trả về mã HTTP `400 Bad Request` kèm chi tiết trường dữ liệu vi phạm, không để lộ stack trace.

---

## 2. Phase 1: Core MVP (Vertical Slices - Phát Triển Theo Lát Cắt Dọc)

### `[TASK-02]` [Auth Module] Đăng Ký, Đăng Nhập & Cấp Phát JWT Token
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [x] Done
- **Traces to:** `FR-01`, `FR-02`, `API-01`, `API-02`, `SCR-01`, `AGG-01`, `CMD-01`, `CMD-02`, `EVT-01`, `EVT-02` | **Depends on:** `TASK-01`
- **User Story:** Là một `ROLE-GUEST`, tôi muốn đăng ký và đăng nhập tài khoản bằng email/mật khẩu để nhận JWT token quản lý các thiệp của riêng tôi.
- **Acceptance Criteria (AC):**
  - [x] **AC 1:** Given thông tin email và mật khẩu hợp lệ, When gửi request `POST /api/v1/auth/register`, Then tài khoản được tạo với mật khẩu băm BCrypt (cost 12) và trả về mã `201 Created`.
  - [x] **AC 2 (Edge Case):** Given email đã tồn tại trong DB, When gửi đăng ký, Then hệ thống trả về mã `409 Conflict` kèm thông báo *"Email này đã được sử dụng"*.
  - [x] **AC 3:** Given đăng nhập thành công qua `POST /api/v1/auth/login`, Then hệ thống trả về `200 OK` kèm chuỗi JWT token có hiệu lực 24 giờ.

---

### `[TASK-03]` [Template Module] Kho Mẫu Thiệp Mặc Định & Cơ Chế Auto-Seeding
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 3 SP | **Status:** [ ] Todo
- **Traces to:** `FR-03`, `API-03`, `SCR-02`, `AGG-02`, `POL-03` | **Depends on:** `TASK-01`
- **User Story:** Là một `ROLE-HOST`, tôi muốn xem danh sách các mẫu thiệp có sẵn trong kho mẫu để lựa chọn phong cách thiệp ưng ý.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Given khi ứng dụng Spring Boot khởi động và bảng `templates` rỗng, When `CommandLineRunner` thực thi, Then tự động nạp sẵn 3 mẫu thiệp JSON chuẩn (`Minimalist Wedding`, `Vintage Floral`, `Birthday Modern`).
  - [ ] **AC 2:** Given người dùng gọi API `GET /api/v1/templates`, When response thành công, Then trả về mảng danh sách tối thiểu 3 mẫu thiệp kèm link ảnh thumbnail và danh mục.

---

### `[TASK-04]` [Invitation Module] Khởi Tạo Thiệp Mới Từ Mẫu Đã Chọn
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 3 SP | **Status:** [ ] Todo
- **Traces to:** `FR-04`, `API-04`, `SCR-02`, `AGG-03`, `CMD-03`, `EVT-03` | **Depends on:** `TASK-02`, `TASK-03`
- **User Story:** Là một `ROLE-HOST`, tôi muốn bấm "Sử dụng mẫu này" để nhân bản cấu trúc JSON của mẫu sang bản ghi thiệp riêng của tôi.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Given người dùng đã đăng nhập, When gửi request `POST /api/v1/invitations` với `templateId`, Then hệ thống sao chép `default_schema` sang bảng `invitations` gán với `userId` hiện tại và trả về `invitationId`.
  - [ ] **AC 2 (Edge Case):** Given người dùng chưa có Bearer JWT, When gọi API, Then trả về mã `401 Unauthorized` và chuyển hướng tới màn hình đăng nhập.

---

### `[TASK-05]` [Frontend Renderer] Xây Dựng ComponentRegistry & Bộ Máy Dựng Hình Động 4 Khối
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `FR-07`, `SCR-04`, `SCR-05`, `AGG-03`, `BR-06`, `NFR-USAB-01` | **Depends on:** `TASK-00`
- **User Story:** Là một Khách mời hoặc Chủ thiệp, tôi muốn 4 khối (`Hero`, `Countdown`, `Location`, `Wishes`) được render tự động từ JSON mượt mà trên khung điện thoại.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** `ComponentRegistry` sử dụng `next/dynamic` kết hợp `<Suspense>` và `<ErrorBoundary>` để tải lười từng block.
  - [ ] **AC 2:** Khối `CountdownBlock` đếm ngược chính xác theo giây đến mốc `targetDate`.
  - [ ] **AC 3 (Edge Case):** Given link ảnh bìa trong `HeroBlock` bị chết link (404), When render, Then sự kiện `onError` tự động kích hoạt hiển thị ảnh placeholder trang nhã, không vỡ layout.

---

### `[TASK-06]` [Frontend Editor] Xây Dựng Màn Hình Biên Tập Hai Cột (Live Preview & Zustand Store)
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 8 SP | **Status:** [ ] Todo
- **Traces to:** `FR-05`, `FR-06`, `SCR-04`, `API-05`, `API-06`, `AGG-03`, `CMD-04`, `EVT-04`, `BR-03` | **Depends on:** `TASK-04`, `TASK-05`
- **User Story:** Là một `ROLE-HOST`, tôi muốn sửa chữ, đổi màu sắc và nhấn nút Lên/Xuống để sắp xếp lại các khối và thấy khung điện thoại bên phải đổi ngay lập tức.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Cột trái hiển thị các form controls cho từng block; cột phải là Phone Canvas dựng hình tức thì dựa trên Zustand state với độ trễ $< 50$ms.
  - [ ] **AC 2:** Khi bấm nút Lên/Xuống ở một block, thứ tự trong mảng `blocks` hoán đổi và giao diện điện thoại phản hồi ngay lập tức.
  - [ ] **AC 3 (Edge Case):** Khi người dùng dán chuỗi Base64 (`data:image/...`), ô input báo lỗi đỏ và chặn không cho ghi vào State JSON.

---

### `[TASK-07]` [Invitation Module] Lưu Trữ Bản Nháp & Xuất Bản Thiệp (Immutable Slug)
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `FR-08`, `API-06`, `API-07`, `SCR-04`, `AGG-03`, `CMD-05`, `EVT-05`, `BR-01`, `BR-02` | **Depends on:** `TASK-06`
- **User Story:** Là một `ROLE-HOST`, tôi muốn bấm "Xuất bản thiệp" để nhận đường link `/t/{slug}` vĩnh viễn, và dù có sửa đổi sau đó thì link này vẫn không bị đổi.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Khi bấm "Xuất bản", API `POST /api/v1/invitations/{id}/publish` sinh slug duy nhất, cập nhật `status = PUBLISHED` và lưu JSON vào cột `content_schema` (`JSONB`).
  - [ ] **AC 2 (Edge Case):** Given thiệp đã có slug, When chủ thiệp sửa nội dung và bấm "Lưu cập nhật", Then hệ thống chỉ cập nhật `content_schema`, giữ nguyên giá trị `slug` cũ 100%.

---

### `[TASK-08]` [Public View] Trang Thiệp Công Khai `/t/[slug]` & Tối Ưu Thẻ Meta OpenGraph
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `FR-09`, `FR-12`, `API-08`, `SCR-05`, `AGG-03`, `NFR-PERF-01`, `NFR-PERF-02` | **Depends on:** `TASK-05`, `TASK-07`
- **User Story:** Là một `ROLE-GUEST`, tôi muốn mở đường dẫn `/t/{slug}` trên Zalo/điện thoại để thấy thiệp mời hiển thị sắc nét kèm ảnh bìa preview.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** API `GET /api/v1/public/cards/{slug}` trả về JSON Schema thiệp cho khách vãng lai dưới $150$ms.
  - [ ] **AC 2:** Hàm `generateMetadata` của Next.js SSR trích xuất đúng tên sự kiện và ảnh bìa trả về thẻ `<meta property="og:title">`, `<meta property="og:image">` để khi dán vào Zalo hiển thị card preview đẹp.

---

### `[TASK-09]` [Wishes Module] Khách Gửi Lời Chúc, Xác Nhận RSVP & Chống Spam Rate Limit
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `FR-10`, `API-09`, `SCR-05`, `AGG-04`, `CMD-06`, `EVT-06`, `BR-04`, `BR-05`, `NFR-SEC-04` | **Depends on:** `TASK-08`
- **User Story:** Là một `ROLE-GUEST`, tôi muốn gửi lời chúc mừng và tích chọn "Sẽ tham dự" hoặc "Không thể đến" để chủ tiệc biết trước số lượng mâm cỗ.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Gửi request `POST /api/v1/public/cards/{slug}/wishes` với `senderName`, `attendance`, `message`; bản ghi được lưu vào bảng `wishes` và hiển thị ngay trên đầu danh sách lời chúc.
  - [ ] **AC 2 (Edge Case - Rate Limit):** Khi một IP gửi vượt quá 5 lời chúc trong 60 giây, hệ thống trả về mã `429 Too Many Requests` và từ chối lưu.

---

### `[TASK-10]` [Wishes & Dashboard] Chủ Thiệp Quản Lý, Xóa Lời Chúc Rác & Xuất Báo Cáo CSV
- **Type:** Feature | **Priority:** High (Must) | **Estimate:** 5 SP | **Status:** [ ] Todo
- **Traces to:** `FR-11`, `API-10`, `API-11`, `SCR-03`, `SCR-04`, `AGG-04`, `CMD-07`, `CMD-08`, `EVT-07`, `EVT-08` | **Depends on:** `TASK-09`
- **User Story:** Là một `ROLE-HOST`, tôi muốn xem thống kê sĩ số khách tham dự, xóa lời chúc rác và tải file CSV danh sách khách để nộp cho bên nhà hàng.
- **Acceptance Criteria (AC):**
  - [ ] **AC 1:** Chủ thiệp bấm nút "Xóa" tại lời chúc không mong muốn, API `DELETE /api/v1/invitations/{id}/wishes/{wishId}` xóa bản ghi và cập nhật lại sĩ số.
  - [ ] **AC 2:** Bấm nút "Xuất CSV" kích hoạt tải file `danh-sach-khach-[slug].csv` định dạng UTF-8 có dấu với đầy đủ cột Thời gian, Họ tên, Tham dự, Lời chúc.
  - [ ] **AC 3 (Edge Case):** Người dùng không phải chủ sở hữu thiệp cố tình gọi API xóa thì nhận về mã `403 Forbidden`.

---

## 3. Phase 2: Usable Product Enhancements (Lộ Trình Nâng Cấp Tuần 2 – 3)

| Mã Task | Tên Công Việc | Loại | Độ Ưu Tiên | Ước Lượng | Trọng Tâm Nghiệp Vụ |
|:---|:---|:---:|:---:|:---:|:---|
| `[TASK-11]` | **Tích hợp Google OAuth2** | Feature | Medium | 5 SP | Cho phép đăng nhập 1-chạm bằng tài khoản Google, tự động liên kết với User. |
| `[TASK-12]` | **Upload ảnh lên Cloudflare R2 / S3** | Feature | Medium | 5 SP | Tích hợp API sinh Presigned URL, upload trực tiếp ảnh cưới và hiển thị `GalleryBlock`. |
| `[TASK-13]` | **Hộp mừng cưới `GiftQrBlock`** | Feature | Medium | 3 SP | Cho phép chọn ngân hàng, nhập số tài khoản $\rightarrow$ tự động render ảnh mã VietQR nhận tiền mừng. |

---

## 4. Phase 3: Production & Monetization (Lộ Trình Thương Mại Hóa Tuần 4 – 5)

| Mã Task | Tên Công Việc | Loại | Độ Ưu Tiên | Ước Lượng | Trọng Tâm Nghiệp Vụ |
|:---|:---|:---:|:---:|:---:|:---|
| `[TASK-14]` | **Paywall & Watermark Bản Nháp** | Feature | Low | 5 SP | Link thiệp DRAFT có dải watermark mờ; kích hoạt thanh toán PayOS/SePay tự động gỡ nhãn. |
| `[TASK-15]` | **Lớp Hiệu Ứng Nhạc Nền & Hoa Rơi** | Feature | Low | 3 SP | Nút đĩa nhạc xoay tự động phát âm thanh và hiệu ứng cánh hoa hồng rơi phủ màn hình. |

---

## 5. Bảng Ma Trận Truy Vết Toàn Diện (End-to-End Traceability Matrix)

Bảng đối chiếu bảo đảm không có bất kỳ yêu cầu nào bị bỏ sót qua các tầng tài liệu:

| Mục Tiêu / Quy Tắc (OBJ / BR) | Năng Lực (CAP) | Yêu Cầu Chức Năng (FR) | Màn Hình (SCR) | Miền DDD (CMD $\rightarrow$ EVT) | Hợp Đồng API | Backlog Task |
|:---|:---|:---|:---|:---|:---|:---|
| `OBJ-01`, `BR-01` | `CAP-01` | `FR-01`: Đăng ký tài khoản | `SCR-01` | `CMD-01` $\rightarrow$ `EVT-01` | `API-01` | `TASK-02` |
| `OBJ-01`, `BR-01` | `CAP-01` | `FR-02`: Đăng nhập & JWT | `SCR-01` | `CMD-02` $\rightarrow$ `EVT-02` | `API-02` | `TASK-02` |
| `OBJ-01` | `CAP-02` | `FR-03`: Kho mẫu thiệp | `SCR-02` | `POL-03` $\rightarrow$ `AutoSeed` | `API-03` | `TASK-03` |
| `OBJ-01` | `CAP-02` | `FR-04`: Khởi tạo từ mẫu | `SCR-02` | `CMD-03` $\rightarrow$ `EVT-03` | `API-04` | `TASK-04` |
| `OBJ-01`, `BR-03`, `BR-06`| `CAP-03` | `FR-05`: Sửa nội dung/Theme | `SCR-04` | `CMD-04` $\rightarrow$ `EVT-04` | `API-05`, `API-06`| `TASK-06` |
| `OBJ-01` | `CAP-03` | `FR-06`: Đổi thứ tự khối | `SCR-04` | `CMD-04` $\rightarrow$ `EVT-04` | `API-06` | `TASK-06` |
| `OBJ-01`, `OBJ-04`, `BR-06`| `CAP-04` | `FR-07`: Render 4 Blocks | `SCR-04`, `SCR-05`| Nội bộ Renderer | Không (Client) | `TASK-05` |
| `OBJ-01`, `BR-01`, `BR-02`| `CAP-06` | `FR-08`: Xuất bản & Slug | `SCR-04` | `CMD-05` $\rightarrow$ `EVT-05` | `API-07` | `TASK-07` |
| `OBJ-01`, `OBJ-03`, `BR-06`| `CAP-06` | `FR-09`: Xem thiệp `/t/slug`| `SCR-05` | Truy vấn Read-Model | `API-08` | `TASK-08` |
| `OBJ-02`, `BR-04`, `BR-05`| `CAP-05` | `FR-10`: Khách gửi lời chúc | `SCR-05` | `CMD-06` $\rightarrow$ `EVT-06` | `API-09` | `TASK-09` |
| `OBJ-02`, `BR-01`, `BR-04`| `CAP-05` | `FR-11`: Xóa chúc & Xuất CSV| `SCR-03`, `SCR-04`| `CMD-07`, `08` $\rightarrow$ `EVT-07`, `08`| `API-10`, `API-11`| `TASK-10` |
| `OBJ-01`, `OBJ-03` | `CAP-06` | `FR-12`: Thẻ OpenGraph Zalo | `SCR-05` | SSR Metadata Generator | Nội bộ Next.js | `TASK-08` |

---

## ✅ Definition of Done (DoD) - Backlog

- [x] **100% Tasks (`TASK-00` đến `TASK-10`)** tuân thủ chính xác template chuẩn: Type, Priority, Estimate (Story Points), Traces to, Depends on, User Story và Acceptance Criteria chi tiết (gồm cả Happy Path và Edge Case). *(Bằng chứng: 11 Tasks tại Mục 1 và Mục 2)*
- [x] **Phân chia các Task theo lát cắt dọc rõ ràng:** Foundation (`TASK-00`, `TASK-01`) $\rightarrow$ Core MVP (`TASK-02` đến `TASK-10`) $\rightarrow$ Enhancements Phase 2 & 3.
- [x] **100% `FR-01` đến `FR-12`** đều được ánh xạ sang ít nhất một Task; mọi `SCR-xx`, `API-xx` đều có Task chịu trách nhiệm thực thi.
- [x] **Bảng Traceability Matrix** phủ kín toàn diện từ `OBJ/BR` $\rightarrow$ `CAP` $\rightarrow$ `FR` $\rightarrow$ `SCR` $\rightarrow$ `CMD/EVT` $\rightarrow$ `API` $\rightarrow$ `TASK`, không có ô trống mồ côi. *(Bằng chứng: Bảng ma trận tại Mục 5)*
