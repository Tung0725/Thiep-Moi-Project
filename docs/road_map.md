# 🗺️ Lộ Trình Phát Triển Dự Án (Project Roadmap)

> **Mục tiêu:** Chia nhỏ lộ trình phát triển từ con số 0 đến khi hệ thống vận hành và thương mại hóa thành **4 giai đoạn rõ ràng** (tương ứng với 4 bản Release), giúp lập trình viên không bị "ngợp" và kiểm soát chất lượng từng ngày.  
> **Nguyên tắc tối thượng:** Mỗi giai đoạn kết thúc đều phải có một sản phẩm chạy được để nhìn thấy kết quả ngay, không làm dàn trải.

---

## 📌 Bảng Tóm Tắt Lộ Trình Theo Cột Mốc Kiểm Soát

| Giai đoạn | Thời gian | Trọng tâm cốt lõi | Dấu hiệu hoàn thành (Definition of Done) |
|:---|:---|:---|:---|
| **1. Core MVP** | Tuần 1 | Thông luồng JSON $\leftrightarrow$ UI | Sửa form bên trái, lưu vào PostgreSQL JSONB, mở link `/t/{slug}` thấy giao diện đổi theo thời gian thực. |
| **2. Usable Product** | Tuần 2 – 3 | Hoàn thiện luồng người dùng thực tế | Đăng nhập Google, chọn kho mẫu, upload ảnh thật lên R2/S3, gửi link qua Zalo hiện ảnh thumbnail sắc nét. |
| **3. Production & Monetization** | Tuần 4 – 5 | Làm đẹp, đóng gói & Thu tiền tự động | Có nhạc nền, hoa rơi, đóng dấu Watermark bản nháp, quét mã VietQR tự động mở khóa link chính thức. |
| **4. V2 Advanced** | Sau khi có khách | Kéo thả tự do (Free-form Canvas) | Kéo thả mọi thành phần trên màn hình tự do theo tọa độ $x, y$ như Canva, co giãn chuẩn trên mọi thiết bị. |

---

## 🚀 Giai Đoạn 1: Core MVP — Thông Luồng Kỹ Thuật (Tuần 1)

### 🎯 Mục tiêu
Chứng minh kiến trúc **JSON-Driven UI** hoạt động trơn tru từ Frontend xuống Database và ngược lại.  
*(Chưa cần đăng nhập, chưa cần upload ảnh, chưa cần giao diện quá cầu kỳ).*

### 🛠️ Công việc ở Backend (Spring Boot + PostgreSQL)
- **Khởi tạo Database:** Tạo duy nhất 1 bảng `invitations` có cột `slug` (`VARCHAR UNIQUE`) và `content_schema` (`JSONB`).
- **Viết 3 API cơ bản:**
  - `POST /api/invitations`: Tạo mới 1 bản ghi thiệp với JSON Schema mặc định.
  - `PUT /api/invitations/{id}`: Cập nhật lại cây JSON Schema khi người dùng chỉnh sửa trên Editor.
  - `GET /api/public/invitations/{slug}`: Trả về cây JSON Schema để trang public hiển thị.

### 💻 Công việc ở Frontend (Next.js + Tailwind CSS + Zustand)
- **Định nghĩa JSON Schema v1:** Thiết kế cấu trúc chế độ `STACK` (xếp chồng dọc).
- **Dựng 4 Block cơ bản nhất:**
  - `HeroBlock`: Hiển thị tên chú rể, cô dâu, ngày cưới, 1 ảnh bìa (tạm thời dán link ảnh trực tiếp).
  - `CountdownBlock`: Nhận `targetDate` từ JSON và đếm ngược thời gian thực.
  - `LocationBlock`: Hiển thị tên nhà hàng, địa chỉ và nút mở link Google Maps.
  - `WishesBlock`: Hiển thị danh sách lời chúc giả lập.
- **Viết `ComponentRegistry` & `StackRenderer`:** Đọc mảng `blocks` từ JSON và render động ra 4 khối trên.
- **Dựng màn hình Editor tối giản (`/editor/[id]`):**
  - **Cột trái:** Các ô `<input>` sửa chữ của 4 block trên + 1 ô chọn màu sắc chủ đạo (`primaryColor`).
  - **Cột phải:** Nhúng `StackRenderer` đọc dữ liệu trực tiếp từ Zustand store.
