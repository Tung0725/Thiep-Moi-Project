# 📑 Business Requirements Document (BRD)

> **Dự án:** Nền tảng Tạo và Chia sẻ Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)  
> **Tài liệu tham chiếu thượng nguồn (Upstream):** [docs/scenario.md](scenario.md) | [docs/source_facts.md](source_facts.md) | [docs/audit_report.md](audit_report.md)
> **Hiện trạng:** Đối chiếu mã nguồn `679cc41` và [định hướng sản phẩm](../PRODUCT.md). Các mục tiêu và quyết định MVP từ tài liệu nguồn được giữ để theo dõi chênh lệch với triển khai.

---

## 1. Global Conventions

- **Kiến trúc mục tiêu (Architecture Style):** **Modular Monolith** (Frontend Next.js gọi backend Java Spring Boot 4 qua REST. Backend truy cập PostgreSQL).
- **Hạ tầng Công nghệ (Tech Stack):**
  - **Frontend:** Next.js (TypeScript, Tailwind CSS, Zustand State Management).
  - **Backend:** Java 21, Spring Boot 4, Spring Security và Spring Data JPA.
  - **Database:** PostgreSQL 16. Schema JSON lưu dưới dạng `TEXT`.
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

Số liệu chi phí và thời gian trong phần phân tích là giả định lập kế hoạch ban đầu.
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

Các số liệu và thời hạn trên là mục tiêu hoặc giả định đặt khi lập kế hoạch. Chưa có nguồn đo trong đợt đối chiếu này. `OBJ-03` là mục tiêu trải nghiệm tổng quát. Ngưỡng riêng của API khi kiểm thử tải nằm ở `NFR-PERF-01`.

## 4. Stakeholder Register (Danh Sách Các Bên Liên Quan)

| Role | Nhóm / Vai trò | Trách Nhiệm Chính | Mối Quan Tâm Cốt Lõi |
|:---|:---|:---|:---|
| **Host / Author** | Khách hàng tạo thiệp (Cặp đôi cưới, chủ tiệc) | Chọn mẫu, tùy biến nội dung chữ/ảnh, xuất bản link, quản lý danh sách lời chúc & RSVP | Giao diện sửa dễ dùng, xem trước trên điện thoại giống thật 100%, bảo mật quyền sửa thiệp |
| **Guest** | Khách mời sự kiện | Mở link trên điện thoại, xem lộ trình Google Maps, gửi lời chúc & xác nhận có đi hay không | Tải nhanh, không giật lag, giao diện trang trọng, thao tác gửi lời chúc đơn giản |
| **System Operator / Tech Lead** | Quản trị kỹ thuật & Vận hành | Giám sát hiệu năng lưu trữ và truy vấn, kiểm soát anti-spam, phát hành các block mới | Kiến trúc dễ mở rộng, code sạch không lỗi thời, chịu tải cao trong mùa cưới |
| **Product Owner / Business Sponsor** | Ban điều hành & Nhà đầu tư | Định hướng sản phẩm, kiểm soát chi phí hạ tầng (VPS, R2), tối ưu hóa doanh thu | ROI, tỷ lệ giữ chân người dùng, tự động hóa quy trình thanh toán |

---

## 5. Scope & Business Capabilities (Phạm Vi & Năng Lực Nghiệp Vụ)

### 5.1. Năng lực Nghiệp vụ trong phạm vi (In-Scope Capabilities)

