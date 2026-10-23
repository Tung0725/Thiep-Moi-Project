# Fact Register (Dữ Kiện Nền Tảng Gốc)

> **Dự án**: Hệ thống Tạo và Chia sẻ Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)  
> **Nguồn trích xuất**: `docs/search/raw_requirement.md` (kết hợp đối chiếu `docs/search/Architecture.md` & `docs/search/Json_driven_UI.md`)  
> **Trạng thái**: Lossless Ingestion (Bảo toàn 100% dữ kiện gốc)  
> **Nguyên tắc**: Phân biệt rành mạch giữa Dữ kiện gốc (`[Source]`), Đề xuất của BA (`[Proposed]`) và Quyết định của User (`[Confirmed]`).

---

## 1. Dữ Kiện Định Hướng & Phạm Vi Tổng Thể (System & Scope Facts)

| Fact ID | Category | Nội dung Dữ kiện Gốc (Exact Facts & Constraints) | Source Pointer |
|:---|:---|:---|:---|
| `FACT-SCOPE-01` | Core Scope | Xây dựng hệ thống website tạo và chia sẻ thiệp mời sự kiện (thiệp cưới, sinh nhật, khai trương) trực tuyến theo kiến trúc **JSON-Driven UI** ở mức cơ bản nhất (**MVP**). | `raw_requirement.md` (Sec 1) |
| `FACT-SCOPE-02` | Pipeline Goal | Làm thông luồng hoàn chỉnh từ: **Sửa Form** $\rightarrow$ **Sinh ra JSON** $\rightarrow$ **Lưu vào Database** $\rightarrow$ **Hiển thị ra trang web public qua link rút gọn**. | `raw_requirement.md` (Sec 2) |
| `FACT-SCOPE-03` | Out-of-Scope | **Chưa làm cổng thanh toán**: Chưa tích hợp VietQR và chưa phân gói VIP. | `raw_requirement.md` (Sec 2.5) |
| `FACT-SCOPE-04` | Out-of-Scope | **Chưa làm kéo thả tự do**: Chưa hỗ trợ kéo thả theo tọa độ $x, y$; chỉ hỗ trợ sắp xếp dạng xếp chồng **STACK** từ trên xuống với nút bấm Lên/Xuống để đổi vị trí. | `raw_requirement.md` (Sec 2.5) |
| `FACT-SCOPE-05` | Out-of-Scope | **Chưa làm upload ảnh phức tạp**: Chưa tích hợp upload lên S3 / Cloudflare R2; tạm thời dán link ảnh URL trực tiếp để kiểm thử luồng dữ liệu. | `raw_requirement.md` (Sec 2.5) |

---

## 2. Dữ Kiện Công Nghệ & Hạ Tầng (Tech Stack & Architecture Facts)

| Fact ID | Category | Nội dung Dữ kiện Gốc | Source Pointer |
|:---|:---|:---|:---|
| `FACT-TECH-01` | Frontend | **Next.js** (TypeScript, Tailwind CSS). | `raw_requirement.md` (Sec 1) |
| `FACT-TECH-02` | Backend | **Java Spring Boot 4**. | `raw_requirement.md` (Sec 1) |
| `FACT-TECH-03` | Database | **PostgreSQL** sử dụng kiểu dữ liệu `JSONB` để lưu trữ cây giao diện JSON của thiệp. | `raw_requirement.md` (Sec 1) |
| `FACT-TECH-04` | Architecture | Kiến trúc **JSON-Driven UI (Server-Driven UI)**: Toàn bộ cấu trúc khối, thuộc tính và giao diện được quản lý bằng cây JSON Schema từ Backend. | `raw_requirement.md` (Sec 1) |

---

## 3. Dữ Kiện Tác Nhân & Phân Quyền (Actors & Roles)

| Fact ID | Role / Actor | Quyền hạn & Phạm vi Thao tác | Source Pointer |
|:---|:---|:---|:---|
| `FACT-ACT-01` | 👤 Người tạo thiệp (Author / Host) | Truy cập web, duyệt chọn mẫu thiệp, chỉnh sửa nội dung/theme trong Editor, bấm Lưu & Xuất bản để nhận link chia sẻ duy nhất (`slug`). | `raw_requirement.md` (Sec 1 & 2) |
| `FACT-ACT-02` | 👥 Khách mời (Guest) | Nhận link public `/t/{slug}`, mở trên điện thoại di động, xem thiệp được render động từ JSON, và điền form gửi lời chúc trực tiếp. | `raw_requirement.md` (Sec 1 & 2) |

---

## 4. Dữ Kiện Các Phân Hệ & Tính Năng Chi Tiết (Functional Facts)

### 4.1. Phân hệ Kho Mẫu Thiệp (Template Catalog)

