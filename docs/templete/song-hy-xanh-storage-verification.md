# Nhập kho Song Hỷ Xanh

Kho đích: `wedding-media/templates/song-hy-xanh/archive/`, dùng MinIO theo cấu hình `STORAGE_*` của dự án.

Đã lưu và tải ngược kiểm tra SHA-256 cho 147 tệp, gồm:

- 135 tài nguyên: 35 ảnh, 1 âm thanh, 14 font, 13 JSON, 2 HTML, 4 CSS, 66 JavaScript.
- 7 tệp dữ liệu, báo cáo và kiểm chứng trích xuất.
- 5 tệp nguyên bản trong `original/`: WARC, CDX, pages JSONL, datapackage và digest.

Lưu thêm `storage-verification.json` vào MinIO và local; chính báo cáo này cũng đã được tải lại đối chiếu SHA-256. Báo cáo liệt kê object key, số byte và SHA-256 của từng tệp.

## Bằng chứng

- `extracted_templates/song-hy-xanh/extraction-verification.json`: 135 tài nguyên khớp từng byte với phản hồi WARC tương ứng; toàn bộ props thiệp khớp bản gốc trong Flight/RSC.
- `extracted_templates/song-hy-xanh/storage-verification.json`: toàn bộ 147 tệp khớp SHA-256 sau khi tải lại từ MinIO.
- `extracted_templates/song-hy-xanh/invitation_source.json`: dữ liệu gốc đầy đủ, không sửa các giá trị mâu thuẫn.
- `extracted_templates/song-hy-xanh/extraction-notes.md`: kiểm kê và giới hạn của bản nguồn tại thời điểm trích xuất.

## Phạm vi kết luận 1:1

Đạt đối với dữ liệu và byte tài nguyên đã lưu. Bản WARC gốc được giữ để bảo toàn cả dữ liệu không đưa vào danh mục tài nguyên đã lọc.

Thiệp chọn nhạc `romantic-015` (Một Đời), nhưng WARC chỉ chứa `le-duong.mp3`. Không thay bài và không tải thêm. Giữ nguyên chênh lệch giờ tiệc/lịch trình, `ceremonyDate` cũ và tên địa điểm bản đồ; chi tiết có trong ghi chú trích xuất.

Chưa tích hợp package Song Hỷ Xanh vào danh mục/editor, chưa tạo record template trong database và chưa nghiệm thu giao diện, chuyển động hoặc tương tác bằng trình duyệt. Việc giống bố cục Đỏ Đậm không được dùng làm bằng chứng hai mẫu có cùng runtime.

Lệnh nhập có thể chạy lại an toàn; các object có hash khác sẽ bị từ chối ghi đè:

```powershell
node tools/preview_extracted.mjs --import --source extracted_templates/song-hy-xanh --template song-hy-xanh --package my-archiving-session
```

## Nhạc thay thế đã được người dùng chấp thuận

Đã thêm `playback-data.json` dùng **Lễ Đường – Kai Đinh** (`romantic-013`), với object key và SHA-256 của âm thanh sẵn có. File chứa props và metadata dành cho bản phát có thay nhạc; các file nguồn vẫn giữ nguyên. Đã nhập lại kho, xác minh 148 tệp và báo cáo kiểm chứng.

Bản xem thử có thể bật cấu hình thay nhạc mà không sửa HTML/RSC trong kho:

```powershell
$env:ARCHIVE_PREVIEW_PORT = '3101'
node tools/preview_extracted.mjs --serve --playback --source extracted_templates/song-hy-xanh --template song-hy-xanh
```

Đã kiểm tra URL nhạc gốc qua server playback trả HTTP 200 và nội dung khớp SHA-256 của `le-duong.mp3`. Đây là thay đổi nhạc có chủ đích, không phải kết luận nhạc giống nguồn 1:1.
