# 🛠️ Bộ Công Cụ Trích Xuất Dữ Liệu Thiệp Cưới (Wedding Template Extractor)

## Lưu nguyên bản mẫu Song Hỷ Xanh vào MinIO

```powershell
node tools/preview_extracted.mjs --import --source extracted_templates/song-hy-xanh --template song-hy-xanh --package my-archiving-session
```

Lưu tài nguyên và metadata vào `wedding-media/templates/song-hy-xanh/archive/`.
Thư mục `original/` giữ cả WARC, chỉ mục, nội dung trang và datapackage gốc.
Trước khi nhập, công cụ kiểm tra hash của datapackage; sau khi nhập, tải lại từng tệp
để đối chiếu SHA-256. Nếu object đã tồn tại với nội dung khác, dừng thay vì ghi đè.
Kết quả nằm trong `storage-verification.json` ở cả local và MinIO.
Các tùy chọn mới không thay đổi đường dẫn mặc định của Minimalism Đỏ Đậm.

Có thể xem bản replay bằng lệnh dưới đây; replay không thay thế kiểm tra giao diện,
hiệu ứng, cá nhân hóa và API thật khi tích hợp mẫu vào ứng dụng:

```powershell
$env:ARCHIVE_PREVIEW_PORT = '3101'
node tools/preview_extracted.mjs --serve --source extracted_templates/song-hy-xanh --template song-hy-xanh
```

Mở `http://localhost:3101/vi/mau-thiep/song-hy-xanh/demo`.
Nguồn hiện thiếu `mot-doi.mp3`; không tự dùng bài nhạc khác để thay thế.

## Xem thử bản gốc đã trích xuất

Yêu cầu Node.js 20+ và cấu hình `STORAGE_*` trong `.env` ở thư mục gốc. Chạy từ thư mục gốc dự án:

```powershell
docker compose -f docker-compose.dev.yml up -d
node tools/preview_extracted.mjs --import --serve
```

Script lưu 131 tài nguyên từ manifest cùng metadata vào
`wedding-media/templates/minimalism-do-dam/archive/`, kiểm tra SHA-256 sau mỗi lần tải lên,
và phục vụ bản chụp từ MinIO tại <http://localhost:3100/vi/mau-thiep/minimalism-do-dam/demo>.
Thông tin đăng nhập chỉ được đọc từ môi trường hoặc `.env`, không gửi xuống trình duyệt.

Các lần xem tiếp theo chỉ cần `node tools/preview_extracted.mjs --serve`.
Có thể đổi cổng bằng biến môi trường `ARCHIVE_PREVIEW_PORT`.

Đây là bản phát lại HTML/CSS/JS gốc để so sánh giao diện, chưa tạo record `templates`
hay chuyển đổi sang `PageSchema` của trình chỉnh sửa. Các API được ghi lại trả dữ liệu
bản chụp; RSVP, lời chúc và các dịch vụ ngoài chưa được nối vào backend local.
Tài nguyên không có trong bản trích xuất trả HTTP 404.

Bộ công cụ chuyên dụng dùng để giải nén, lọc sạch và cấu trúc hóa các tài nguyên thiệp cưới từ file web archive (`.warc`, `.warc.gz`, `.wacz` hoặc thư mục tải từ Webrecorder / ArchiveWeb.page như `my-archiving-session`).

---

## 📁 Cấu Trúc Thư Mục `tools/`

```text
tools/
├── extract_template.py    # Script Python xử lý chính (phân loại, lọc tracker, bóc tách metadata)
├── extract.bat            # File chạy nhanh trên Windows (Command Prompt)
├── extract.ps1            # File chạy PowerShell
├── requirements.txt       # Danh sách thư viện phụ thuộc (warcio, wacz)
└── README.md              # Tài liệu hướng dẫn sử dụng
```

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Cài đặt thư viện phụ thuộc (chỉ cần chạy lần đầu)
```powershell
py -m pip install -r tools/requirements.txt
```

### 2. Chạy trích xuất mẫu thiệp
Bạn có thể trích xuất trực tiếp bằng nhiều cách:

#### Cách 1: Sử dụng PowerShell
```powershell
# Trích xuất thư mục my-archiving-session ra thư mục extracted_templates
.\tools\extract.ps1 -Source "my-archiving-session" -Output "extracted_templates"

# Hoặc trích xuất kèm cấu trúc mirror domain URL gốc
.\tools\extract.ps1 -Source "my-archiving-session" -Output "extracted_templates" -Mirror
```

#### Cách 2: Sử dụng CMD / Batch
```cmd
tools\extract.bat my-archiving-session extracted_templates
```

#### Cách 3: Chạy trực tiếp qua Python
```powershell
py tools/extract_template.py "my-archiving-session" -o "extracted_templates"
```

---

## 📦 Cấu Trúc Dữ Liệu Đầu Ra Sau Khi Giải Nén

Khi chạy xong, thư mục đầu ra (ví dụ `extracted_templates/`) sẽ được tổ chức ngăn nắp:

```text
extracted_templates/
├── images/                   # Hình ảnh mẫu thiệp (.webp, .png, .jpg, .svg)
├── audio/                    # File nhạc nền thiệp (.mp3, .wav)
├── fonts/                    # Phông chữ thiệp cưới (.woff2, .woff, .ttf)
├── data/                     # Dữ liệu JSON API (thông tin thiệp, bài hát)
├── pages/                    # File HTML trang mẫu demo
├── styles/                   # Mã CSS giao diện
├── scripts/                  # Mã Javascript
├── wedding_template_data.json # Thông tin chi tiết thiệp (cô dâu chú rể, ngày giờ, địa điểm, nhạc)
├── manifest.json             # Danh mục toàn bộ URL gốc, mã HTTP, kích thước, đường dẫn file
└── summary.md                # Báo cáo tổng kết số lượng tài nguyên
```

---

## 🔄 Quy Trình Đưa Dữ Liệu Mẫu Mới Vào Hệ Thống (MinIO + Database)

1. **Chạy giải nén:** Chạy `.\tools\extract.ps1` để lấy các tệp trong `images/`, `audio/`, `fonts/`.
2. **Tải lên MinIO:** Đẩy thư mục hình ảnh và âm thanh vào MinIO bucket `wedding-media/templates/<template_code>/`.
3. **Cập nhật Database:** Sử dụng schema trong `wedding_template_data.json` và thay thế các URL tài nguyên bằng đường dẫn MinIO (`http://localhost:9000/wedding-media/templates/...`) để tạo template mới trong bảng `templates`.
