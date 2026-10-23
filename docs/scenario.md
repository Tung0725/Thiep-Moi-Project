# 📋 System Context & Architectural Manifest (Mode B: Bridged from Existing Specs)

> **Dự án:** Nền tảng Tạo và Chia sẻ Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)  
> **Mục đích:** Đóng vai trò là bản đồ căn chỉnh kiến trúc (Bridge & Architectural Index) kết nối tài liệu đặc tả gốc (`raw_requirement.md`), dữ kiện chuẩn hóa (`docs/source_facts.md`), và các giải pháp đã được người dùng phê duyệt (`docs/audit_report.md`) sẵn sàng chuyển tiếp sang skill `document-generator`.

---

## 1. Specification Baseline & Provenance

- **Primary Source File:** [raw_requirement.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/search/raw_requirement.md) (kết hợp đối chiếu cùng [Architecture.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/search/Architecture.md) và [Json_driven_UI.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/search/Json_driven_UI.md))
- **Audit & Adversarial Report Reference:** [docs/audit_report.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/audit_report.md) (Tất cả xung đột `CFL-01`, câu hỏi hạ tầng `OQ-01` -> `OQ-03`, và rủi ro gian lận/biên `RISK-01`, `EDGE-01` đã được giải quyết và chốt bằng `PROP-01` -> `PROP-06` qua phỏng vấn tương tác)
- **Fact Register Reference:** [docs/source_facts.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/source_facts.md) (Kho dữ kiện nguyên bản bảo toàn 100% dữ liệu gốc)

---

## 2. High-Level Problem & Architectural Vision

- **Bối cảnh & Điểm đau (Problem Statement):** Người chuẩn bị tổ chức sự kiện (cưới, sinh nhật, khai trương) gặp khó khăn khi tạo thiệp mời điện tử: thiệp ảnh tĩnh khó tương tác, không đếm ngược thời gian, khó đính kèm bản đồ dẫn đường và không nắm bắt được phản hồi RSVP từ khách mời.
- **Đối tượng phục vụ (Target Audience):**
  - 👤 **Người tạo thiệp (Host/Author):** Cần một công cụ trực quan, thao tác nhanh để tạo thiệp đẹp, xem trước thời gian thực (Live Preview) trên điện thoại và nhận link chia sẻ duy nhất.
  - 👥 **Khách mời (Guest):** Cần mở link trên điện thoại mượt mà, xem rõ thời gian, định vị Google Maps, gửi lời chúc mừng và xác nhận có tham dự hay không.
- **Giá trị cốt lõi & Tầm nhìn Kiến trúc (Core Value Proposition):**
  - **Mô hình JSON-Driven UI (Server-Driven UI):** Cho phép Backend lưu trữ toàn bộ cấu trúc giao diện dưới dạng `JSONB` trong PostgreSQL, Frontend Next.js render động qua `ComponentRegistry`. Thay đổi giao diện hay thêm mẫu mới mà không cần sửa code hay build lại ứng dụng.

---

## 3. Global Architecture Conventions (Đã thống nhất)

- **Kiến trúc mục tiêu (Target Architecture Style):** **Modular Monolith** (Phân tách rõ ràng giữa Frontend Next.js TypeScript và Backend Java Spring Boot 3 REST API).
- **Giao thức liên lạc:** RESTful HTTP APIs qua chuẩn đóng gói dữ liệu duy nhất:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": { ... }
  }
  ```
- **Xác thực & Bảo mật (Auth Convention):** Spring Security + Stateless JWT Token (Header: `Authorization: Bearer <token>`).
- **Tiền tệ & Đơn vị (Primary Currency):** VND (Dự phòng cho Phase 2, kiểu dữ liệu `BigInt` đơn vị đồng).
- **Múi giờ (Default Timezone):** UTC lưu trữ trong Database; hiển thị theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` - GMT+7).
- **Ngôn ngữ hiển thị:** Tiếng Việt.

---

## 4. Scope & Strategic Risk Mitigations (Quyết định Phạm vi & Phòng chống Rủi ro)

### 4.1. Phase 1: Core MVP (In-Scope)

1. **Quản lý Tài khoản (User Auth - `PROP-02`):**
   - Đăng ký (`/register`), Đăng nhập (`/login`) cấp phát JWT.
   - Quản lý danh sách thiệp đã tạo của từng người dùng (`user_id`).
2. **Kho Mẫu Thiệp (Template Catalog):**
   - Hiển thị 2–3 mẫu có sẵn trong DB (`Minimalist Wedding`, `Vintage Floral`, `Birthday Modern`) được auto-seed khi boot (`PROP-04`).
   - Chọn mẫu để nhân bản sang thiệp mới.
3. **Trình Biên Tập Thiệp (Editor - `/editor/[id]`):**
   - Cột trái: Form nhập liệu sửa Props từng khối và chỉnh Theme màu sắc / Font chữ.
   - Cột phải: Live Preview dựng hình trên màn hình điện thoại theo thời gian thực.
   - Sắp xếp thứ tự các khối theo chế độ **STACK** (cuộn dọc) với nút Lên / Xuống.
4. **4 Khối Giao Diện Cốt Lõi (Core UI Blocks):**
   - `HeroBlock`: Ảnh bìa sự kiện, tên cặp đôi/chủ sự kiện (kèm kiểm tra link ảnh an toàn và fallback placeholder `PROP-06`).
   - `CountdownBlock`: Đếm ngược thời gian thực tới ngày giờ sự kiện.
   - `LocationBlock`: Thời gian cụ thể và nhúng bản đồ chỉ đường Google Maps.
   - `WishesBlock`: Form gửi lời chúc mừng tích hợp lựa chọn **Xác nhận tham dự RSVP** (`ATTENDING` / `DECLINED` - `PROP-01`) kèm danh sách lời chúc.
