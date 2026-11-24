# Product Requirements Document (PRD)

> Đối chiếu mã nguồn tại `679cc41`. Phạm vi sản phẩm theo [BRD](BRD.md) và [PRODUCT.md](../PRODUCT.md).

## 1. Yêu cầu chức năng

| ID | Hành vi và tiêu chí nghiệm thu | Truy vết | Hiện trạng |
|---|---|---|---|
| `FR-01` | Người dùng đăng ký bằng email hợp lệ, sau đó xác minh bằng token gửi qua email. Với dữ liệu không hợp lệ, form báo lỗi và không tạo phiên. | `CAP-01` | Đã có |
| `FR-02` | Tài khoản đủ điều kiện đăng nhập nhận phiên qua cookie. Phiên có thể làm mới và đăng xuất. Mật khẩu sai hoặc tài khoản chưa xác minh bị từ chối. | `CAP-01` | Đã có |
| `FR-03` | Khi mở kho mẫu, người dùng thấy các mẫu đã xuất bản. Trang chi tiết nhận mã mẫu hoặc ID và hiển thị bản xem thử. Mã không tồn tại trả lỗi từ API. | `CAP-02` | Đã có |
| `FR-04` | Khi chọn mẫu cưới, người dùng có thể mở form cá nhân hóa và thấy dữ liệu mặc định của mẫu. Frontend ưu tiên dữ liệu backend và có dữ liệu đi kèm cho mẫu đã biết. | `CAP-02`, `CAP-03` | Đã có |
| `FR-05` | Khi sửa trường nội dung hoặc giao diện mà package hỗ trợ, preview cập nhật theo schema mới. Khi xuất bản, schema cá nhân hóa được gửi cùng thông tin sự kiện. Sửa lại thiệp đã lưu cần luồng chủ sở hữu. | `CAP-03`, `BR-01`, `BR-03` | Có preview và cá nhân hóa. Chưa có luồng sửa thiệp đã lưu |
| `FR-06` | Với các section hỗ trợ trong chế độ STACK, thay đổi thứ tự hoặc ẩn section phải phản ánh trên preview và schema lúc xuất bản. Kiểm tra theo từng package vì renderer quyết định cách hiển thị. | `CAP-03` | Có controls, mức hỗ trợ tùy package |
| `FR-07` | Khi schema có binding, dựng đúng package và version đã chọn. Schema cũ được ánh xạ qua registry. Binding không hỗ trợ hiển thị lỗi. Thiệp mới giữ binding trong schema khi lưu. | `CAP-04`, `BR-06` | Đã có |
| `FR-08` | Gửi form cưới hợp lệ thì Quick Create trả link `/t/{slug}` và tạo thiệp `PUBLISHED`. Người đã đăng nhập có thể được gắn ID, khách vãng lai vẫn có thể tạo. Link fallback từ trình duyệt chỉ có dữ liệu trên trình duyệt đó. Sau này, cập nhật thiệp phải giữ slug đã chia sẻ. | `CAP-06`, `BR-01`, `BR-02` | Có xuất bản trực tiếp. Nháp và xuất bản riêng còn trong backlog |
| `FR-09` | Khi mở link thiệp đã lưu, khách xem schema cá nhân hóa theo slug. Khi API không có dữ liệu sử dụng được, trang thử dữ liệu cục bộ rồi đối chiếu mã mẫu đi kèm. Nếu cả hai không khớp, trang hiển thị thông báo không tìm thấy thiệp. | `CAP-06`, `BR-06` | Đã có |
| `FR-10` | Khách gửi tên và trạng thái tham dự, có thể gửi kèm số người và lời chúc. Dữ liệu hợp lệ được lưu và có thể đọc lại qua sổ lưu bút phân trang. Dữ liệu sai trả `400`, slug không tồn tại trả `404`. HB04 và Minimalism có form RSVP. Song Hỷ Xanh có luồng xác nhận riêng lưu `ATTENDING` hoặc `DECLINED` và form lời chúc riêng lưu `MAYBE`. | `CAP-05`, `BR-04`, `BR-05` | Có gửi và đọc. Rate limit nằm trong backlog |
| `FR-11` | Chủ thiệp xem dữ liệu RSVP, xóa lời chúc thuộc thiệp của mình và tải CSV. Yêu cầu từ tài khoản không sở hữu thiệp bị từ chối. Kiểm thử CSV với tên và lời chúc tiếng Việt. | `CAP-05`, `BR-01`, `BR-04` | Chưa triển khai |
| `FR-12` | Khi crawler mở link thiệp, HTML trả tiêu đề và ảnh OpenGraph của thiệp. Thiệp không tồn tại phải có hành vi rõ ràng cho crawler. | `CAP-06` | Chưa có metadata theo từng thiệp |
| `FR-13` | Studio xem trước, tạo, nhân bản hoặc cập nhật mẫu. Khi tạo hoặc nhân bản với code đã có, API trả xung đột. Quyền ghi mẫu cần được chốt trước khi mở Studio cho biên tập có phân quyền. | `CAP-02`, `CAP-03` | Có API và Studio. API ghi mẫu hiện công khai |

## 2. Quyền truy cập hiện tại

