# 🔍 SRS / Specification Audit & Adversarial Critique Report

> **Mục đích:** Báo cáo thẩm định chuyên sâu của Senior BA & Solution Architect: Chỉ ra mâu thuẫn nội bộ (`CFL-xx`), lỗ hổng kỹ thuật (`OQ-xx`), và các rủi ro vận hành & tình huống biên (`RISK-xx` / `EDGE-xx`) kèm giải pháp đề xuất (`PROP-xx`) đã được User phê duyệt (`[Confirmed]`).

---

## 1. Executive Audit & Risk Summary

- **Tài liệu được thẩm định:** `docs/search/raw_requirement.md` (kết hợp đối chiếu `docs/search/Architecture.md` & `docs/search/Json_driven_UI.md`)
- **Mâu thuẫn nội bộ (`CFL`):** 01 điểm (đã giải quyết)
- **Lỗ hổng kỹ thuật hạ tầng (`OQ`):** 03 điểm (đã giải quyết)
- **Rủi ro Vận hành & Tình huống Biên (`RISK` / `EDGE`):** 02 điểm (đã giải quyết)
- **Đánh giá Khả thi Nghiệp vụ & Kiến trúc:** ✅ **Ready after Mitigation (Đạt chuẩn sau khi thống nhất các chốt chặn)**.

---

## 2. Internal Document Conflicts (`CFL-xx`)

| Conflict ID | Hạng mục xung đột | Mô tả mâu thuẫn & Nguồn đối chiếu | Mức độ | Đề xuất của BA (`PROP`) | Quyết định của User |
|:---|:---|:---|:---|:---|:---|
| `CFL-01` | **Phạm vi của Khối Lời Chúc (Wishes Block)** | `raw_requirement.md` mô tả là "Form và danh sách gửi lời chúc mừng", nhưng `Architecture.md` có trường `attendance` (RSVP). | Medium | `PROP-01`: Bổ sung lựa chọn Xác nhận tham dự (RSVP) gồm 2 trạng thái: "Sẽ tham dự" (`ATTENDING`) hoặc "Không thể đến" (`DECLINED`). | `[Confirmed]`: Tích hợp RSVP vào khối Wishes ngay tại MVP. |

---

## 3. Downstream Gaps & Missing Specifications (`OQ-xx`)

| Question ID | Hạng mục thiếu sót | Mô tả điểm thiếu sót kỹ thuật | Ảnh hưởng downstream | Phương án đề xuất (`PROP`) | Quyết định của User |
|:---|:---|:---|:---|:---|:---|
| `OQ-01` | **Cơ chế Xác thực & Quản lý Quyền Sửa Thiệp** | `raw_requirement.md` chưa quy định luồng Đăng ký / Đăng nhập, dẫn đến nguy cơ sửa trộm thiệp nếu ai đó có ID thiệp. | ADD / Security / User Service | `PROP-02`: Xây dựng module Tài khoản người dùng cơ bản với Đăng ký / Đăng nhập (JWT) ngay từ MVP để gắn kết danh sách thiệp (`user_id NOT NULL`). | `[Confirmed]`: Xây dựng hệ thống Tài khoản đầy đủ (Auth JWT) trong MVP. |
| `OQ-02` | **Tính Bất Biến của Slug khi Sửa Thiệp** | Khi người tạo sửa lại thiệp đã xuất bản, chưa rõ slug có bị đổi làm hỏng link khách đang mở không. | Public API & SEO / Sharing | `PROP-03`: `slug` được sinh duy nhất 1 lần khi xuất bản lần đầu và **CỐ ĐỊNH VĨNH VIỄN**. Khi sửa chỉ cập nhật `content_schema` và `updated_at`. | `[Confirmed]`: Giữ nguyên slug duy nhất vĩnh viễn khi sửa đổi. |
| `OQ-03` | **Phương thức Khởi tạo Mẫu Thiệp Mặc Định** | Cần 2–3 mẫu JSON mẫu trong DB khi hệ thống mới cài đặt. | Database Seeding / Migration | `PROP-04`: Tự động nạp sẵn 3 mẫu JSON vào bảng `templates` qua `CommandLineRunner` hoặc migration SQL khi khởi chạy. | `[Confirmed]`: Auto-seed 3 mẫu JSON chuẩn khi boot backend. |

---

## 4. Adversarial Critique & Business Edge Cases (`RISK-xx` / `EDGE-xx`)