| ID | Tên Năng Lực Nghiệp Vụ | Mô Tả Chi Tiết Năng Lực | Mức Độ Ưu Tiên (MoSCoW) | Truy Vết Mục Tiêu |
|:---|:---|:---|:---|:---|
| `CAP-01` | **Xác thực tài khoản** | Có đăng ký, xác minh email và quản lý phiên. Google OAuth2 và danh sách thiệp của chủ sở hữu còn trong backlog. | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-02` | **Kho mẫu thiệp và Studio** | Có HB04 Basic, Minimalism Đỏ Đậm và Song Hỷ Xanh để xem trước và tạo thiệp. Studio có luồng tạo, nhân bản và sửa mẫu. Nguồn seed `PROP-04`. | **Must** (MVP) | `OBJ-01` |
| `CAP-03` | **Cá nhân hóa và xem trước** | Người tạo nhập nội dung cưới, chỉnh giao diện và xem preview. Điều khiển thứ tự và ẩn section tùy package. | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-04` | **Dựng giao diện theo package mẫu** | Giữ bố cục, nội dung và hành vi của mẫu đã chọn. Snapshot mới gắn phiên bản renderer để thiệp đã chia sẻ có thể tiếp tục dùng cùng phiên bản. | **Must** (MVP) | `OBJ-01`, `OBJ-04` |
| `CAP-05` | **Thu thập và quản lý RSVP, lời chúc** | Khách gửi phản hồi và đọc sổ lưu bút. Quản lý cho chủ thiệp, xóa lời chúc và CSV còn trong backlog. | **Must** (MVP) | `OBJ-02` |
| `CAP-06` | **Xuất bản và chia sẻ** | Quick Create tạo thiệp cưới công khai với đường dẫn `/t/{slug}`. Quản lý nháp và OpenGraph theo từng thiệp còn trong backlog. | **Must** (MVP) | `OBJ-01`, `OBJ-03` |
| `CAP-07` | **Album và hộp mừng cưới** | Mẫu có thể có album, hộp quà và QR. Upload ảnh người dùng và phạm vi sinh QR cấu hình thuộc phần mở rộng. | **Should** (Phase 2) | `OBJ-01` |
| `CAP-08` | **Hiệu ứng và thương mại hóa** | Nhạc và hiệu ứng đã có theo mẫu. Thanh toán và watermark thuộc lộ trình thương mại hóa. | **Could** (Phase 3) | `OBJ-05` |

### 5.2. Ranh giới loại trừ nghiêm ngặt (Strict Out-of-Scope cho Phase 1 MVP)
- ❌ **Không làm cổng thanh toán trực tuyến:** Chưa tích hợp VietQR tự động, chưa phân quyền gói VIP/trả phí ở MVP (mọi tính năng MVP đều được sử dụng miễn phí để thông luồng).
- ❌ **Không làm kéo thả tọa độ tự do ($x, y$):** Không làm giao diện Free-form Canvas (chỉ làm dạng xếp chồng `STACK` cuộn dọc từ trên xuống với nút Lên/Xuống).
- ❌ **Upload ảnh người dùng nằm ngoài phạm vi MVP:** Người dùng có thể dùng URL ảnh. Tài nguyên dựng sẵn của mẫu được lưu bằng object storage.

---

## 6. Business Rules (`BR-xx` - Quy Tắc Nghiệp Vụ)

| ID | Tên Quy Tắc | Điều Kiện (Condition) | Kích Hoạt (Trigger) | Kết Quả Nghiệp Vụ (Outcome) | Ngoại Lệ (Exceptions) |
|:---|:---|:---|:---|:---|:---|
| `BR-01` | **Quyền sở hữu thiệp** | Tài khoản yêu cầu sửa thiệp hoặc quản lý phản hồi | Khi gọi thao tác của chủ thiệp | Quyết định MVP yêu cầu kiểm tra quyền sở hữu. Hiện Quick Create gắn ID khi đã xác thực và chấp nhận khách vãng lai. | Chính sách nhận quyền với thiệp tạo ẩn danh chờ quyết định. Nguồn `PROP-02`. |
| `BR-02` | **Bảo toàn slug** | Thiệp có link công khai | Khi cập nhật thiệp đã xuất bản | Giữ slug đã cấp để link chia sẻ tiếp tục hoạt động. Quick Create sinh slug ngay lúc lưu. | Luồng cập nhật thiệp đã lưu còn trong backlog. Nguồn `PROP-03`. |
| `BR-03` | **Xử lý URL ảnh** | Người dùng nhập URL ảnh | Khi lưu và khi ảnh tải lỗi | Quyết định MVP yêu cầu URL HTTP(S) cho ảnh nhập ngoài, chặn ảnh Base64 và có fallback khi phù hợp. | Media đi kèm mẫu có thể dùng đường dẫn nội bộ. Backend chưa cưỡng chế quy tắc trên schema. Nguồn `PROP-06`. |
| `BR-04` | **Kiểm soát spam lời chúc** | Khách gửi lời chúc trên trang công khai | Khi gửi form | API hiện kiểm tra tên tối đa 100 và lời chúc tối đa 500 ký tự. Quyết định MVP dùng tên tối đa 50 ký tự và 5 lượt/phút/IP. | Rate limit còn trong backlog. Cần xác nhận chênh lệch giới hạn tên. Nguồn `PROP-05`. |
| `BR-05` | **Trạng thái RSVP** | Khách gửi phản hồi | Khi validate và lưu RSVP | API yêu cầu `ATTENDING`, `DECLINED` hoặc `MAYBE`. `DECLINED` lưu 0 người. Trạng thái khác mặc định 1 khi thiếu hoặc gửi 0. | `MAYBE` là phần mở rộng của quyết định RSVP nhị phân `PROP-01`. Song Hỷ Xanh dùng `MAYBE` cho lời chúc từ form của mẫu. |
| `BR-06` | **Tương thích khi dựng thiệp** | Thiệp cũ hoặc mới được đưa vào renderer | Khi xem thử hoặc mở link thiệp | Thiệp có binding dùng đúng renderer version. Schema cũ đi qua adapter. Version lạ hiển thị lỗi. | Fallback cho thuộc tính và ảnh lỗi cần kiểm tra theo package. Nguồn `PROP-06`. |