| Role ID | Vai trò | Phạm vi |
|---|---|---|
| `ROLE-GUEST` | Khách vãng lai hoặc khách mời | Duyệt mẫu, dùng Quick Create, xem thiệp, gửi và đọc lời chúc công khai |
| `ROLE-HOST` | Người tạo thiệp có tài khoản | Có các luồng công khai và quản lý phiên/tài khoản. Quick Create ghi ID tài khoản khi xác thực |
| `ROLE-ADMIN` | Quản trị viên | Vai trò có trong mô hình tài khoản. Quyền quản trị Studio và thiệp cần hợp đồng riêng |

Các API tạo, clone và sửa **mẫu** đang mở theo `SecurityConfig`. Quyền sở hữu **thiệp** trong `BR-01` áp dụng cho các thao tác dự kiến tại `FR-05` và `FR-11`.

## 3. Màn hình

| Screen ID | Màn hình | Yêu cầu và trạng thái |
|---|---|---|
| `SCR-01` | `/register`, `/verify-email`, `/login` | `FR-01`, `FR-02`. Gửi form, báo lỗi và xác nhận kết quả |
| `SCR-02` | `/`, `/templates/[id]`, `/view/template/[id]` | `FR-03`, `FR-04`. Danh sách mẫu, chi tiết và preview |
| `SCR-03` | Quản lý thiệp cá nhân | Dự kiến cho `FR-05`, `FR-08`, `FR-11`. Cần các trạng thái rỗng, lỗi tải và từ chối quyền |
| `SCR-04` | `/create`, `/editor/studio` | `FR-04`–`FR-08`, `FR-13`. Quick Create cá nhân hóa thiệp. Studio chỉnh mẫu |
| `SCR-05` | `/t/[slug]` | `FR-07`, `FR-09`, `FR-10`, `FR-12`. Tải thiệp, trường hợp thiếu dữ liệu và phản hồi khi gửi lời chúc |

## 4. Yêu cầu phi chức năng

| ID | Mục tiêu hoặc cơ chế | Kiểm chứng |
|---|---|---|
| `NFR-PERF-01` | Mục tiêu P95 API đọc thiệp ≤ 150 ms tại 500 người dùng đồng thời. | Đo tải API với dữ liệu đại diện |
| `NFR-PERF-02` | Mục tiêu FCP ≤ 1,2 giây trên 4G và Lighthouse Performance ≥ 90. | Đo cold load trên trang thiệp thật theo từng package |
| `NFR-PERF-03` | Mục tiêu preview phản hồi ≤ 50 ms sau thao tác chỉnh sửa. | Đo từ input tới lúc preview cập nhật |
| `NFR-AVAIL-01` | Mục tiêu API đọc thiệp đạt 99,9% trong một tháng. | Probe HTTP trên môi trường triển khai |
| `NFR-SEC-01` | BCrypt cost 12. | Đối chiếu cấu hình `SecurityConfig` |
| `NFR-SEC-02` | JWT ký bằng khóa từ cấu hình. Hạn mặc định 24 giờ, tùy cấu hình môi trường. Kiểm tra phiên, xác thực và vòng quay refresh token. | Đối chiếu cấu hình và test auth |
| `NFR-SEC-03` | Giá trị nhập vào schema phải hiển thị an toàn qua renderer và adapter của từng mẫu. | Kiểm tra các điểm render HTML và xử lý URL theo package |
| `NFR-SEC-04` | Mục tiêu giới hạn 5 lần gửi lời chúc/phút/IP theo quyết định MVP. | Xác minh phản hồi `429` sau khi có rate limiter |
| `NFR-SCAL-01` | Mục tiêu giới hạn schema 500 KB và xử lý ảnh theo `BR-03`. Backend hiện lưu schema dưới dạng text. | Kiểm tra request quá ngưỡng khi cơ chế kiểm soát được triển khai |
| `NFR-USAB-01` | Thiệp đọc và thao tác được trên màn hình điện thoại. | Đối chiếu các viewport trong script browser của từng mẫu |
| `NFR-COMP-01` | Mở thiệp, chia sẻ và gửi phản hồi được trên trình duyệt mục tiêu. | Kiểm tra trên Zalo In-App Browser, Safari iOS và Chrome |

## 5. Câu hỏi mở

| Question ID | Câu hỏi | Phụ trách | Mốc |
|---|---|---|---|
| `Q-PRD-01` | Cache thiệp theo slug trong bao lâu để tương thích với luồng sửa sau khi xuất bản? | Backend | Trước khi bật cache |
| `Q-PRD-02` | Xác nhận encoding và các cột CSV trước khi bàn giao cho chủ tiệc. | Sản phẩm | Trước khi triển khai `FR-11` |
| `Q-PRD-03` | Khách tạo thiệp khi chưa đăng nhập sẽ nhận lại quyền sở hữu bằng cách nào? | Sản phẩm | Trước khi triển khai `SCR-03` |
| `Q-PRD-04` | Vai trò nào được tạo, nhân bản và cập nhật mẫu qua Studio? | Sản phẩm và Backend | Trước khi áp dụng kiểm soát ghi cho `FR-13` |

Các mục tiêu định lượng vẫn cần số đo. Tham chiếu triển khai và trạng thái kiểm tra nằm trong [ADD](ADD.md) và [báo cáo nhất quán](CONSISTENCY_REPORT.md).
