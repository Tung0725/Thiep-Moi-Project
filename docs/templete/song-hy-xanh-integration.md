# Song Hỷ Xanh trong dự án

Đã tích hợp mẫu `song-hy-xanh` vào kho mẫu backend, danh mục frontend, editor và luồng xuất bản. Renderer được ghim là `song-hy-green@1`.

- Xem mẫu: `http://localhost:3000/templates/song-hy-xanh`.
- Tạo thiệp: `http://localhost:3000/create?templateId=song-hy-xanh`.
- Thiệp kiểm chứng lưu thật: `http://localhost:3000/t/nguyen-minh-quan-tran-ha-linh-b27bf`.

## Cách chuyển

Giữ factory component gốc của Song Hỷ Xanh (module 65110), phong bì (89777), album, lightbox, lịch, hộp quà và trình phát nhạc. Dùng React/ReactDOM của dự án, CSS gốc trong Shadow DOM và adapter cho dịch vụ. Không dùng iframe hoặc dựng lại mẫu từ ảnh/DOM tĩnh. Các module không thuộc mẫu xanh trong danh mục nguồn đã được loại khỏi dữ liệu catalog đi kèm.

`frontend/scripts/import-song-hy-xanh.cjs` tái tạo package, CSS, dữ liệu mặc định và hai seed JSON từ archive đã trích xuất. `source-provenance.json` ghi module và hash nguồn. Thiệp đã lưu chứa nội dung và renderer version; bản archive gốc trong MinIO được giữ nguyên.

## Đã kiểm tra

- TypeScript và 8 kiểm thử package đạt, gồm giữ dữ liệu nguồn, ngày nhuận, giờ lễ/tiệc độc lập và xóa tài khoản demo khi đổi tên cặp đôi.
- 31 kiểm thử backend đạt, không có lỗi hoặc thất bại.
- So nguồn/bản tích hợp ở 375/1280px: cùng nội dung hiển thị và chiều rộng, không tràn ngang, không có ảnh hỏng. Chiều cao bản tích hợp dài hơn 1px tại sổ lưu bút; không tuyên bố giống từng pixel toàn trang.
- So tập animation của phong bì ở 200/650/1050ms: giữ niêm tan, hai lớp trang trí bay, phong bì rời đi và 32 hạt. Mở hoàn tất ở khung 1500ms; đã lưu ảnh nguồn/bản tích hợp ở từng pha.
- Album chuyển ảnh, lightbox, hộp quà, QR và chuyển động hộp quà đã kiểm tra bằng trình duyệt.
- Tạo thiệp qua form thật, đọc lại từ backend: Nguyễn Minh Quân / Trần Hà Linh, ngày 29/02/2028, giờ lễ 10:30 và giờ tiệc 19:15; không lộ tên cặp đôi demo trên bản đã cá nhân hóa.
- RSVP đến lưu `ATTENDING`, số người 1; từ chối lưu `DECLINED`, số người 0. Lời chúc riêng lưu `MAYBE`. Đã đối chiếu trực tiếp cả ba bản ghi trong PostgreSQL cùng renderer và nội dung thiệp.
- Tự cuộn đo được 25px/500ms, dừng khi nhập form và tiếp tục khi click vùng trống. Reduced motion mở thẳng nội dung, không còn animation chạy và không khóa cuộn.
- HB04 và Minimalism Đỏ Đậm qua kiểm tra hồi quy demo ở 320/375/430/768/1280px.
- Không có exception, console warning/error hoặc request local lỗi trong lượt kiểm tra bản tích hợp cuối. Bản replay nguồn có lỗi hydration React 418 và telemetry Faro riêng; được ghi ở `referenceErrors`, không tính thành lỗi của bản tích hợp.

Bằng chứng: `extracted_templates/song-hy-xanh/browser-check/report.json`, `behavior-report.json` và ảnh cùng thư mục; hồi quy ở `extracted_templates/browser-check/demo-layout/after/report.json`. Các bài kiểm tra dùng frontend/backend/MinIO thật, không mock API.

## Khác biệt và giới hạn đã xác định

- Nhạc thay bằng **Lễ Đường – Kai Đinh** theo yêu cầu người dùng.
- Font Montserrat Latin Extended còn thiếu được tải đúng từ URL nguồn, xác minh WOFF2/SHA-256 và lưu tại `archive/integration/fonts/`. Tổng kho hiện có 150 tệp và báo cáo SHA-256.
- Bản đồ dùng adapter Google Maps theo địa chỉ của thiệp; không mang API key hardcode từ nguồn sang dự án. Telemetry ngoài được bỏ.
- Nút gợi ý lời chúc dùng danh sách gợi ý local, giao diện đã đổi nhãn để không quảng cáo khả năng AI chưa có trong dự án.
- Editor giữ bố cục, màu và kiểu chữ gốc; hỗ trợ thông tin cưới chung, giờ làm lễ, cha mẹ và URL nhạc. Chưa mở chỉnh sửa riêng từng section, sắp xếp section, nhập tài khoản mừng cưới hoặc chỉnh album qua form. Khi đổi tên cặp đôi, tài khoản demo được xóa như quy ước hiện tại của Minimalism.
- Giữ nguyên chênh lệch giờ tiệc 18:00/lịch trình khai tiệc 18:30 trong mẫu mặc định; không tự sửa nội dung nguồn.

## Chạy lại kiểm tra

Chrome headless cần mở CDP ở cổng 9224; có thể cấu hình `CDP_PORT`, `FRONTEND_URL`, `BACKEND_URL`, `REFERENCE_URL`. Backend/frontend/MinIO và replay cổng 3101 phải đang chạy.

```powershell
node frontend/scripts/test-template-packages.cjs
node frontend/scripts/test-song-hy-browser.mjs
node frontend/scripts/test-song-hy-browser.mjs --behavior
node frontend/scripts/test-demo-layout-browser.mjs
```

Chế độ mặc định tạo một thiệp kiểm chứng mới và lưu hai RSVP thật. `--behavior` dùng slug từ báo cáo mặc định gần nhất (hoặc `INVITATION_SLUG`) và gửi thêm một lời chúc thật. Các báo cáo ghi trạng thái đang chạy/đạt/thất bại để không giữ kết quả đạt cũ khi lần kiểm tra mới lỗi.