| Fact ID | Category | Nội dung Dữ kiện Gốc | Source Pointer |
|:---|:---|:---|:---|
| `FACT-TPL-01` | Feature | Trang danh sách mẫu hiển thị **2–3 mẫu JSON** cấu hình sẵn trong Database. | `raw_requirement.md` (Sec 2) |
| `FACT-TPL-02` | Flow | Người dùng chọn một mẫu thiệp có sẵn trong kho mẫu để bắt đầu quá trình tạo thiệp mới. | `raw_requirement.md` (Sec 1.1) |

### 4.2. Phân hệ Trình Chỉnh Sửa Thiệp (Editor - `/editor/[id]`)

| Fact ID | Category | Nội dung Dữ kiện Gốc | Source Pointer |
|:---|:---|:---|:---|
| `FACT-EDT-01` | Layout | Màn hình Editor chia làm **2 cột**: Cột trái (Form nhập liệu) và Cột phải (Live Preview). | `raw_requirement.md` (Sec 1.2) |
| `FACT-EDT-02` | Left Column | Cột trái gồm các ô input để sửa properties của từng khối (tên cô dâu chú rể, ngày giờ, địa điểm Google Maps, lời mời, link ảnh) và thay đổi màu sắc / font chữ chủ đạo trong theme. | `raw_requirement.md` (Sec 1.2 & 2) |
| `FACT-EDT-03` | Right Column | Cột phải là `PageRenderer` đọc State JSON để vẽ lại UI ngay lập tức theo thời gian thực trên kích thước giả lập màn hình điện thoại (Phone Canvas). | `raw_requirement.md` (Sec 1.2 & 2) |
| `FACT-EDT-04` | Reordering | Sắp xếp các khối theo chế độ **STACK** (cuộn dọc từ trên xuống), điều chỉnh thứ tự bằng nút bấm Lên / Xuống (Up / Down). | `raw_requirement.md` (Sec 1.3 & 2.5) |

### 4.3. Dữ kiện Danh mục Khối Giao Diện Tối Thiểu (4 Blocks MVP)

| Fact ID | Block Name | Thành phần & Trách nhiệm hiển thị | Source Pointer |
|:---|:---|:---|:---|
| `FACT-BLK-01` | `HeroBlock` (`HeaderBlock`) | Hiển thị ảnh bìa sự kiện & tên cô dâu chú rể (hoặc chủ sự kiện). | `raw_requirement.md` (Sec 1.3 & 2) |
| `FACT-BLK-02` | `CountdownBlock` | Hiển thị đồng hồ đếm ngược thời gian thực đến ngày giờ diễn ra sự kiện. | `raw_requirement.md` (Sec 1.3 & 2) |
| `FACT-BLK-03` | `LocationBlock` | Hiển thị thông tin thời gian chi tiết & bản đồ chỉ đường Google Maps. | `raw_requirement.md` (Sec 1.3 & 2) |
| `FACT-BLK-04` | `WishesBlock` | Form nhập lời chúc và khu vực hiển thị danh sách lời chúc mừng từ khách mời. | `raw_requirement.md` (Sec 1.3 & 2) |

### 4.4. Phân hệ Lưu Trữ & Xuất Bản (Publishing & Slug Lifecycle)

| Fact ID | Category | Nội dung Dữ kiện Gốc | Source Pointer |
|:---|:---|:---|:---|
| `FACT-PUB-01` | Action | Khi người dùng bấm **Lưu và Xuất bản**, toàn bộ cấu trúc JSON của thiệp được gửi về lưu vào cột `JSONB` trong PostgreSQL. | `raw_requirement.md` (Sec 1.4) |
| `FACT-PUB-02` | Identifier | Hệ thống cấp phát một đường dẫn định danh duy nhất (`slug`) tương ứng với thiệp. | `raw_requirement.md` (Sec 1.4) |

### 4.5. Phân hệ Trang Thiệp Công Khai (Public Invitation View - `/t/[slug]`)

| Fact ID | Category | Nội dung Dữ kiện Gốc | Source Pointer |
|:---|:---|:---|:---|
| `FACT-PUB-03` | Client View | Khách mời truy cập `/t/{slug}` trên trình duyệt điện thoại di động sẽ xem được thiệp hoàn chỉnh render động từ dữ liệu JSON. | `raw_requirement.md` (Sec 1.5) |
| `FACT-PUB-04` | Interaction | Khách mời có thể trực tiếp điền form để gửi lời chúc mừng trên trang thiệp. | `raw_requirement.md` (Sec 1.5) |
| `FACT-PUB-05` | SEO / Social | Hỗ trợ hiển thị thẻ Meta OpenGraph cơ bản (tên sự kiện + ảnh bìa) khi chia sẻ đường dẫn qua mạng xã hội (Zalo, Facebook). | `raw_requirement.md` (Sec 2) |
