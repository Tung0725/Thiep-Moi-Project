# Báo cáo đối chiếu tài liệu với mã nguồn

> Baseline `679cc41`, đối chiếu ngày 21/11/2026. Phạm vi gồm [BRD](BRD.md), [PRD](PRD.md), [Event Storming](Event_Storming.md), [ADD](ADD.md) và [Backlog](BACKLOG.md). [Scenario](scenario.md), [Fact Register](source_facts.md) và [Audit](audit_report.md) là nguồn quyết định MVP.

## 1. Các thay đổi đã đối chiếu

| Chủ đề | Kết quả đối chiếu | Truy vết và nguồn |
|---|---|---|
| Phạm vi tạo thiệp | Ba mẫu seed hiện là mẫu cưới. Quick Create chấp nhận khách vãng lai, lưu `PUBLISHED` và cấp slug khi tạo. Quản lý bản nháp, sửa thiệp đã lưu và chuyển sang `ARCHIVED` còn trong backlog. | `CAP-02`, `FR-08`, `API-12`, `TASK-07`. [InvitationService](../backend/src/main/java/com/wedding/invitation/service/InvitationService.java) |
| Tương thích renderer | Phiên bản được ghim trong snapshot; schema cũ đi qua adapter. Registry có bốn binding trên ba package. | `FR-07`, `ADR-04`, `TASK-05`. [Registry](../frontend/src/templates/registry.ts) |
| Lưu trữ | Entity dùng `TEXT` cho schema JSON, khác thiết kế JSONB ban đầu. Media mẫu đi qua MinIO. | `FACT-TECH-03`, `ADR-02`, `ADR-05`, `ADR-06`. [Invitation entity](../backend/src/main/java/com/wedding/invitation/entity/Invitation.java), [Next config](../frontend/next.config.mjs) |
| RSVP và lời chúc | API đọc và ghi công khai theo slug. Backend nhận ba trạng thái và tên tối đa 100 ký tự. Quyết định MVP ghi hai trạng thái và 50 ký tự. Song Hỷ Xanh dùng `MAYBE` cho form lời chúc riêng. | `BR-04`, `BR-05`, `PROP-01`, `PROP-05`, `API-09`, `API-13`. [DTO](../backend/src/main/java/com/wedding/wish/dto/request/SubmitWishRequest.java), [Song Hỷ adapter](../frontend/src/services/songHySourceService.ts) |
| Quyền truy cập | Quản lý thiệp và phản hồi theo chủ sở hữu còn trong backlog. API ghi mẫu hiện công khai. Quyền ghi cần được chốt trước khi áp dụng phân quyền Studio. | `BR-01`, `FR-11`, `FR-13`, `TASK-07`, `TASK-10`, `TASK-16`. [SecurityConfig](../backend/src/main/java/com/wedding/config/SecurityConfig.java) |
| Chia sẻ | Trang thiệp tải schema ở client và hỗ trợ sao chép link. Metadata OpenGraph theo slug còn trong backlog. | `FR-09`, `FR-12`, `TASK-08`. [Trang thiệp](../frontend/src/app/t/%5Bslug%5D/page.tsx) |
| Quy tắc dữ liệu và vận hành | Rate limit sổ lưu bút, giới hạn schema và kiểm soát ảnh Base64 vẫn cần triển khai hoặc kiểm chứng. Các mục tiêu hiệu năng và uptime cần số đo trên môi trường phù hợp. | `BR-03`, `BR-04`, `NFR-SEC-04`, `NFR-SCAL-01`, `TASK-09`, `TASK-17`. [PRD](PRD.md#4-yêu-cầu-phi-chức-năng), [Backlog](BACKLOG.md) |

## 2. Kiểm tra và phạm vi kết luận

| Kiểm tra | Kết quả | Phạm vi |
|---|---|---|
| ID và liên kết nhiệm vụ | 178 định nghĩa, 0 lỗi. 13/13 FR và 20/20 API có liên kết task, gồm các hợp đồng dự kiến | `validate-ids.mjs docs` kiểm tra Scenario, Fact Register, Audit, BRD, PRD, Event Storming, ADD và Backlog |
| Mermaid | 3 khối, 0 lỗi fence | `lint-mermaid.mjs docs` kiểm tra cấu trúc Markdown. Chưa kiểm tra cú pháp render |
| Frontend TypeScript | Đạt | `tsc --noEmit --incremental false` |
| Package mẫu | 8/8 đạt | `node scripts/test-template-packages.cjs` trong `frontend` |
| Backend | 31/31 đạt, 0 thất bại, 0 bỏ qua | Maven test offline từ cache trên máy. Bao gồm auth, JWT và lời chúc |

Các kết quả trên xác nhận phạm vi của từng lệnh. Lượt đối chiếu này chưa chạy browser E2E, kiểm thử tải hoặc xác minh trên môi trường triển khai. Bằng chứng tích hợp trước đó nằm tại [Song Hỷ Xanh](templete/song-hy-xanh-integration.md) và [Minimalism](templete/minimalism-repair-verification.md).

## 3. Các quyết định còn mở

- **Sản phẩm và Backend** cần chốt cách nhận quyền với thiệp tạo ẩn danh và hành vi link theo trạng thái trước khi phát triển quản lý thiệp. [Task vòng đời thiệp](BACKLOG.md#task-07-vòng-đời-thiệp-do-chủ-sở-hữu-quản-lý)
- **Sản phẩm và Backend** cần chốt quyền ghi Studio, giới hạn tên khách và phạm vi giữ hành vi RSVP hiện tại trước khi áp dụng kiểm soát theo các quyết định MVP. [PRD](PRD.md#5-câu-hỏi-mở), [BRD](BRD.md#6-business-rules-br-xx---quy-tắc-nghiệp-vụ)
- **Sản phẩm** cần chốt cột và encoding CSV trước khi phát triển báo cáo cho chủ thiệp. [Task CSV](BACKLOG.md#task-10-quản-lý-phản-hồi-và-xuất-csv)
