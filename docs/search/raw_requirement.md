# Yêu Cầu Dự Án: Hệ Thống Thiệp Mời Sự Kiện Trực Tuyến (JSON-Driven UI)

---

## 1. Đề Bài & Luồng Hoạt Động Cốt Lõi

### Đề bài
Xây dựng hệ thống website tạo và chia sẻ thiệp mời sự kiện (thiệp cưới, sinh nhật, khai trương) trực tuyến theo kiến trúc **JSON-Driven UI** ở mức cơ bản nhất (**MVP**).

### Công nghệ sử dụng
- **Frontend**: Next.js (TypeScript, Tailwind CSS)
- **Backend**: Java Spring Boot 3
- **Database**: PostgreSQL (sử dụng kiểu dữ liệu `JSONB`)

### Luồng hoạt động cốt lõi
1. **Chọn mẫu (Template)**: Người dùng truy cập web, chọn một mẫu thiệp có sẵn trong kho mẫu.
2. **Chỉnh sửa (Editor)**: Người dùng được đưa vào màn hình Editor chia làm 2 cột:
   - **Cột trái (Form nhập liệu)**: Chỉnh sửa tên cô dâu chú rể, ngày giờ, địa điểm Google Maps, lời mời, đường dẫn ảnh và đổi màu sắc / font chữ chủ đạo.
   - **Cột phải (Live Preview)**: Khung hiển thị giao diện thiệp trên kích thước màn hình điện thoại theo thời gian thực dựa trên State JSON.
3. **Cấu trúc hiển thị**: Ở giai đoạn cơ bản này, các khối nội dung (**Blocks**) được sắp xếp theo dạng danh sách cuộn dọc từ trên xuống (**STACK mode**) gồm 4 khối cơ bản:
   - **Header Block**: Ảnh bìa & Tên cô dâu chú rể.
   - **Countdown Block**: Đếm ngược ngày diễn ra sự kiện.
   - **Location Block**: Thông tin thời gian & Bản đồ chỉ đường.
   - **Wishes Block**: Form gửi lời chúc mừng.
4. **Lưu & Xuất bản**: Khi người dùng bấm **Lưu và Xuất bản**:
   - Toàn bộ cấu trúc JSON của thiệp được gửi về lưu vào cột `JSONB` trong PostgreSQL.
   - Hệ thống cấp phát một đường dẫn định danh duy nhất (`slug`).
5. **Khách mời xem thiệp**: Khách mời khi truy cập vào đường dẫn public `/t/{slug}` trên điện thoại sẽ xem được chiếc thiệp hoàn chỉnh được render động từ dữ liệu JSON đó và có thể điền form gửi lời chúc trực tiếp.
6. **Lưu ý**: Chưa cần làm hệ thống thanh toán, kéo thả tọa độ tự do hay hiệu ứng phức tạp ở giai đoạn này.

---

## 2. Phiên Bản Gạch Đầu Dòng (Checklist Bắt Tay Vào Code)

> Bản bóc tách dùng để lưu vào file `README.md` hoặc `SPEC.md` trong repo để theo dõi tiến độ từng ngày.

### Mục tiêu
- Làm thông luồng từ việc sửa Form $\rightarrow$ sinh ra JSON $\rightarrow$ lưu vào Database $\rightarrow$ hiển thị ra trang web public qua link rút gọn.

### Đối tượng sử dụng
- 👤 **Người tạo thiệp**: Chọn mẫu, sửa nội dung chữ / ảnh, lấy link chia sẻ.
- 👥 **Khách mời**: Mở link trên điện thoại xem thông tin sự kiện và gửi lời chúc.

### Các tính năng bắt buộc (In-Scope cho MVP)
- [ ] **Trang danh sách mẫu**: Hiển thị 2–3 mẫu JSON cấu hình sẵn trong Database.
- [ ] **Trang Editor (`/editor/[id]`)**:
  - Cột trái là các ô input sửa props của từng khối và đổi màu/font trong theme.
  - Cột phải là `PageRenderer` đọc state JSON vẽ lại UI ngay lập tức theo thời gian thực.
- [ ] **Các Block giao diện tối thiểu (4 blocks)**:
  - `HeroBlock`: Ảnh bìa, tên cô dâu chú rể.
  - `CountdownBlock`: Đếm ngược tới ngày sự kiện.
  - `LocationBlock`: Thời gian & bản đồ Google Maps.
  - `WishesBlock`: Form và danh sách gửi lời chúc.
- [ ] **Trang xem thiệp Public (`/t/[slug]`)**:
  - Gọi API lấy JSON theo `slug`.
  - Hỗ trợ hiển thị thẻ Meta OpenGraph cơ bản (tên + ảnh bìa) khi chia sẻ link qua Zalo / Facebook.

### Các tính năng bỏ qua làm sau (Out-of-Scope)
- ❌ **Chưa làm cổng thanh toán**: Chưa tích hợp VietQR và phân gói VIP.
- ❌ **Chưa làm kéo thả tự do**: Chưa hỗ trợ kéo thả theo tọa độ $x, y$ (chỉ làm dạng xếp chồng STACK từ trên xuống, có nút bấm Lên/Xuống để đổi thứ tự các khối).
- ❌ **Chưa làm upload ảnh phức tạp**: Chưa tích hợp upload lên S3 / Cloudflare R2 (tạm thời dán link ảnh URL trực tiếp để test luồng trước).