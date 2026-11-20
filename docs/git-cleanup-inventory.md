# Danh mục Git và tệp local để dọn

Snapshot ngày 16/11/2026. Chỉ sửa `.gitignore` và tạo danh mục; không xóa, di chuyển, stage hoặc commit tệp. Dung lượng cache có thể thay đổi khi dịch vụ vẫn chạy.

## Những phần giữ trong Git

- Mã nguồn backend/frontend, các package HB04/Đỏ Đậm/Song Hỷ Xanh, JSON seed và CSS/font declarations cần để build.
- `frontend/scripts/`: công cụ nhập mẫu và kiểm thử được duy trì.
- `tools/`: extractor Python, runner Windows, requirements, importer/replay MinIO, converter và README. Đã bỏ quy tắc ignore toàn bộ `tools/`.
- `extracted_templates/capture-trees.mjs` và `capture-blueprint.mjs`: hai công cụ lấy cây/nội dung nguồn dùng lại khi khảo sát mẫu; tạo ngoại lệ Git riêng, không di chuyển tệp.
- Tài liệu trong `docs/`, `PRODUCT.md`, file cấu hình dự án, lockfile và `.env.example`.

Đã thêm ignore cho cache Python, môi trường Python local và thư mục danh mục `.local-inventory/`. Archive thô, profile trình duyệt, ảnh kiểm chứng và build/dependency cache vẫn ngoài Git.

## Danh sách đầy đủ ngoài Git

- [ignored-files.csv](../.local-inventory/ignored-files.csv): từng tệp bị ignore, kích thước, nhóm và hướng xử lý; snapshot có **19.027 tệp**.
- [cleanup-summary.csv](../.local-inventory/cleanup-summary.csv): tổng hợp theo thư mục và nhóm để chọn phần muốn dọn.
- [untracked-source-files.csv](../.local-inventory/untracked-source-files.csv): tệp mới được Git nhìn thấy, cần giữ/review để commit, không phải danh sách rác.
- [git-status.txt](../.local-inventory/git-status.txt): trạng thái Git khi kết thúc rà soát, gồm các thay đổi/xóa đã có từ trước.

CSV chỉ ghi tên và kích thước, không đọc nội dung `.env` hay xuất thông tin đăng nhập. Bản thân `.local-inventory/` bị ignore và không nằm trong snapshot liệt kê chính nó.

## Có thể dọn trước

| Đường dẫn | Dung lượng xấp xỉ | Điều kiện |
| --- | ---: | --- |
| `extracted_templates/browser-debug/` | 532,56 MiB | Đóng trình duyệt debug dùng profile này |
| `extracted_templates/song-hy-xanh/browser-profile/` | 223,46 MiB | Đóng Chrome headless/CDP 9224 |
| Các mục `REMOVE_CACHE_AFTER_STOP` còn lại trong CSV | 12,78 MiB | Đóng tiến trình đang giữ profile/log; xóa đúng đường dẫn được liệt kê |
| `frontend/.next/` | 358,93 MiB | Dừng FE trước; Next.js tạo lại khi chạy/build |
| `frontend/node_modules/` | 302,83 MiB | Có thể cài lại bằng `npm ci` trong `frontend/`; giữ nếu còn phát triển ngay |
| `backend/target/` | 0,64 MiB | Dừng BE trước; Maven biên dịch lại |
| `tools/__pycache__/`, `*.pyc`, `*.tsbuildinfo` | Nhỏ | Cache có thể tạo lại |

Hai nhóm `REMOVE_REGENERATABLE` và `REMOVE_CACHE_AFTER_STOP` tổng cộng khoảng **1,40 GiB**. Dọn chúng không thay thế việc sao lưu tài nguyên MinIO hoặc dữ liệu PostgreSQL.

## Tệp khảo sát có thể bỏ sau khi xem lại

Nhóm `REVIEW_DEBUG_ARTIFACT` gồm 53 tệp, khoảng 15,48 MiB: các `module-*.js`, `readable-*.js`, `modules-index.json` của Song Hỷ Xanh; DOM dump, ảnh thử và `local-metrics*`/`reference-metrics*` cũ ở gốc `extracted_templates/`. Chúng không dùng để khởi động ứng dụng; giữ nếu còn muốn điều tra lại phiên khảo sát.

Nhóm `REVIEW_ADHOC_SCRIPT` gồm tám script thủ công cũ:

- `extracted_templates/compare-1280.mjs`
- `extracted_templates/compare-375.mjs`
- `extracted_templates/compare-original.mjs`
- `extracted_templates/native-smoke.mjs`
- `extracted_templates/package-preview.mjs`
- `extracted_templates/package-smoke.mjs`
- `extracted_templates/test-original-v2.mjs`
- `extracted_templates/song-hy-xanh/browser.mjs`

Các kiểm thử chính hiện nằm trong `frontend/scripts/`; những script trên vẫn có thể hữu ích khi cần lặp lại phép đo cũ.

## Giữ lại hoặc sao lưu trước khi xóa

- `.env`, `frontend/.env.local` và `.agents/`: cấu hình local/skill đang dùng, không phải rác chỉ vì bị ignore.
- `my-archiving-session/` (14,45 MiB): archive gốc Song Hỷ Xanh. Đã có bản trong MinIO ở `templates/song-hy-xanh/archive/original/`; chỉ bỏ bản local sau khi đã có bản sao lưu/khôi phục được. Việc trích xuất lại từ đường dẫn hiện tại cần thư mục này.
- `web_cloned/` (23,80 MiB): clone nguồn HB04. Chưa xác minh toàn bộ clone gốc đã được sao lưu vào MinIO, nên giữ hoặc nén ra nơi khác.
- Nhóm `KEEP_IMPORT_INPUT`: archive tài nguyên và metadata local mà các công cụ import/replay/kiểm tra tham chiếu vẫn đọc. Có thể chạy ứng dụng bằng package đã đưa vào Git và tài nguyên MinIO mà không cần các bản local này, nhưng không thể chạy lại nguyên lệnh nhập nếu thiếu đầu vào.
- Riêng Đỏ Đậm, giữ `open-tree.json`, `cover-tree.json`, `gift-body-tree.json`, `rsvp-body-tree.json`, `inline-styles.json`, `manifest.json` và các CSS/JS nguồn trong `extracted_templates/`. Bộ nhập đọc trực tiếp các tệp này; chưa xác minh có bản sao của toàn bộ cây DOM trong MinIO.
- Nhóm `KEEP_VERIFICATION` (126 tệp, khoảng 45,21 MiB): báo cáo/ảnh nghiệm thu và hồi quy. Nên giữ lượt đạt cuối hoặc sao lưu ra ngoài dự án.

Không xóa nguyên thư mục `extracted_templates/`: bên trong có hai script được giữ trong Git, đầu vào nhập mẫu và bằng chứng kiểm chứng. `extracted_templates/browser-check/` cũng chứa cả profile lẫn báo cáo; chỉ chọn các hàng có nhãn dọn cache.

Ảnh/nhạc thật của thiệp và dữ liệu thiệp đã xuất bản còn phụ thuộc MinIO/PostgreSQL trong Docker volumes, không nằm trong các CSV local này. Giữ dữ liệu các volume để các link đang có vẫn hoạt động.