- **Dựng trang Public (`/t/[slug]`):** Gọi API lấy JSON và truyền vào `StackRenderer`.

> **🏁 Kết quả sau Tuần 1:** Bạn gõ chữ bên trái $\rightarrow$ khung điện thoại bên phải nhảy chữ theo $\rightarrow$ bấm **Lưu** $\rightarrow$ mở link `/t/tuan-mai` trên điện thoại thấy đúng chiếc thiệp đó hiện ra.

---

## 💎 Giai Đoạn 2: Usable Product — Hoàn Thiện Luồng Người Dùng (Tuần 2 – 3)

### 🎯 Mục tiêu
Biến bản demo kỹ thuật thành một sản phẩm hoàn chỉnh mà bạn bè của bạn có thể tự vào tạo thiệp, upload ảnh cưới thật và gửi link qua Zalo để xem thử.

### 🛠️ Công việc ở Backend
- **Authentication (Đăng nhập nhanh):** Tích hợp Google OAuth2 / JWT (người dùng làm thiệp rất ngại đăng ký tài khoản bằng mật khẩu, bấm "Đăng nhập bằng Google" là nhanh và tiện nhất).
- **Module Kho mẫu (`templates`):** Tạo bảng `templates` lưu sẵn 3 cục JSON mẫu với 3 phong cách màu/font khác nhau. Khi user bấm "Dùng mẫu này", hệ thống sao chép JSON từ `templates` sang bảng `invitations` của user đó.
- **Module Lời chúc thật (`wishes`):** Tạo bảng `wishes` và API `POST /api/public/invitations/{slug}/wishes` để khách mời mở thiệp có thể gửi lời chúc lưu thẳng vào Database.
- **Module Upload Ảnh (Cloudflare R2 / AWS S3):** Viết API sinh Presigned URL hoặc upload ảnh trực tiếp để user tải ảnh cưới từ máy lên, trả về link CDN gắn vào JSON.

### 💻 Công việc ở Frontend
- **Cơ chế "Local-First":** Cho phép khách chưa đăng nhập vẫn vào sửa thiệp được (lưu tạm vào `localStorage`). Khi bấm **"Lưu / Xuất bản"** mới yêu cầu đăng nhập Google, sau đó tự động đồng bộ JSON từ `localStorage` lên Server.
- **Quản lý Mảng Block trên Editor:** Thêm nút Bật/Tắt (Ẩn/Hiện) từng block và nút Mũi tên Lên/Xuống để người dùng tự đổi thứ tự các khối (ví dụ: đưa Album ảnh lên trước Bản đồ).
- **Thêm 2 Block tính năng ăn khách:**
  - `GalleryBlock`: Hiển thị lưới album ảnh cưới (cho phép xem 4–8 ảnh).
  - `GiftQrBlock` (Hộp mừng cưới): Cho phép dâu rể chọn ngân hàng, nhập số tài khoản $\rightarrow$ tự động sinh ảnh mã VietQR nhận tiền mừng.
- **Tối ưu chia sẻ Zalo (SSR OpenGraph):** Cấu hình hàm `generateMetadata` ở trang `/t/[slug]/page.tsx` lấy tên dâu rể và ảnh bìa từ API để khi dán link vào Zalo hiện khung preview sắc nét.

> **🏁 Kết quả sau Tuần 3:** Một sản phẩm chạy mượt mà từ A–Z: có trang chọn mẫu, quản lý thiệp nháp, upload ảnh thật, gửi link qua Zalo hiển thị thumbnail đẹp mắt.

---

## 💰 Giai Đoạn 3: Production & Monetization — Kiếm Tiền & Làm Đẹp (Tuần 4 – 5)

### 🎯 Mục tiêu
Đóng gói thương mại. Nâng tầm giao diện sang trọng để khách hàng sẵn sàng rút ví trả 49k–99k/thiệp, tự động hóa quy trình thu tiền 100%.

