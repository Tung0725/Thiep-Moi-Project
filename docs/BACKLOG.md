# Backlog triển khai và ma trận truy vết

> Baseline `679cc41`. Trạng thái dựa trên mã nguồn. Tiêu chí trong các task còn mở dùng để nghiệm thu khi triển khai. Xem [BRD](BRD.md), [PRD](PRD.md) và [ADD](ADD.md).

## 1. Nền tảng và luồng đang có

### `TASK-00` Nền tảng ứng dụng và hạ tầng

- **Traces to:** `ADR-01`, `ADR-05`, `ADR-06`, `NFR-AVAIL-01`

**Đã có cấu hình.** Backend Maven, frontend Next.js, Compose PostgreSQL và MinIO. Nghiệm thu vận hành trên môi trường mục tiêu cần schema phù hợp và media đủ cho từng mẫu.

### `TASK-01` Xác thực và phản hồi API chuẩn

- **Traces to:** `BR-01`, `ADR-03`, `NFR-SEC-01`, `NFR-SEC-02`

**Có nền tảng.** Spring Security, JWT, BCrypt và `ApiResponse`. Kiểm tra quyền chủ thiệp thuộc `TASK-07` và `TASK-10`. Quyền ghi mẫu thuộc `TASK-16`.

### `TASK-02` Đăng ký, xác minh email và phiên đăng nhập

- **Traces to:** `FR-01`, `FR-02`, `API-01`, `API-02`, `API-18`, `API-19`, `API-20`, `SCR-01`

**Đã có.** Kiểm tra đăng ký, email xác minh, đăng nhập, refresh, logout và đổi mật khẩu. SMTP cần cấu hình phù hợp ở môi trường tích hợp.

### `TASK-03` Kho mẫu và seed mặc định

- **Traces to:** `FR-03`, `API-03`, `API-14`, `POL-03`, `SCR-02`

**Đã có.** Kiểm tra ba mã mẫu trên cơ sở dữ liệu mới và seed lại trên cơ sở dữ liệu đã có bản ghi. Đối chiếu schema và tài nguyên của từng mẫu.

### `TASK-04` Quick Create từ mẫu cưới

- **Traces to:** `FR-04`, `FR-08`, `API-12`, `CMD-03`, `SCR-04`

**Đã có.** Chọn mẫu, cá nhân hóa và xác nhận thiệp `PUBLISHED` mở được từ trình duyệt khác. Kiểm tra riêng nhánh localStorage khi API lỗi. Luồng bản nháp thuộc `TASK-07`.

### `TASK-05` Renderer package và tương thích dữ liệu cũ

- **Traces to:** `FR-07`, `ADR-04`, `BR-06`, `NFR-USAB-01`

**Đã có.** Kiểm thử binding mới, schema cũ và binding không nhận diện được. Khi thêm version, kiểm tra lại thiệp đang tham chiếu version trước và URL media tương ứng.

### `TASK-06` Preview và điều khiển section

- **Traces to:** `FR-05`, `FR-06`, `SCR-04`, `NFR-PERF-03`

**Có controls.** Nghiệm thu thay đổi nội dung, theme, thứ tự và ẩn section với từng package. Sửa lại thiệp sau khi xuất bản thuộc `TASK-07`.

### `TASK-07` Vòng đời thiệp do chủ sở hữu quản lý

- **Traces to:** `FR-05`, `FR-08`, `BR-01`, `BR-02`, `API-04`, `API-05`, `API-06`, `API-07`, `CMD-09`, `SCR-03`

**Còn mở.** Chốt cách khách nhận lại quyền sở hữu thiệp tạo ẩn danh tại `Q-PRD-03`, cùng hành vi đọc và nhận RSVP theo trạng thái. Nghiệm thu lưu nháp, xuất bản, chỉnh sửa giữ slug, từ chối truy cập chéo và xử lý thiệp cũ không có chủ.

### `TASK-08` Trang thiệp công khai và OpenGraph

- **Traces to:** `FR-09`, `FR-12`, `API-08`, `SCR-05`, `NFR-PERF-01`, `NFR-PERF-02`, `NFR-COMP-01`

**Có trang công khai.** Phần còn mở là metadata theo từng slug. Nghiệm thu tiêu đề và ảnh OpenGraph trong HTML ban đầu, xử lý slug không tồn tại và thử chia sẻ qua trình duyệt mục tiêu.