---

## 7. Constraints, Assumptions & Risks

### 7.1. Ràng buộc kỹ thuật & kiến trúc (Constraints)
- **Framework và runtime** dùng Java 21, Spring Boot 4.1.1 và Next.js 14 App Router theo cấu hình dự án.
- **Lưu trữ** dùng PostgreSQL, với schema JSON lưu dưới dạng `TEXT` trong entity hiện tại. MinIO phục vụ tài nguyên mẫu. Thiết kế ban đầu dùng JSONB theo `FACT-TECH-03`.
- **Thiết bị hiển thị:** Ưu tiên số 1 cho màn hình điện thoại di động (Mobile-First Viewport $375\text{px} - 430\text{px}$).

### 7.2. Giả định cần kiểm chứng (Assumptions)
- Hơn $90\%$ khách mời sẽ mở thiệp thông qua ứng dụng Zalo trên điện thoại di động tại Việt Nam.
- Người tạo thiệp muốn xem kết quả hiển thị thay đổi ngay lập tức sau mỗi ký tự gõ trên bàn phím (Live Preview độ trễ $< 50$ms).

### 7.3. Ma Trận Quản Trị Rủi Ro (Risk Matrix)

| Risk ID | Mô Tả Rủi Ro | Khả Năng (Likelihood) | Mức Độ Tác Động (Impact) | Kế Hoạch Giảm Thiểu (Mitigation Plan) |
|:---|:---|:---|:---|:---|
| `RSK-01` | **Bot spam lời chúc rác / phá hoại thiệp cưới công khai** | Medium | High | Áp dụng Rate Limiting theo IP (`BR-04`), kiểm tra độ dài input và cấp nút **Xóa lời chúc** tức thì cho chủ thiệp trong Editor. |
| `RSK-02` | **Schema quá lớn hoặc chứa dữ liệu media nhúng** | Low | High | Kiểm soát đường dẫn và giới hạn kích thước ở `BR-03` và `TASK-17`. |
| `RSK-03` | **Ảnh bìa bị lỗi hoặc thiếu media** | Medium | Medium | Kiểm tra fallback theo mẫu và đồng bộ tài nguyên object storage khi triển khai. |
| `RSK-04` | **Sai lệch múi giờ đếm ngược giữa các thiết bị** | Medium | Medium | Mọi mốc thời gian sự kiện trong JSON bắt buộc lưu theo định dạng chuẩn ISO 8601 kèm múi giờ (`+07:00` hoặc UTC). |

---

## 8. Open Questions (Câu Hỏi Mở Chờ Xử Lý Ở Các Phase Tiếp Theo)

| Question ID | Nội Dung Câu Hỏi | Người Phụ Trách (Owner) | Cần Giải Quyết Ở | Trạng Thái |
|:---|:---|:---|:---|:---|
| `Q-01` | Cơ chế Google OAuth2 ở Phase 2 nên xử lý liên kết tài khoản như thế nào nếu email đã đăng ký bằng mật khẩu trước đó? | Lead Security Architect | Phase 2 (PRD) | Open |
| `Q-02` | Khi chuyển đổi sang Cloudflare R2 ở Phase 2, có nên áp dụng tiền xử lý nén ảnh WebP trực tiếp trên trình duyệt bằng Canvas API không? | Frontend Lead | Phase 2 (PRD) | Open |

---

Các năng lực hiện có tập trung vào thiệp cưới. Các loại sự kiện khác cần hợp đồng tạo thiệp và validation phù hợp. Xem [PRD](PRD.md) và [báo cáo nhất quán](CONSISTENCY_REPORT.md) để theo dõi các yêu cầu còn mở.
