# Kiểm chứng bản sửa Minimalism đỏ đậm

## Nguồn và quyết định tích hợp

Nguồn hiện có là HTML, cây DOM và bundle đã build trong `extracted_templates`, không phải repository component gốc. Module `90662` trong `minimalism-original-module.txt` xuất component nhận `{ data, isPreview, onDataChange }`, chuẩn hóa qua module `71675`. Đây là điểm nhận dữ liệu ở cấp module; chưa phải giao thức có thể gọi trực tiếp từ ứng dụng chủ. Module còn phụ thuộc bộ component dùng chung, asset loader và runtime webpack của website nguồn.

SHA-256 của module đã khảo sát: `088b37ee2936dbe30dd54519d823f361df73b03e5dabdf3f3b6cbb0454344d80`.

Giữ renderer React/Shadow DOM v2 hiện có để sửa lỗi dữ liệu. Đây vẫn là bản phục dựng tương tác, chưa phải tích hợp nguyên runtime nguồn. Không thêm iframe, thay API/schema công khai hoặc thay renderer v1.

Kiểm kê tìm đủ 131 tài nguyên trong manifest. `data/demo.json` hiện dài 593 byte, khác 376 byte trong manifest; chưa thể chứng nhận toàn bộ archive nguyên trạng. Không sửa manifest để che sai lệch này.

## Các lỗi đã sửa

- Bộ nhập giữ `value=yes/no` của radio RSVP; renderer từ chối giá trị không hợp lệ và yêu cầu chọn trước khi gửi.
- Khai báo binding cho tên, gia đình, ngày/giờ lễ và tiệc, địa điểm, lịch trình, tài khoản quà mừng. Renderer lấy dữ liệu theo khóa; không tìm–thay tên/ngày mẫu trong nội dung khi render.
- Bộ nhập kiểm tra cấu trúc section và các binding bắt buộc, báo lỗi nếu bản chụp nguồn thay đổi. Việc nhận diện section hiện vẫn dùng vị trí có kiểm tra, chưa là bộ nhập tổng quát.
- Giữ CSS nguồn đầy đủ, không lọc theo các class chỉ xuất hiện trong ảnh chụp.
- Ngày lễ và ngày tiệc lấy độc lập; giờ lễ có tiền tố được cập nhật đúng. Khi đổi giờ khai tiệc trong editor, giờ đón khách và lịch trình dịch cùng khoảng thời gian đã cấu hình.
- Album, nút điều hướng và thumbnail theo số ảnh thực tế; không hiển thị album rỗng. Có điều hướng bàn phím và đóng hộp thoại.
- RSVP dùng dialog có focus và Escape; có trạng thái chọn/focus rõ ràng. Lời chúc hiển thị theo thứ tự API trả về.
- Lỗi tải stylesheet hiện thông báo thay vì để thiệp ẩn mãi.
- Nhập thêm hai stylesheet do component chèn từ bundle gốc, gồm keyframe mở thiệp và các hiệu ứng hộp quà. Bộ nhập phân tích AST, kiểm tra keyframe bắt buộc và lưu SHA-256 của bundle trong provenance; không chỉ lấy file CSS và `<style>` đã chụp.
- Khôi phục chuỗi mở thiệp `idle → opening → away → done`: dấu niêm tan và vòng sáng, 32 hạt bung, tấm thiệp bay đi; giữ bìa tới khi chuyển động kết thúc. Có âm thanh mở thiệp, chặn bấm lặp, hủy timer khi unmount và trả lại cuộn.
- Nhập cấu hình bìa trực tiếp từ module `90662` trong bundle `59526-668c753ae1999f5f.js`, giữ palette hạt gốc và hai `cardImages` có `flyOnOpen`. Tạo đủ hai lớp hoa phóng lớn/mờ dần ngay khi bắt đầu mở, giữ hướng lật và bố trí của từng bên; vòng sáng có viền 3px như nguồn. Các tùy chọn chuyển động chưa được hỗ trợ làm bộ nhập báo lỗi thay vì bị bỏ qua.
- Khôi phục chuyển động chờ, bóng, lấp lánh và gợi ý của hộp quà, phóng to/lắc khi hover hoặc focus bàn phím bằng CSS nguyên bản. Không thêm thời gian chờ trước khi mở hộp quà vì nguồn mở dialog ngay khi bấm.
- Bổ sung tự cuộn từ logic lớp ứng dụng nguồn: bắt đầu 2 giây sau mở, 50px/s; tạm dừng khi cuộn tay/chạm, nhập form hoặc click tương tác; click nền thiệp để dừng/chạy tiếp. Hook nằm riêng trong gói Minimalism, nhận diện sự kiện xuyên Shadow DOM, không chạy ở editor/reduced motion/chế độ chụp và dừng ở cuối trang.

