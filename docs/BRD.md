# 📑 Business Requirements Document (BRD)

> **Dự án:** Nền tảng Tạo và Chia sẻ Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)  
> **Tài liệu tham chiếu thượng nguồn (Upstream):** [docs/scenario.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/scenario.md) | [docs/source_facts.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/source_facts.md) | [docs/audit_report.md](file:///d:/Programing_Language/InteliJ_IDEA/Thiep-Moi-Project/docs/audit_report.md)  
> **Người thực hiện:** Lead Software Architect & Business Analyst  
> **Trạng thái:** Bản Thảo Hoàn Thiện (Ready for Review)

---

## 1. Global Conventions

- **Kiến trúc mục tiêu (Architecture Style):** **Modular Monolith** (Phân tách rõ ràng giữa Frontend Next.js và Backend Java Spring Boot 4, dùng chung cơ sở dữ liệu PostgreSQL).
- **Hạ tầng Công nghệ (Tech Stack):**
  - **Frontend:** Next.js (TypeScript, Tailwind CSS, Zustand State Management).
  - **Backend:** Java Spring Boot 4 (Spring Security, Hibernate 6, `@JdbcTypeCode(SqlTypes.JSON)`).
  - **Database:** PostgreSQL 15+ (Lưu trữ cây giao diện bằng cột `JSONB`).
- **Đơn vị tiền tệ (Target Currency):** VND (Dự phòng cho Phase 3, kiểu số nguyên `BigInt` đơn vị đồng).
- **Múi giờ chuẩn (Default Timezone):** `UTC` lưu trữ trong cơ sở dữ liệu; hiển thị theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` - GMT+7).
- **Ngôn ngữ tài liệu & Giao diện:** Tiếng Việt.
- **Hệ thống định danh chuẩn hóa (ID Scheme):** `OBJ-xx` (Mục tiêu), `CAP-xx` (Năng lực), `BR-xx` (Quy tắc), `RSK-xx` (Rủi ro), `Q-xx` (Câu hỏi mở).

---

## 2. Problem Statement (Phát Biểu Vấn Đề & Phân Tích Gốc Rễ)

### 2.1. Đối tượng bị ảnh hưởng (Target Audience)
- **Cặp đôi cưới & Cá nhân tổ chức sự kiện (Host):** Những người chuẩn bị tổ chức lễ cưới, tiệc sinh nhật, thôi nôi hoặc sự kiện khai trương cần mời hàng trăm khách.
- **Khách mời sự kiện (Guests):** Người nhận lời mời qua mạng xã hội (Zalo, Facebook, Messenger) hoặc điện thoại thông minh.

### 2.2. Rào cản & Nỗi đau cốt lõi (Core Obstacle)
- **Chi phí & Thời gian in thiệp giấy truyền thống:** Tốn từ 3–8 triệu đồng và 2–3 tuần chuẩn bị in ấn; khi phát sinh thay đổi địa điểm hoặc giờ giấc thì không thể chỉnh sửa, buộc phải in lại hoặc đính chính thủ công.
- **Thiệp ảnh tĩnh thiếu sức sống:** Thiệp ảnh thông thường gửi qua Zalo hay bị nén mờ, không có chức năng dẫn đường (Google Maps), không có đếm ngược ngày cưới và không thu thập được phản hồi.
- **Khó khăn dự trù cỗ tiệc (Pain point lớn nhất):** Chủ tiệc không thể nắm bắt chính xác bao nhiêu khách sẽ đến, dẫn đến tình trạng thừa cỗ (lãng phí tiền triệu) hoặc thiếu cỗ (gây thất lễ với khách).

### 2.3. Phân tích nguyên nhân gốc rễ (Root Cause Analysis - 5 Whys)
1. *Tại sao khách mời thường đến muộn hoặc lạc đường?* $\rightarrow$ Vì thiệp ảnh hoặc tin nhắn chữ không có tính năng định vị bản đồ và đếm ngược thời gian thực.
2. *Tại sao chủ tiệc luôn bị động về số lượng mâm cỗ?* $\rightarrow$ Vì không có cơ chế thu thập phản hồi xác nhận tham dự (RSVP) tự động và tập trung từ khách mời.
3. *Tại sao người dùng không dùng các website thiệp mời hiện có?* $\rightarrow$ Vì hầu hết các website hiện nay đều đóng cứng giao diện (*hardcoded*), bắt trả phí ngay lập tức với chi phí cao, hoặc giao diện quá phức tạp để chỉnh sửa trên điện thoại.
4. *Tại sao các website hiện có lại khó tùy biến?* $\rightarrow$ Vì thiết kế theo kiến trúc Web tĩnh truyền thống, muốn đổi vị trí khối hay màu sắc phải can thiệp mã nguồn Frontend, thiếu mô hình **JSON-Driven UI**.
5. **Nguyên nhân gốc rễ (Root Cause):** Thị trường thiếu một giải pháp thiệp điện tử tinh gọn tại Việt Nam xây dựng trên kiến trúc **JSON-Driven UI** kết hợp **Live Preview thời gian thực**, cho phép tùy biến khối linh hoạt, thu thập RSVP tự động và chia sẻ mượt mà trên di động.

### 2.4. Định lượng tổn thất kinh doanh (Business Impact)
- Tổn thất trung bình **3.000.000 – 10.000.000 VND** mỗi đám cưới do đặt dư thừa cỗ tiệc không chính xác.
- Lãng phí **20 – 30 giờ làm việc** cho việc đi phát thiệp giấy tận tay hoặc gọi điện thoại hỏi từng khách xem có tham dự được không.

---

## 3. Vision & Business Objectives (Tầm Nhìn & Mục Tiêu SMART)

### 3.1. Tầm nhìn sản phẩm (Product Vision)
Trở thành nền tảng tạo và chia sẻ thiệp mời sự kiện trực tuyến hàng đầu Việt Nam dựa trên kiến trúc **JSON-Driven UI**, mang đến trải nghiệm cá nhân hóa tức thì, tương tác thẩm mỹ cao và tự động hóa toàn bộ quy trình thu thập phản hồi khách mời.

### 3.2. Danh sách Mục tiêu Kinh doanh (SMART Objectives)

| ID | Tên Mục Tiêu | Chỉ Số Đo Lường (Metric) | Điểm Xuất Phát (Baseline) | Mục Tiêu Đạt Được (Target) | Thời Hạn (Timeframe) |
|:---|:---|:---|:---|:---|:---|
| `OBJ-01` | **Rút ngắn thời gian tạo thiệp** | Thời gian từ lúc chọn mẫu đến khi nhận link xuất bản | 48 giờ (in thiệp giấy/thiết kế ảnh) | $\le 5$ phút | Phase 1 (Tuần 1) |
| `OBJ-02` | **Tối ưu tỷ lệ phản hồi tham dự (RSVP)** | Tỷ lệ khách mở thiệp bấm xác nhận tham dự | $15\%$ (hỏi miệng/tin nhắn rời) | $\ge 60\%$ tổng lượt mở thiệp | Phase 1 (Tuần 1) |
| `OBJ-03` | **Hiệu năng tải trang di động đỉnh cao** | First Contentful Paint (FCP) & P95 Server Response Time | FCP: 3.5s; Latency: 800ms | FCP $< 1.2$s; P95 Latency $< 200$ms trên 4G | Phase 1 (Tuần 1) |
| `OBJ-04` | **Độ tin cậy giao diện JSON-Driven UI** | Tỷ lệ lỗi vỡ khung hình (White Screen of Death) khi render | N/A | **0% sự cố sập trang** (nhờ cơ chế Fallback Props & ErrorBoundary) | Phase 1 (Tuần 1) |
| `OBJ-05` | **Tỷ lệ chuyển đổi thương mại (Phase 3)** | Tỷ lệ người tạo thiệp nháp sẵn sàng trả phí mở khóa chính thức | 0% | $\ge 15\%$ tổng số thiệp khởi tạo | Phase 3 (Tuần 5) |

---

## 4. Stakeholder Register (Danh Sách Các Bên Liên Quan)

| Role | Nhóm / Vai trò | Trách Nhiệm Chính | Mối Quan Tâm Cốt Lõi |
|:---|:---|:---|:---|
| **Host / Author** | Khách hàng tạo thiệp (Cặp đôi cưới, chủ tiệc) | Chọn mẫu, tùy biến nội dung chữ/ảnh, xuất bản link, quản lý danh sách lời chúc & RSVP | Giao diện sửa dễ dùng, xem trước trên điện thoại giống thật 100%, bảo mật quyền sửa thiệp |
| **Guest** | Khách mời sự kiện | Mở link trên điện thoại, xem lộ trình Google Maps, gửi lời chúc & xác nhận có đi hay không | Tải nhanh, không giật lag, giao diện trang trọng, thao tác gửi lời chúc đơn giản |
| **System Operator / Tech Lead** | Quản trị kỹ thuật & Vận hành | Giám sát hiệu năng Database JSONB, kiểm soát anti-spam, phát hành các block mới | Kiến trúc dễ mở rộng, code sạch không lỗi thời, chịu tải cao trong mùa cưới |
| **Product Owner / Business Sponsor** | Ban điều hành & Nhà đầu tư | Định hướng sản phẩm, kiểm soát chi phí hạ tầng (VPS, R2), tối ưu hóa doanh thu | ROI, tỷ lệ giữ chân người dùng, tự động hóa quy trình thanh toán |

---

## 5. Scope & Business Capabilities (Phạm Vi & Năng Lực Nghiệp Vụ)

### 5.1. Năng lực Nghiệp vụ trong phạm vi (In-Scope Capabilities)

| ID | Tên Năng Lực Nghiệp Vụ | Mô Tả Chi Tiết Năng Lực | Mức Độ Ưu Tiên (MoSCoW) | Truy Vết Mục Tiêu |
|:---|:---|:---|:---|:---|
| `CAP-01` | **Xác thực Tài khoản Người dùng (User Auth)** | Đăng ký, đăng nhập tài khoản bằng JWT (kèm mở rộng Google OAuth2 ở Phase 2). Quản lý danh sách các thiệp thuộc quyền sở hữu của người dùng. | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-02` | **Kho Mẫu Thiệp Động (Template Catalog)** | Cung cấp danh mục 3 mẫu JSON khởi tạo sẵn (`Wedding Romantic`, `Minimalist Luxury`, `Birthday Modern`) để người dùng xem trước và nhân bản tạo thiệp mới. | **Must** (MVP) | `OBJ-01` |
| `CAP-03` | **Trình Biên Tập Hai Cột (Visual Live Editor)** | Màn hình Editor chia 2 cột: Cột trái nhập liệu form và theme; Cột phải giả lập màn hình điện thoại render trực tiếp từ JSON State theo thời gian thực. Hỗ trợ đổi vị trí khối Lên/Xuống (chế độ `STACK`). | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-04` | **Bộ Khối Giao Diện Cốt Lõi (4 Core Blocks)** | Khả năng dựng hình động 4 khối: `HeroBlock` (ảnh bìa & tên dâu rể), `CountdownBlock` (đếm ngược), `LocationBlock` (thời gian & Google Maps), `WishesBlock` (lời chúc & RSVP). | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-05` | **Thu Thập & Quản Lý RSVP / Lời Chúc (Wishes Management)** | Khách mời gửi lời chúc và báo tham dự (`ATTENDING` / `DECLINED`). Chủ tiệc có giao diện xem danh sách phản hồi và có nút **Xóa lời chúc rác**. | **Must** (MVP) | `OBJ-02` |
| `CAP-06` | **Xuất Bản & Định Danh Bất Biến (Publishing & Slug)** | Lưu cấu trúc cây JSON vào cột `content_schema` (`JSONB`). Cấp phát đường dẫn duy nhất `/t/{slug}` cố định vĩnh viễn và hỗ trợ thẻ Meta OpenGraph khi share Zalo/Facebook. | **Must** (MVP) | `OBJ-01`, `OBJ-03` |
| `CAP-07` | **Lưu trữ Ảnh Đám Cưới & Hộp Mừng Cưới (Phase 2)** | Tích hợp upload ảnh trực tiếp lên Cloudflare R2 / S3 cho `GalleryBlock` và tự động sinh mã VietQR nhận tiền mừng cho `GiftQrBlock`. | **Should** (Phase 2) | `OBJ-01` |
| `CAP-08` | **Hiệu Ứng Cao Cấp & Thanh Toán Tự Động (Phase 3)** | Thêm nhạc nền xoay, hiệu ứng hoa rơi phủ màn hình; tích hợp cổng PayOS/SePay quét mã VietQR tự động xóa Watermark bản nháp. | **Could** (Phase 3) | `OBJ-05` |

### 5.2. Ranh giới loại trừ nghiêm ngặt (Strict Out-of-Scope cho Phase 1 MVP)
- ❌ **Không làm cổng thanh toán trực tuyến:** Chưa tích hợp VietQR tự động, chưa phân quyền gói VIP/trả phí ở MVP (mọi tính năng MVP đều được sử dụng miễn phí để thông luồng).
- ❌ **Không làm kéo thả tọa độ tự do ($x, y$):** Không làm giao diện Free-form Canvas (chỉ làm dạng xếp chồng `STACK` cuộn dọc từ trên xuống với nút Lên/Xuống).
- ❌ **Không làm hạ tầng upload ảnh lên S3/R2:** Người dùng tạm thời dán link URL ảnh trực tiếp từ internet để kiểm thử luồng dữ liệu.

---

## 6. Business Rules (`BR-xx` - Quy Tắc Nghiệp Vụ)

| ID | Tên Quy Tắc | Điều Kiện (Condition) | Kích Hoạt (Trigger) | Kết Quả Nghiệp Vụ (Outcome) | Ngoại Lệ (Exceptions) |
|:---|:---|:---|:---|:---|:---|
| `BR-01` | **Bảo vệ Quyền Sở Hữu Thiệp** | Người dùng gửi yêu cầu sửa hoặc xóa dữ liệu thiệp | API nhận request `PUT /api/v1/invitations/{id}` | Hệ thống kiểm tra `user_id` trong JWT phải trùng với chủ sở hữu thiệp trong DB; nếu sai trả mã `403 Forbidden`. | Không có ngoại lệ. |
| `BR-02` | **Tính Bất Biến của Slug Xuất Bản** | Thiệp đã được xuất bản lần đầu và đã có `slug` | Chủ thiệp tiếp tục sửa nội dung trong Editor và bấm Lưu | Hệ thống chỉ cập nhật `content_schema` và `updated_at`, tuyệt đối giữ nguyên giá trị `slug` cũ để không làm gãy liên kết đã chia sẻ. | Chỉ có Admin mới có quyền can thiệp cấp DB nếu phát hiện slug vi phạm thuần phong mỹ tục. |
| `BR-03` | **Chuẩn Hóa Đường Dẫn Ảnh & Cấm Base64** | Người dùng dán dữ liệu vào ô link ảnh của `HeroBlock` | Người dùng submit form hoặc blur khỏi ô input | Dữ liệu phải bắt đầu bằng `http://` hoặc `https://`. Nghiêm cấm chuỗi bắt đầu bằng `data:image/` (Base64). Nếu vi phạm, từ chối lưu và báo lỗi trực quan. | Không có. |
| `BR-04` | **Kiểm Soát Spam Lời Chúc (Anti-Spam)** | Khách mời gửi lời chúc qua form công khai `/api/v1/public/cards/{slug}/wishes` | Khách bấm nút "Gửi lời chúc" | Kiểm tra: Tên người gửi $\le 50$ ký tự, Lời chúc $\le 500$ ký tự. Mỗi địa chỉ IP chỉ được gửi tối đa 5 lời chúc trong 60 giây. Nếu vượt quá, trả lỗi `429 Too Many Requests`. | Không có. |
| `BR-05` | **Xác Nhận Tham Dự Nhị Phân (Binary RSVP)** | Khách mời điền form xác nhận tham dự | Khách bấm gửi phản hồi | Thuộc tính `attendance` bắt buộc phải là `ATTENDING` (Sẽ tham dự) hoặc `DECLINED` (Không thể đến). | Nếu khách không chọn, mặc định coi là `ATTENDING`. |
| `BR-06` | **Bộ Dựng Hình An Toàn (Fault-Tolerant Rendering)** | Thuộc tính trong JSON bị thiếu hoặc URL ảnh bìa bị lỗi 404/chặn hotlink | Trình duyệt thực hiện render cây JSON | Component tự động sử dụng giá trị mặc định (`Default Props`) và kích hoạt ảnh placeholder trang nhã, tuyệt đối không văng lỗi trắng trang (`White Screen of Death`). | Không có. |

---

## 7. Constraints, Assumptions & Risks

### 7.1. Ràng buộc kỹ thuật & kiến trúc (Constraints)
- **Framework & Runtime:** Java 17+ kết hợp Spring Boot 4; Node.js 18+ kết hợp Next.js 14+ (App Router).
- **Cơ sở dữ liệu:** Bắt buộc sử dụng PostgreSQL hỗ trợ kiểu dữ liệu `JSONB` và Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)`.
- **Thiết bị hiển thị:** Ưu tiên số 1 cho màn hình điện thoại di động (Mobile-First Viewport $375\text{px} - 430\text{px}$).

### 7.2. Giả định cần kiểm chứng (Assumptions)
- Hơn $90\%$ khách mời sẽ mở thiệp thông qua ứng dụng Zalo trên điện thoại di động tại Việt Nam.
- Người tạo thiệp muốn xem kết quả hiển thị thay đổi ngay lập tức sau mỗi ký tự gõ trên bàn phím (Live Preview độ trễ $< 50$ms).

### 7.3. Ma Trận Quản Trị Rủi Ro (Risk Matrix)

| Risk ID | Mô Tả Rủi Ro | Khả Năng (Likelihood) | Mức Độ Tác Động (Impact) | Kế Hoạch Giảm Thiểu (Mitigation Plan) |
|:---|:---|:---|:---|:---|
| `RSK-01` | **Bot spam lời chúc rác / phá hoại thiệp cưới công khai** | Medium | High | Áp dụng Rate Limiting theo IP (`BR-04`), kiểm tra độ dài input và cấp nút **Xóa lời chúc** tức thì cho chủ thiệp trong Editor. |
| `RSK-02` | **Phình to dung lượng cột JSONB làm chậm truy vấn** | Low | High | Cấm tuyệt đối nhét chuỗi ảnh Base64 vào JSON (`BR-03`), đánh chỉ mục GIN Index trên PostgreSQL cho các trường tìm kiếm thường xuyên. |
| `RSK-03` | **Ảnh bìa sự kiện bị chết link (404) làm xấu thiệp** | Medium | Medium | Bắt sự kiện `onError` tại component thẻ `<img>` của Next.js để tự động thay thế bằng ảnh placeholder mặc định trang nhã (`BR-06`). |
| `RSK-04` | **Sai lệch múi giờ đếm ngược giữa các thiết bị** | Medium | Medium | Mọi mốc thời gian sự kiện trong JSON bắt buộc lưu theo định dạng chuẩn ISO 8601 kèm múi giờ (`+07:00` hoặc UTC). |

---

## 8. Open Questions (Câu Hỏi Mở Chờ Xử Lý Ở Các Phase Tiếp Theo)

| Question ID | Nội Dung Câu Hỏi | Người Phụ Trách (Owner) | Cần Giải Quyết Ở | Trạng Thái |
|:---|:---|:---|:---|:---|
| `Q-01` | Cơ chế Google OAuth2 ở Phase 2 nên xử lý liên kết tài khoản như thế nào nếu email đã đăng ký bằng mật khẩu trước đó? | Lead Security Architect | Phase 2 (PRD) | Open |
| `Q-02` | Khi chuyển đổi sang Cloudflare R2 ở Phase 2, có nên áp dụng tiền xử lý nén ảnh WebP trực tiếp trên trình duyệt bằng Canvas API không? | Frontend Lead | Phase 2 (PRD) | Open |

---

## ✅ Definition of Done (DoD) - BRD

- [x] Tất cả các Objectives (`OBJ-01` đến `OBJ-05`) đều đạt chuẩn SMART với Baseline, Target định lượng và Thời hạn cụ thể. *(Bằng chứng: 5/5 OBJs đạt chuẩn)*
- [x] Đã phân tích Nguyên nhân gốc rễ (Root Cause Analysis - 5 Whys) thay vì chỉ nêu triệu chứng bên ngoài. *(Bằng chứng: Mục 2.3)*
- [x] Ranh giới ngoài phạm vi (Strict Out-of-Scope) được phân định rõ ràng 3 mục loại trừ. *(Bằng chứng: Mục 5.2)*
- [x] Mọi Business Rule (`BR-01` đến `BR-06`) đều có thể kiểm thử độc lập và 100% Capabilities (`CAP-01` đến `CAP-08`) đều truy vết về ít nhất một Objective. *(Bằng chứng: 8 CAPs $\rightarrow$ 5 OBJs tại Mục 5.1)*