### 🎨 Giao diện & Trải nghiệm (UI/UX Polish)
- **Tích hợp Dynamic Font & Theme:** Đưa vào 5–7 bộ Google Fonts Việt hóa cao cấp (viết tay, serif cổ điển) và 5 bảng màu thịnh hành (Đỏ rượu, Xanh rêu, Kem Hàn Quốc, Hồng Pastel).
- **Thêm Lớp Hiệu Ứng (`effects`):**
  - **Nhạc nền (Floating Audio):** Nút đĩa nhạc xoay ở góc màn hình, tự động phát/dừng.
  - **Hiệu ứng rơi phủ màn hình (FallingEffect):** Cánh hoa hồng rơi hoặc tuyết rơi nhẹ nhàng.
  - **Hiệu ứng cuộn (Framer Motion / AOS):** Lướt tới đâu các khối trượt nhẹ lên mượt mà tới đó.
- **Tính năng "Save as Template" cho Admin:** Dùng ngay chính Editor này để phối ra 5–10 mẫu thiệp thật đẹp rồi bấm lưu thẳng vào bảng `templates`.

### 💳 Thanh Toán & Phân Quyền (Backend + Frontend)
- **Cơ chế Khóa tính năng (Paywall / Feature Gating):**
  - Khi thiệp ở trạng thái `DRAFT` (chưa trả tiền): Link public sẽ có dải Watermark (Đóng dấu bản quyền) mờ chạy ngang màn hình ghi *"Bản xem trước - Vui lòng xuất bản để xóa nhãn này"*, hoặc giới hạn hiển thị trong 3 ngày.
- **Tích hợp Cổng thanh toán tự động (PayOS hoặc SePay):**
  - User bấm nút **[Xuất bản chính thức (69.000đ)]** $\rightarrow$ Hiển thị popup mã VietQR kèm số tiền và mã nội dung chuyển khoản duy nhất.
  - Khách quét mã chuyển khoản $\rightarrow$ Webhook ngân hàng báo về Spring Boot $\rightarrow$ Tự động đổi trạng thái thiệp từ `DRAFT` sang `PUBLISHED` (xóa hoàn toàn Watermark, mở khóa nhạc nền và hiệu ứng rơi hoa).
- **Hạ tầng & Hiệu năng:**
  - Đưa Redis hoặc Cloudflare Cache vào cache API `GET /api/public/invitations/{slug}` để chịu tải hàng vạn khách truy cập cùng lúc trong mùa cưới.
  - Tự động nén ảnh tại trình duyệt trước khi upload lên R2 để tiết kiệm dung lượng và tăng tốc tải trang.

> **🏁 Kết quả sau Tuần 5:** Hệ thống vận hành tự động hoàn toàn. Khách làm thiệp, quét mã VietQR trả tiền lúc 2 giờ sáng khi bạn đang ngủ thì hệ thống vẫn tự động kích hoạt và mở khóa link cho khách.

---

## 🌟 Giai Đoạn 4: V2 Advanced — Kéo Thả Tự Do (Sau Khi Đã Có Khách)

### 🎯 Mục tiêu
Khi hệ thống đã có dòng tiền và lượng người dùng ổn định, nâng cấp trình Editor lên dạng **Free-Form Canvas** (Kéo thả tọa độ $x, y$) để tạo lợi thế cạnh tranh áp đảo.

### 🚀 Nâng cấp Kỹ thuật
- **Nâng cấp JSON Schema:** Mở rộng sang `version: 2`, `layoutMode: "FREE_CANVAS"` (hỗ trợ các thuộc tính $x, y, w, h, rotation, zIndex$).
- **Thư viện tương tác:** Tích hợp `react-moveable` vào khung Preview để người dùng bấm vào chữ/ảnh có thể kéo rê bất kỳ đâu, xoay nghiêng, phóng to/thu nhỏ như thiết kế trên Canva.
- **Bộ máy CanvasRenderer:** Viết thêm `CanvasRenderer.tsx` sử dụng cơ chế `transform: scale()` để đảm bảo tỷ lệ kéo thả hiển thị chuẩn xác 100% trên mọi kích thước màn hình điện thoại khác nhau.
- **Lịch sử Thao tác (Undo / Redo):** Bổ sung phím tắt `Ctrl + Z` / `Ctrl + Y` thông qua middleware `zundo` của Zustand.