## Kiểm tra tái lập

Từ thư mục `frontend`:

```powershell
npx tsc --noEmit
node scripts/test-template-packages.cjs
npm run dev
# Trong terminal khác, khi Next.js đã sẵn sàng:
node scripts/test-minimalism-browser.mjs
```

Script trình duyệt dùng Chrome headless trên Windows; có thể đặt `CHROME_PATH` và `FRONTEND_URL`. API được giả lập trong bộ nhớ và tài nguyên được đọc từ archive local. Script không tạo thiệp hoặc gửi RSVP lên backend thật.

Đã kiểm tra TypeScript, 6 bài kiểm tra package/binding/CSS chuyển động và luồng trình duyệt: 320/375/430/768/1280px không cuộn ngang, sửa tên/ngày/giờ → gửi schema → tải lại link, hai payload `ATTENDING/1` và `DECLINED/0`, album 0/1/2/9 ảnh, hộp quà 0/1/2 tài khoản. Ảnh và JSON kết quả nằm trong `extracted_templates/browser-check/minimalism-repair/` (thư mục archive không được Git theo dõi).

## Kiểm chứng lưu thật và chạy thật

Đã chạy Spring Boot tại `http://localhost:8080`, Next.js tại `http://localhost:3000`, PostgreSQL trong `wedding-postgres-dev` và MinIO trong `wedding-minio-dev`.

```powershell
node frontend/scripts/test-minimalism-browser.mjs --live
```

Chế độ `--live` không bật chặn/thay thế request. Script tạo thiệp thật từ form, mở lại link công khai, đọc lại bằng API backend, tải ảnh từ MinIO và gửi cả hai lựa chọn RSVP. Mỗi lần chạy tạo thêm một thiệp và hai phản hồi kiểm tra trong database.

Kết quả ngày 16/11/2026:

- Thiệp ID `9`, slug `nguyen-minh-quan-tran-ha-linh-2a147`, trạng thái `PUBLISHED`, renderer `minimalism-dark-red@2`.
- Link: `http://localhost:3000/t/nguyen-minh-quan-tran-ha-linh-2a147`.
- Dữ liệu kiểm tra: Nguyễn Minh Quân / Trần Hà Linh, ngày 29/02/2028, giờ tiệc 19:45.
- Ảnh tải thành công qua MinIO; không cuộn ngang ở 320/375/430/768/1280px; mở album và chuyển ảnh thành công.
- RSVP được đọc lại qua API và đối chiếu bằng SQL trong PostgreSQL: `ATTENDING/1` và `DECLINED/0`, ID phản hồi `6` và `7`.
- Không có exception JavaScript trong luồng kiểm tra. Ảnh và báo cáo: `extracted_templates/browser-check/minimalism-live/`.

Đã dừng tiến trình Next.js chạy trùng trên địa chỉ 127.0.0.1; giữ server tại localhost để tránh hai tiến trình ghi cùng cache `.next` gây lỗi route 404.

## Kiểm chứng chuyển động sau lỗi nghiệm thu