### `TASK-09` RSVP, sổ lưu bút và chống spam

- **Traces to:** `FR-10`, `BR-04`, `BR-05`, `API-09`, `API-13`, `NFR-SEC-04`

**Có đọc và ghi.** Nghiệm thu lưu, phân trang, chuẩn hóa số người, trường hợp thiệp không tồn tại và hành vi theo từng mẫu. Phần còn mở là giới hạn gửi đã chốt trong audit và kiểm thử phản hồi `429`.

### `TASK-10` Quản lý phản hồi và xuất CSV

- **Traces to:** `FR-11`, `BR-01`, `API-10`, `API-11`, `POL-02`, `SCR-03`

**Còn mở.** Phụ thuộc cơ chế xác định chủ thiệp ở `TASK-07`. Nghiệm thu xem và xóa đúng phạm vi, từ chối tài khoản khác, xuất báo cáo khớp dữ liệu và đọc được tiếng Việt theo `Q-PRD-02`.

### `TASK-16` Studio mẫu và quyền ghi

- **Traces to:** `FR-13`, `API-15`, `API-16`, `API-17`, `CMD-10`

**Có Studio và thao tác mẫu.** Chốt `Q-PRD-04` rồi kiểm thử từ chối thao tác ghi của người không có quyền. Nghiệm thu clone có code riêng và cập nhật mẫu không đổi snapshot của thiệp đã tạo.

### `TASK-17` Kiểm tra dữ liệu schema khi ghi

- **Traces to:** `FR-05`, `FR-07`, `BR-03`, `NFR-SEC-03`, `NFR-SCAL-01`

**Còn mở.** Xác định giới hạn payload, trường URL chấp nhận được và cách đọc schema cũ. Nghiệm thu schema quá giới hạn, URL sai, dữ liệu mẫu hợp lệ và tương thích thiệp đã xuất bản.

## 2. Phạm vi mở rộng

| Task ID | Phạm vi | Truy vết | Hiện trạng và nghiệm thu |
|---|---|---|---|
| `TASK-11` | Google OAuth2 | `CAP-01`, `Q-01` | Dự kiến. Chốt liên kết tài khoản cùng email và kiểm thử đăng nhập |
| `TASK-12` | Upload ảnh người dùng | `CAP-07`, `Q-02`, `ADR-06` | Dự kiến. Media mẫu đã có object storage. Nghiệm thu tải ảnh lên và hiển thị trong thiệp |
| `TASK-13` | Hộp mừng cưới và QR cấu hình | `CAP-07` | Một số package có hộp quà hoặc QR. Kiểm tra cấu hình theo mẫu và phạm vi tạo QR từ dữ liệu người dùng |
| `TASK-14` | Thanh toán và watermark | `CAP-08`, `OBJ-05` | Dự kiến. Cần chốt điều kiện gỡ watermark và kiểm thử xác nhận thanh toán |
| `TASK-15` | Nhạc và hiệu ứng trang thiệp | `CAP-08` | Có component và hiệu ứng theo mẫu. Nghiệm thu nguồn media và hành vi trên mobile, kể cả reduced motion |

## 3. Ma trận truy vết chức năng

| Yêu cầu | API hoặc điểm thực thi | Công việc |
|---|---|---|
| `FR-01`, `FR-02` | `API-01`, `API-02`, `API-18`, `API-19`, `API-20` | `TASK-02` |
| `FR-03`, `FR-04` | `API-03`, `API-14`, `API-12` | `TASK-03`, `TASK-04` |
| `FR-05`, `FR-06` | Preview cục bộ. `API-05` và `API-06` dự kiến | `TASK-06`, `TASK-07`, `TASK-17` |
| `FR-07` | `PageRenderer` và registry | `TASK-05` |
| `FR-08` | `API-12`. `API-04` và `API-07` dự kiến | `TASK-04`, `TASK-07` |
| `FR-09`, `FR-12` | `API-08` và trang công khai. OpenGraph theo slug đang mở | `TASK-08` |
| `FR-10` | `API-09`, `API-13` | `TASK-09` |
| `FR-11` | `API-10`, `API-11` dự kiến | `TASK-10` |
| `FR-13` | `API-15`, `API-16`, `API-17` | `TASK-16` |