| Risk ID | Phân loại | Tình huống rủi ro / Bẫy nghiệp vụ thực tế | Hậu quả nếu không xử lý | Giải pháp Kiến trúc Đề xuất (`PROP`) | Độ phức tạp | Phân kỳ | Quyết định User |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `RISK-01` | Fraud / Spam | Bot hoặc người xấu spam hàng vạn lời chúc rác, thô tục vào thiệp public `/t/{slug}`. | Phá hỏng ngày cưới/sự kiện của người dùng, quá tải DB. | `PROP-05`: Giới hạn ký tự (`sender_name <= 50`, `message <= 500`), Rate limit IP (5 requests/phút/IP), và cấp nút **Xóa lời chúc rác** cho chủ thiệp trong Editor. | Medium | MVP (Lean) | `[Confirmed]`: Triển khai đầy đủ Rate limit + Giới hạn ký tự + Quyền xóa lời chúc cho chủ thiệp. |
| `EDGE-01` | Technical Edge Case | Người dùng dán link ảnh chết (404), ảnh chặn hotlink, hoặc dán chuỗi Base64 dài hàng chục MB vào ô input. | Vỡ layout thiệp, làm phình to DB JSONB gây treo hệ thống. | `PROP-06`: Frontend kiểm tra định dạng URL (`http://` hoặc `https://`), cấm chuỗi `data:image/` (Base64), và fallback ảnh mặc định trang nhã khi ảnh bị lỗi tải (`onError`). | Low | MVP (Lean) | `[Confirmed]`: Chặn Base64 và có cơ chế ảnh placeholder mặc định khi URL lỗi. |

---

## 5. Architectural & Business Mitigation Recommendations (`PROP-xx`)

1. **`PROP-01` (RSVP Integration in Wishes Block):**
   - Form gửi lời chúc gồm: `sender_name` (bắt buộc), `attendance` (bắt buộc: `ATTENDING` hoặc `DECLINED`), `message` (tùy chọn hoặc tối đa 500 ký tự).
   - Danh sách lời chúc hiển thị kèm huy hiệu trạng thái tham dự.
   - *Complexity: Low | Phase: MVP.*

2. **`PROP-02` (User Authentication with Spring Security + JWT):**
   - Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`.
   - Bảng `users` lưu `id`, `email`, `password_hash`, `full_name`, `created_at`.
   - API tạo và sửa thiệp yêu cầu Bearer JWT, kiểm tra `user_id` khớp với chủ sở hữu thiệp.
   - *Complexity: Medium | Phase: MVP.*

3. **`PROP-03` (Immutable Slug Lifecycle):**
   - `slug` sinh ngẫu nhiên dạng chuỗi ngắn thân thiện (ví dụ: `dam-cuoi-minh-lan-a8f2`), lưu trong bảng `invitations`.
   - Các lần cập nhật schema (`PUT /api/v1/invitations/{id}`) tuyệt đối không thay đổi `slug`.
   - *Complexity: Low | Phase: MVP.*

4. **`PROP-04` (Template Data Seeding):**
   - Chuẩn bị 3 template JSON hoàn chỉnh: *Mẫu Cưới Tinh Tế (Minimalist Wedding)*, *Mẫu Cưới Cổ Điển (Vintage Floral)*, *Mẫu Tiệc Sinh Nhật (Birthday Modern)*.
   - Nạp vào bảng `templates` khi boot backend nếu bảng rỗng.
   - *Complexity: Low | Phase: MVP.*

5. **`PROP-05` (Spam Protection & Moderation):**
   - DTO Validation: `@Size(max = 50)` cho tên người gửi, `@Size(max = 500)` cho lời chúc.
   - Backend Rate Limiter / Bucket4j hoặc kiểm tra tần suất theo IP.
   - Endpoint: `DELETE /api/v1/invitations/{id}/wishes/{wishId}` dành riêng cho chủ sở hữu thiệp.
   - *Complexity: Medium | Phase: MVP.*

6. **`PROP-06` (Safe Image URL Handling):**
   - Regex kiểm tra URL ảnh: `^https?://.*`. Báo lỗi nếu người dùng dán chuỗi Base64.
   - Component `HeroBlock` có hàm fallback ảnh placeholder nội bộ khi kích hoạt sự kiện `onError`.
   - *Complexity: Low | Phase: MVP.*