Lần kiểm tra trước chỉ chứng minh lưu dữ liệu và click tới trạng thái cuối; đã bỏ sót CSS-in-JS và các trạng thái trung gian nên kết luận hoàn tất khi đó không đủ bằng chứng.

```powershell
# Backend, frontend và replay gốc cổng 3100 đang chạy:
node frontend/scripts/test-minimalism-browser.mjs --motion
```

Script dùng thiệp thật trong báo cáo `--live` gần nhất hoặc `INVITATION_SLUG` được chỉ định, không chặn request và không tạo thêm bản ghi. So sánh bản replay, bản mẫu cùng nội dung demo và bản public tại 375/1280px:

- Ghi transform/opacity và trạng thái khoảng mỗi 30 ms; xác nhận chuyển động thực sự thay đổi, dấu niêm tan, một vòng sáng, 32 hạt và bìa bay đi rồi hoàn tất. Bấm hai lần liên tiếp vẫn chỉ chạy một chuỗi.
- Chụp ảnh chờ và các mốc 200/650/1050/1500 ms của cả hai phía.
- So toàn bộ tập hợp animation đang xuất hiện và số lượng từng loại ở pha đầu và pha bung hạt. Xác nhận đủ hai lớp hoa bay, transform/blur thực sự thay đổi; so asset, class bố trí, hướng lật, duration/easing/fill-mode, viền vòng sáng và gradient ánh sáng với nguồn. Kiểm tra cũ chỉ biết các lớp đã được liệt kê nên đã không bắt được việc thiếu `flyOnOpen`.
- Đo hộp quà tại hai thời điểm để xác nhận nổi; kiểm tra keyframe, duration/delay của trạng thái chờ, hover và focus bàn phím khớp nguồn; kiểm tra mở/đóng dialog.
- So sánh thời điểm bắt đầu bay và kết thúc bìa với nguồn bằng một lượt đo riêng không chụp ảnh, dung sai lấy mẫu 150 ms. Đây là dung sai kiểm tra thời gian, không phải ngưỡng ảnh diff. Lượt chụp ảnh và đọc nhiều computed style được tách ra để không làm sai phép đo timer.
- Reduced motion bỏ qua chuỗi mở, tắt chuyển động lặp và vẫn tới được nội dung.

Bằng chứng và báo cáo: `extracted_templates/browser-check/minimalism-motion/`. Bản mẫu dùng cùng tên/ngày demo để xem các khung hình tương ứng; bản public kiểm tra tiếp với tên/ngày cá nhân hóa. Báo cáo ghi trạng thái từng lần chạy để kết quả đạt cũ không che một lần chạy mới thất bại. Kết quả đối chiếu các lớp chuyển động và thông số CSS, không chứng nhận ảnh khớp từng pixel.

## Kiểm chứng tự cuộn

Kiểm tra tự cuộn tái lập bằng `node frontend/scripts/test-minimalism-browser.mjs --scroll`. Đã đối chiếu nguồn/demo/public: vị trí chưa đổi trước thời gian chờ, tốc độ khoảng 50px/s, wheel/focus/dialog làm dừng, click nền tiếp tục, có khoảng bảo vệ 400ms khi rời ô nhập và dừng tại cuối trang. Editor và reduced motion không tự cuộn. Báo cáo nằm tại `extracted_templates/browser-check/minimalism-scroll/report.json`; lượt này không tạo hay sửa bản ghi thiệp.

## Phạm vi chưa nghiệm thu

Chưa có ảnh diff toàn trang với cùng nội dung và ngưỡng được thống nhất, kiểm tra chạm/âm thanh trên điện thoại thật hoặc chứng minh thuật toán album/parallax trùng runtime nguồn. Không kết luận giữ nguyên 100% mọi hiệu ứng. Các địa chỉ localhost chỉ phục vụ trên máy đang chạy dự án; chưa triển khai hosting Internet.