5. **Lưu Trữ, Xuất Bản & Định Danh Bất Biến (Slug Lifecycle - `PROP-03`):**
   - Lưu cấu trúc cây giao diện vào cột `content_schema` (`JSONB`).
   - Cấp phát định danh duy nhất (`slug`) khi xuất bản và **giữ cố định vĩnh viễn** dù người dùng có sửa đổi nội dung sau đó.
6. **Trang Thiệp Công Khai (Public View - `/t/[slug]`):**
   - Render động toàn bộ khối thiệp từ JSON.
   - Hỗ trợ thẻ Meta OpenGraph (tên sự kiện + ảnh đại diện) khi share qua Zalo/Facebook.
   - Khách mời gửi lời chúc và xác nhận tham dự trực tiếp.
7. **Kiểm Soát Rác & Kiểm Duyệt Lời Chúc (Moderation & Anti-Spam - `PROP-05`):**
   - Rate limiting IP cơ bản (5 requests/phút/IP), giới hạn độ dài ký tự (`sender_name <= 50`, `message <= 500`).
   - Chủ sở hữu thiệp có quyền xem và **Xóa lời chúc rác** ngay trong trang Editor.

### 4.2. Critical Risk Mitigations (`PROP-xx` In-Scope)

- **`PROP-01`:** Tích hợp tùy chọn RSVP (`ATTENDING` / `DECLINED`) vào `WishesBlock`.
- **`PROP-02`:** Xác thực bảo vệ quyền sở hữu thiệp qua JWT Bearer token, loại bỏ nguy cơ sửa trộm thiệp.
- **`PROP-03`:** Bất biến hóa URL Slug sau khi xuất bản lần đầu để bảo vệ đường link in ấn / chia sẻ.
- **`PROP-04`:** Tự động seed 3 mẫu JSON vào Database khi khởi động Spring Boot.
- **`PROP-05`:** Kiểm soát spam lời chúc bằng Rate Limiting và cấp tính năng xóa lời chúc cho chủ thiệp.
- **`PROP-06`:** Chặn chuỗi Base64 trong input ảnh (chống phình to JSONB) và fallback ảnh placeholder khi link lỗi.

### 4.3. Strict Out-of-Scope (Tuyệt đối không làm ở MVP)

- ❌ **Chưa làm cổng thanh toán:** Không tích hợp VietQR, Momo, VNPay; không phân quyền gói cước VIP/Free.
- ❌ **Chưa làm kéo thả tọa độ tự do ($x, y$):** Không làm tính năng kéo thả Free Canvas; chỉ làm dạng xếp chồng STACK với nút Lên/Xuống.
- ❌ **Chưa làm upload ảnh lên Object Storage:** Không tích hợp upload S3 / Cloudflare R2; người dùng dán link ảnh trực tiếp (`http://` / `https://`).

---

## 5. Architectural Index & Downstream Traceability Pointers

*Bảng chỉ mục liên kết toàn bộ tài liệu từ bước thẩm định sang bộ tài liệu kiến trúc của skill `document-generator`:*

| Downstream Target | Yêu cầu Kỹ thuật & Nghiệp vụ | Nguồn Gốc (`raw_requirement.md`) | Pointers trong `source_facts.md` & `audit_report.md` |
|:---|:---|:---|:---|
| **Phase 1: BRD** | Business Rules, Scope MVP & Out-of-Scope | Mục 1, Mục 2 | `FACT-SCOPE-01` -> `05`, `PROP-01`, `PROP-03` |
| **Phase 2: PRD** | User Stories, Actor Mapping, Form & Blocks Specs | Mục 1.2, 1.3, 2.3 | `FACT-ACT-01` -> `02`, `FACT-BLK-01` -> `04`, `PROP-02`, `PROP-05` |
| **Phase 3: DDD** | Aggregate Roots, State Lifecycles, Events | Mục 1.4, 1.5 | `FACT-PUB-01` -> `05`, `PROP-02`, `PROP-03` |
| **Phase 4: ADD** | Next.js Engine, Spring Boot 3 JSONB, Caching & Anti-Spam | Mục 1 (Tech Stack), Mục 2 | `FACT-TECH-01` -> `04`, `PROP-04`, `PROP-05`, `PROP-06` |
| **Phase 5: Backlog** | Task Breakdown (User Auth, Catalog, Editor, Renderer, Public Card) | Checklist Mục 2 | Toàn bộ Facts và Proposals đã được duyệt `[Confirmed]` |

---

## 6. ✅ Architectural Readiness Certification (DoD)

- [x] Đã đọc 100% tài liệu gốc (`raw_requirement.md`, `Architecture.md`, `Json_driven_UI.md`).
- [x] Toàn bộ Fact Register được trích xuất nguyên vẹn tại [docs/source_facts.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/source_facts.md).
- [x] 100% mâu thuẫn `CFL-01`, câu hỏi kỹ thuật `OQ-01` -> `03`, và rủi ro gian lận/biên `RISK-01`, `EDGE-01` đã được người dùng chốt phương án trong [docs/audit_report.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/audit_report.md).
- [x] Bản đồ kiến trúc [docs/scenario.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/scenario.md) đã hoàn tất và sẵn sàng 100% để bàn giao sang skill `document-generator`.
