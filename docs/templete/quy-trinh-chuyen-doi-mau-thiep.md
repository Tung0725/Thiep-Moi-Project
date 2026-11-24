# Quy trình nhập mẫu thiệp: giữ giao diện, hiệu ứng và dữ liệu tùy biến

## 1. Quyết định chính

Để chuyển nhanh và chính xác, phải **giữ phần triển khai giao diện và hiệu ứng đang chạy đúng, chỉ thay đầu vào dữ liệu và đầu nối dịch vụ**. Không dựng lại giao diện từ ảnh chụp, không coi DOM chụp ở một thời điểm là toàn bộ ứng dụng.

Next.js làm nền tảng quản lý, biên tập và xuất bản. JSON lưu nội dung và cấu hình của từng thiệp. Mỗi gói mẫu sở hữu cấu trúc trình bày, CSS, tài nguyên và logic hiệu ứng riêng.

Có hai đường nhập mẫu; chọn theo nguồn thực tế, không ép tất cả vào cùng một bộ chuyển đổi:

| Nguồn có được | Đường nhập ưu tiên | Giới hạn phải công khai |
| --- | --- | --- |
| Mã nguồn component, CSS và dependencies | Chuyển nguyên component và logic hiệu ứng vào gói mẫu, sau đó nối dữ liệu | Vẫn phải kiểm tra khác biệt môi trường, CSS, thư viện và vòng đời component |
| Website đã build, bản tải HTML/CSS/JS đang replay đúng | Đóng gói runtime nguyên bản thành một ứng dụng mẫu độc lập; dùng adapter dữ liệu nếu tìm được đầu vào ổn định | Replay đúng dữ liệu mặc định chưa chứng minh có thể tùy biến mọi trường |
| Chỉ có HTML hoặc DOM và tài nguyên rời | Phục dựng có kiểm chứng | Không cam kết tự động lấy đủ hiệu ứng và trạng thái đã mất |

**Không có bước “đổi src rồi bảo đảm 100%” cho mọi website đã build.** Muốn giữ toàn bộ hiệu ứng thì phải giữ được đoạn chương trình tạo hiệu ứng, dependency và điều kiện kích hoạt của nó. Nếu bỏ chương trình gốc rồi viết lại, đó là công việc tái triển khai.

Quy trình dưới đây là điều kiện nghiệm thu bắt buộc cho các lần nhập và sửa mẫu. Minimalism đã có một phần công cụ nhập và kiểm tra; chưa có bộ chuyển đổi tổng quát cho mọi mẫu. Việc dùng iframe hoặc thay hợp đồng schema cần được thống nhất trước khi thực hiện.

## 2. Vì sao đường chuyển đổi vừa rồi bị chậm và sót

Luồng ban đầu dựng lại thiệp bằng các block riêng của dự án nên thay đổi DOM, CSS và hành vi. Luồng tiếp theo giữ cây DOM đã render và CSS, nhưng vẫn viết lại tương tác bằng suy đoán từ cây DOM đó.

Các điểm yếu đã xác định trong các lần chuyển đổi:

- `frontend/scripts/import-minimalism-layout.cjs` chia section bằng vị trí `parts[2]`, `parts[3]`… nên phụ thuộc cấu trúc đúng của bản chụp.
- Bộ nhập từng xóa thuộc tính `value` của input, khiến cả hai lựa chọn RSVP bị hiểu là từ chối. Đã sửa việc giữ `yes/no`, thêm kiểm tra hợp đồng và đối chiếu dữ liệu PostgreSQL.
- `originalBindings.ts` từng thay tên và ngày giờ bằng chuỗi mẫu. Các trường tên, gia đình, ngày/giờ, địa điểm, lịch trình và tài khoản đã có khóa binding; không dùng việc sửa CSS để che dữ liệu sai.
- Bộ lọc CSS từng chỉ biết class xuất hiện trong bản chụp. Đã giữ toàn bộ stylesheet biên dịch, nhưng riêng việc này vẫn chưa đủ: CSS được component chèn lúc chạy có thể chỉ tồn tại dưới dạng chuỗi trong bundle.
- **Mất hiệu ứng mở thiệp và hộp quà:** bản chụp chỉ lưu trạng thái đứng yên; bộ nhập bỏ sót hai stylesheet `styled-jsx` nằm trong bundle. Renderer còn thay ngay trang bìa bằng nội dung khi click, bỏ qua state machine `idle → opening → away → done`. Đây là lỗi nhập chương trình và vòng đời trạng thái, không phải lỗi tài nguyên ảnh hay lỗi lưu database.
- **Vẫn thiếu chi tiết sau khi thêm keyframe:** hai lớp hoa `flyOnOpen` chỉ được tạo khi đang mở nên không có trong cây DOM chờ. Cấu hình trong module `90662` khai báo hai lớp này, nhưng lần sửa trước chỉ nối các hiệu ứng đã được biết tên. Vì vậy phải đọc cả cấu hình theo mẫu và các nhánh render có điều kiện; có đủ file CSS, keyframe và hiệu ứng chính vẫn chưa chứng minh đủ các lớp.
- **Bỏ sót tự cuộn:** logic này nằm ở `InvitationRenderer` bên ngoài component mẫu, trong module `82730` của `60193-5e71a53cd1a8947b.js`. Chỉ kiểm kê component Minimalism và CSS của nó sẽ không tìm đủ hành vi. Phải kiểm kê cả các lớp cha điều khiển mở thiệp, cuộn, âm thanh, lịch sử trang và tương tác toàn cục.
- Renderer album dựa trên các tư thế ảnh của bản chụp, chưa thể coi là giữ nguyên thuật toán album gốc với mọi số lượng ảnh.
- Kiểm tra giao diện với dữ liệu mặc định không phát hiện hết lỗi tùy biến, gửi form hoặc dữ liệu sau khi tải lại.
- Các kiểm tra cũ chỉ click rồi xác nhận trạng thái cuối. Modal mở được và API lưu thành công không chứng minh animation đã chạy; báo cáo thiếu bằng chứng trung gian phải ghi **chưa đạt**, không gọi là hoàn tất.

Giữ Shadow DOM giúp cách ly phần lớn CSS. Nó không khôi phục JavaScript đã bỏ, dữ liệu đã xóa hoặc hành vi chưa được ghi nhận.

## 3. Ranh giới kiến trúc

```text
Next.js: danh mục → editor → lưu JSON → xuất bản
                                  │
                     chọn package id + version
                                  │
                       adapter dữ liệu của mẫu
                                  │
             runtime hoặc component riêng của mẫu
                 ├── DOM, CSS, font, tài nguyên
                 ├── hiệu ứng, album, âm thanh
                 └── adapter RSVP / lời chúc / bản đồ
```

### Phần dùng chung

Lưu trữ, upload, xác thực, quyền sở hữu, xuất bản, API lời chúc và RSVP, kiểm tra dữ liệu, công cụ so sánh và giao thức editor–preview.

### Phần thuộc từng mẫu

Bố cục, breakpoint, typography, mở phong bì, animation, parallax, slider, modal, cách bố trí form, danh sách section và quy tắc ẩn/hiện/sắp xếp.

Một mẫu có thể gộp thông tin gia đình và lễ cưới trong một section; mẫu khác tách riêng. Không bắt hai mẫu có cùng cây DOM chỉ vì cùng dùng dữ liệu gia đình và sự kiện.

### JSON lưu gì?

JSON lưu nội dung có ý nghĩa: người, sự kiện, ảnh, tài khoản, section đang bật và tùy chọn mẫu hỗ trợ. Không bắt JSON mô tả lại mọi thẻ HTML, keyframe hoặc thuật toán slider.

Ví dụ định hướng, **chưa thay thế API hiện tại**:

```json
{
  "template": { "id": "minimalism-do-dam", "version": 3 },
  "dataVersion": 1,
  "content": {
    "couple": {
      "groom": { "name": "Nguyễn Minh Quân" },
      "bride": { "name": "Trần Hà Linh" }
    },
    "gallery": { "images": [] }
  },
  "sections": [
    { "id": "opening", "enabled": true },
    { "id": "family-ceremony", "enabled": true },
    { "id": "gallery", "enabled": false }
  ],
  "options": { "musicEnabled": true }
}
```

Package phải khai báo section bắt buộc, section tùy chọn, vị trí được phép đổi, số ảnh hỗ trợ và tùy chọn hiệu ứng. Editor chỉ mở các thao tác package thực sự thực hiện được. Trường không hỗ trợ phải báo lỗi; không lưu thành công rồi âm thầm bỏ qua.

Không tự thêm hiệu ứng chung vào mẫu đã có cùng hiệu ứng: tránh hai bộ parallax, hai trình phát nhạc hoặc hai cơ chế mở phong bì chạy đồng thời.

## 4. Cách giữ hiệu ứng theo từng loại nguồn

### A. Có mã nguồn thật

1. Giữ nguyên component tree, CSS và các hàm hiệu ứng trong lần tích hợp đầu.
2. Ghi nhận phiên bản dependency; kiểm tra phần phụ thuộc framework, router, asset loader và trình duyệt.
3. Tách dữ liệu mẫu thành props tại nơi component vốn nhận hoặc tạo dữ liệu. Không tìm–thay chữ trên DOM sau render.
4. Thay điểm gọi dịch vụ bên ngoài bằng service module của dự án, giữ hành vi giao diện đã được xác nhận.
5. Kiểm tra đăng ký/hủy listener, observer, timer và animation khi mount, unmount hoặc đổi mẫu; Next.js có thể làm lộ lỗi vòng đời.
6. Chỉ tối ưu, gộp thư viện hoặc đổi CSS sau khi có bản tích hợp đạt chuẩn tham chiếu.

Đây là đường ưu tiên để vừa tùy biến sâu vừa giữ hiệu ứng mà không phải viết lại.

### B. Chỉ có runtime đã build nhưng bản fork chạy đúng

Giữ runtime trong một document độc lập giúp giữ môi trường gốc tốt hơn việc nhét script vào cây React của ứng dụng chủ. Một phương án là iframe chạy gói mẫu trên origin riêng do mình quản lý. Đây là lựa chọn kiến trúc cần chấp thuận, không phải thay đổi đã thực hiện.

Lợi ích: giữ được CSS, global scope, bộ thư viện và logic hiệu ứng gốc cùng nhau. Next.js vẫn quản lý editor, dữ liệu và xuất bản. Cần thiết kế chiều cao/scroll, full-screen modal, âm thanh, focus và giao tiếp với trang chủ; iframe không tự giải quyết các vấn đề này.

Điểm quyết định là **tìm được đầu vào dữ liệu ổn định**:

- Kiểm tra dữ liệu nằm trong props, JSON cấu hình, API hay bị đóng cứng trong bundle.
- Nếu có đầu vào ổn định: adapter đưa JSON của mình vào trước khi runtime khởi tạo, hoặc gọi cơ chế cập nhật được runtime hỗ trợ.
- Nếu không có: phải phân tích và sửa module tạo dữ liệu, lấy source thật, hoặc chuyển sang phục dựng. Không đánh dấu mẫu “đã tùy biến được” chỉ vì replay đúng tên gốc.
- Không thay chuỗi tùy ý trong bundle hoặc payload hydration/RSC. Dữ liệu có thể có encoding, độ dài và tham chiếu nội bộ; sửa sai làm hỏng khởi tạo ứng dụng.
- Không sửa DOM do framework gốc quản lý để giả lập binding: lần render sau có thể ghi đè thay đổi và state vẫn chứa dữ liệu cũ.

Giao tiếp editor–runtime phải có thông báo sẵn sàng, phiên bản giao thức, mã yêu cầu và phản hồi áp dụng thành công/thất bại. Nếu dùng `postMessage`, kiểm tra `origin`, `source` và payload. Chỉ nhận dữ liệu, không nhận chuỗi mã thực thi.

Runtime tải từ bên ngoài cần được kiểm kê các request và mã thực thi. Chạy trên origin riêng, chỉ cấp khả năng cần thiết; không đưa token quản trị vào runtime. Các dịch vụ gốc như analytics, chat hoặc API riêng phải được xác định giữ, thay hay loại bỏ, cùng ảnh hưởng tương ứng.

**Không đổi DOM thành React nếu mục tiêu trước mắt là giữ runtime nguyên bản.** Đây là hai đường triển khai khác nhau; trộn chúng khiến cả hai runtime tranh quyền quản lý giao diện.

## 5. Quy trình nhập và điều kiện qua từng bước

| Bước | Việc làm | Đầu ra bắt buộc / điều kiện qua |
| --- | --- | --- |
| 1. Kiểm kê nguồn | Phân loại source thật hay bản build; ghi tài nguyên, font, script, request và dependency; tìm CSS-in-JS, stylesheet được chèn lúc chạy và keyframe trong bundle | Manifest URL đầy đủ cả query, đường dẫn local, hash, loại nội dung; danh sách module/CSS tạo từng hiệu ứng; báo cáo thiếu |
| 2. Đóng băng tham chiếu | Chạy bản fork đã xác nhận; ghi dữ liệu, viewport, trạng thái và thao tác | Bộ ảnh/video tham chiếu và danh sách hành vi; không chỉ ảnh trang đầu |
| 3. Chọn đường nhập | Component nguyên bản hoặc runtime độc lập | Quyết định ghi rõ lý do, điểm nhận dữ liệu và giới hạn; không đoán rằng mọi bundle đều sửa được |
| 4. Tích hợp nguyên trạng | Chạy mẫu với dữ liệu gốc trong môi trường đích, ghi cả trạng thái trung gian | Mỗi hiệu ứng bắt buộc có bằng chứng chạy so với tham chiếu; còn thiếu một hiệu ứng thì bước này chưa đạt dù form/API đã chạy |
| 5. Khai báo hợp đồng mẫu | Định nghĩa field, section, giới hạn và binding có kiểu | Không phụ thuộc tên mẫu, nội dung chữ hoặc chỉ số phần tử để nhận diện field |
| 6. Nối dữ liệu và dịch vụ | Áp dụng nội dung, RSVP, lời chúc, ảnh, quà mừng | Kiểm tra dữ liệu gửi và lưu thực tế; phân biệt đủ các lựa chọn form |
| 7. Kiểm thử biến thể | Thay dữ liệu, ẩn phần, đổi thứ tự được hỗ trợ, đổi số ảnh | Không mất nội dung, không dùng nhầm dữ liệu demo, không trùng hiệu ứng |
| 8. Kiểm tra xuất bản | Sửa → lưu → tải lại → mở link công khai → chạy lại các hiệu ứng trên chính link đó | JSON được giữ đầy đủ; kết quả editor và public nhất quán; xác minh API thật, tài nguyên thật và dữ liệu database |
| 9. Phát hành package | Đóng phiên bản renderer/runtime, schema và tài nguyên | Không ghi đè tài nguyên của thiệp đã xuất bản; có báo cáo đạt/chưa đạt |

Nếu bước tích hợp nguyên trạng thất bại, dừng việc thêm binding để xử lý môi trường trước. Nếu bước binding thất bại, sửa adapter thay vì chỉnh CSS để che dữ liệu sai. Cách này khoanh vùng nguyên nhân và giảm việc sửa mò.

## 6. Ma trận kiểm chứng “khớp 100%”

“100%” phải gắn với phạm vi được kiểm tra. Không thể suy ra mọi hành vi tương lai từ vài screenshot.

### Giao diện

- Cùng trình duyệt, viewport, device scale, dữ liệu, font đã tải, vị trí cuộn và trạng thái.
- Kiểm tra tối thiểu màn hình 320, 375, 430, 768 và 1280px; thêm điểm ngay trước/sau breakpoint của mẫu.
- So sánh từng vùng và toàn thiệp: phong bì, gia đình, sự kiện, album, form, modal, phần kết.
- Giữ CSS đầy đủ ở bản tích hợp đầu. Chỉ lọc CSS sau khi kiểm chứng các class động và chạy lại toàn bộ ma trận.
- Ảnh so sánh tĩnh có thể cố định thời gian hoặc tạm dừng animation giống nhau ở hai bên; không dùng kết quả đó để kết luận hiệu ứng đúng.

### Hiệu ứng và tương tác

Lập bảng cho từng hiệu ứng: phần tử, trigger, trạng thái đầu/cuối, duration, delay, easing, phạm vi cuộn, hành vi resize và điều kiện âm thanh.

**Không chỉ ghi trạng thái đầu/cuối.** Với mỗi tương tác, phải ghi cả các trạng thái trung gian, CSS/module chịu trách nhiệm, timer/listener, điều kiện kết thúc và cách hủy khi unmount. Phần tử đang chuyển động phải còn được mount cho tới khi hoàn tất. Kiểm tra click liên tiếp, mở lại sau khi đóng, rời trang giữa hiệu ứng và reduced motion để phát hiện timer/listener sót hoặc khóa cuộn không được trả lại.

Với CSS-in-JS, kiểm kê cả `<style>` trong body/head, stylesheet được thêm khi mở modal, pseudo-class `hover/focus-visible`, keyframe trong bundle và Web Animations API. Không lấy riêng file `.css` rồi kết luận đã giữ đủ CSS. Nếu lấy CSS từ bundle, phân tích cú pháp để lấy đúng chuỗi tĩnh của module, giữ selector và keyframe nguyên bản, lưu hash nguồn và dừng nhập khi không tìm thấy các hiệu ứng bắt buộc. Không tìm–thay tùy ý nội dung bundle để chạy mã khác.

Đọc cấu hình của đúng mẫu, không chỉ component hiệu ứng dùng chung. Với từng điều kiện như `flyOnOpen`, `above`, `float`, `sway`, `sealImage`, ghi rõ có áp dụng hay không và lý do. Phần tử sinh ra trong trạng thái đang chuyển động phải có trong manifest lớp hiệu ứng, kể cả khi không tồn tại ở bản chụp đầu/cuối. Cấu hình có tùy chọn chưa được adapter hỗ trợ phải làm bộ nhập dừng để rà lại, không âm thầm bỏ qua.

Đi ngược cây cha tới lớp ứng dụng để tìm hành vi không tạo DOM: `requestAnimationFrame`, timer, `scrollTo`, listener chuột/chạm/focus, trạng thái pause/resume và chính sách âm thanh. Mỗi hành vi cần xác định ai sở hữu và gắn vào đâu trong gói mẫu; không tự áp một hook cuộn chung lên mọi mẫu. Với Shadow DOM, đọc `composedPath()` và `shadowRoot.activeElement` để nhận diện đúng ô nhập thay vì chỉ thấy host của thiệp.

Chạy cùng chuỗi thao tác ở bản tham chiếu và bản nhập: mở thiệp, cuộn qua các mốc, chuyển ảnh, vuốt nếu bản gốc hỗ trợ, mở/đóng modal, bật/tắt nhạc, chọn cả hai lựa chọn RSVP. Ghi lại khung hình theo mốc thời gian khi cần; tránh so sánh animation tại hai thời điểm ngẫu nhiên.

Bài kiểm tra phải chứng minh chuyển động: đọc `getComputedStyle`, `getAnimations()` hoặc đo transform/opacity tại ít nhất hai thời điểm khác nhau; xác nhận duration/delay và có ảnh/video theo mốc. Có tên `animation` trong CSS hoặc click xong thấy nội dung đều chưa đủ. Khi kiểm tra hover bằng chuột thật, đưa phần tử vào viewport, chờ cuộn ổn định và xác nhận con trỏ thực sự nằm trên phần tử. Không dùng CSS ép trạng thái để thay cho kiểm tra người dùng kích hoạt hiệu ứng.

Không chỉ kiểm tra một danh sách keyframe do người sửa tự liệt kê. So tập hợp **mọi lớp animation đang xuất hiện và số lượng từng loại** giữa nguồn và bản nhập ở từng pha; so thêm các lớp không dùng keyframe như ánh sáng, cùng độ dày viền, hướng lật ảnh, màu hạt, duration, easing và fill-mode. Bổ sung một lượt dùng cùng nội dung demo để dễ xem sai khác, rồi kiểm tra tiếp link đã cá nhân hóa. Đo thời gian ở một lượt không chụp ảnh: việc chụp màn hình/đọc hàng loạt computed style có thể làm trễ timer; không nới dung sai để che ảnh hưởng của chính công cụ đo.

Kiểm tra trên mobile thực tế đối với thao tác chạm và chính sách phát âm thanh. Những thay đổi có chủ đích như reduced motion hoặc loại dịch vụ chat phải được ghi thành ngoại lệ, không báo là giữ nguyên mọi hành vi.

### Dữ liệu tùy biến

Tên ngắn/dài có dấu; thiếu trường tùy chọn; ảnh 0/1/nhiều theo giới hạn công bố; tháng 28/29/30/31 ngày; giờ khác nhau giữa các sự kiện; một/hai/không có tài khoản quà mừng; ẩn từng section được phép; lỗi tải font/ảnh/API; gửi form và mở lại link sau lưu.

Tiêu chí bắt buộc: không rơi trường dữ liệu, không gửi sai lựa chọn, không sót tên/ngày/tài khoản demo trong thiệp đã cá nhân hóa. Sai khác thị giác cần có ảnh diff và ngưỡng được thống nhất; không tự gọi sai khác nhỏ là “100%”.

## 7. Tự động hóa để nhập nhanh

Tự động hóa phần lặp lại: kiểm kê và hash tài nguyên; kiểm tra URL thiếu; phục vụ bản tham chiếu; tạo khung package; kiểm tra schema; chụp ảnh theo trạng thái; chạy chuỗi thao tác; so ảnh; kiểm tra dữ liệu lưu; tạo báo cáo.

Phần cần xác nhận theo từng mẫu: điểm nhận dữ liệu, logic hiệu ứng, dependency thực sự, section nào tách/gộp được và giới hạn tùy biến. Không dùng công cụ “đoán DOM” để che việc chưa xác định được các điểm này.

Các artifact cần giữ theo phiên bản mẫu:

- Manifest nguồn và tài nguyên, kèm hash; không commit token hoặc thông tin nhạy cảm.
- Manifest package: loại runtime, entry, phiên bản, capability, field và section.
- Adapter dữ liệu và kiểm tra hợp đồng.
- Bộ dữ liệu kiểm thử, thao tác tham chiếu, ảnh/video và báo cáo sai khác.

Đo tốc độ bằng thời gian tích hợp nguyên trạng, số binding cần viết tay, số lỗi bị phát hiện sau phát hành và tỷ lệ hành vi có kiểm thử. Không hứa thời gian cố định cho mọi nguồn tải về.

## 8. Áp dụng cho Minimalism hiện tại

1. Giữ bản replay đang đúng làm tham chiếu; bản DOM-to-JSON hiện tại chỉ là một ứng viên, chưa được coi là giữ đủ runtime.
2. Sửa và kiểm tra lỗi mất `value` của RSVP; rà các thuộc tính và trạng thái khác đã bị bộ nhập loại bỏ.
3. Xác minh bản fork có điểm nhận dữ liệu ổn định hay có thể lấy mã nguồn component. Đây là kết quả khảo sát cần có trước khi chọn cách chuyển tiếp.
4. Nếu lấy được source: ưu tiên component nguyên bản. Nếu chỉ có bundle nhưng adapter khả thi: đánh giá runtime độc lập. Nếu cả hai không khả thi: công khai phạm vi phải phục dựng và chi phí, không hứa tự động chuyển nguyên vẹn.
5. Xác nhận một luồng hoàn chỉnh với dữ liệu mới: sửa tên/ngày/ảnh → lưu → mở thiệp → dùng album → gửi cả hai trạng thái RSVP → kiểm tra dữ liệu backend.
6. Chỉ sau đó mở rộng tùy biến section và chạy ma trận giao diện/hiệu ứng. Không ghi đè renderer cũ của các thiệp đã xuất bản.

### Hợp đồng chuyển động bắt buộc của Minimalism

| Phần | Nguồn đã xác định | Trigger và trạng thái cần giữ | Kiểm tra bắt buộc |
| --- | --- | --- | --- |
| Bìa chờ | `57034-09348eea77495863.js`, style id `353cb38c53e4a74a` | Tim rơi `ambient-fall`, dấu niêm `seal-pulse`, nút có `shine` | Animation có keyframe và giá trị thay đổi khi chờ |
| Mở thiệp | Cùng module bìa | Click/Enter/Space một lần: `opening` 500 ms với `seal-break` và `seal-ring`; sau đó `away` 800 ms với `envelope-away` và 32 hạt `particle-burst`; `done` ở khoảng 1300 ms | Bìa chưa bị xóa giữa hiệu ứng; có khung hình 200/650/1050/1500 ms; không chạy hai lần khi bấm liên tiếp; trả lại cuộn khi xong |
| Hai lớp hoa khi mở | Cấu hình `decorations.cardImages` của module `90662` trong `59526-668c753ae1999f5f.js`, cả hai có `flyOnOpen: true` | Tạo hai lớp chồng lên hoa tĩnh ngay ở pha `opening`; `dragon-fly-forward` 1,2 s ease-in forwards: phóng lớn, blur tăng và opacity giảm; một bên lật trục X | Đủ hai lớp; transform và blur thay đổi; asset, class bố trí, hướng lật, duration/easing/fill-mode khớp nguồn; không chỉ kiểm tra có keyframe |
| Tự cuộn sau mở | Lớp ứng dụng `InvitationRenderer`, module `82730`, bundle `60193-5e71a53cd1a8947b.js` | Bắt đầu sau mở 2 s, mặc định 50px/s; lăn chuột tích lũy 50px/chạm/nhập form/click tương tác làm tạm dừng; click vùng trống dừng/chạy tiếp; chờ 400ms sau rời ô nhập; dừng ở cuối thiệp | Đo vị trí thực và tốc độ; không trôi lúc nhập form/mở dialog; tiếp tục từ vị trí hiện tại; không chạy trong editor/reduced motion/chế độ chụp; hủy RAF/timer/listener khi rời trang |
| Hộp quà chờ | `71675-f26cd3a2da64af56.js`, style id `1370451c15a89ae2` | `ienvFloatMain` 3 s, `ienvFloat` 5,2 s trễ 0,5 s, bóng, bốn tia lấp lánh và dòng gợi ý | Đo translate/opacity thay đổi, không chỉ thấy hai ảnh phong bì |
| Hộp quà hover/focus | Cùng module hộp quà | `ienvGrow` 0,35 s; `ienvWave` 1,1 s trễ 0,35 s; `ienvBackWave` 2,2 s | Chuột và focus bàn phím kích hoạt đúng; rời hover trả về chuyển động chờ |
| Hộp quà mở/đóng | Dialog của mẫu | Click mở dialog ngay như nguồn; đóng bằng nút, nền và Escape | Không tự thêm thời gian chờ hoặc một hiệu ứng mở khác không có trong nguồn; không lộ tài khoản demo khi thiếu cấu hình |
| Reduced motion | Ngoại lệ có chủ đích | Mở thẳng nội dung, tắt chuyển động lặp | Không kẹt ở bìa hoặc giữ khóa cuộn; form và hộp quà vẫn dùng được |

Lệnh kiểm tra dành cho workspace hiện tại, khi backend/frontend/MinIO và bản replay cổng 3100 đang chạy:

```powershell
node frontend/scripts/import-minimalism-layout.cjs
node frontend/scripts/test-minimalism-browser.mjs --live
node frontend/scripts/test-minimalism-browser.mjs --motion
node frontend/scripts/test-minimalism-browser.mjs --scroll
```

`--motion` dùng link thiệp đã lưu thật từ báo cáo `--live` gần nhất, không giả lập request, đối chiếu với bản replay ở 375/1280px và lưu khung hình/báo cáo tại `extracted_templates/browser-check/minimalism-motion/`. Có thể chỉ định `INVITATION_SLUG` để kiểm tra lại một thiệp cũ mà không tạo thiệp mới; `FRONTEND_URL` và `REFERENCE_URL` cấu hình địa chỉ chạy. `--live` tạo thêm thiệp và phản hồi thật để kiểm tra lưu trữ; kiểm tra lưu trữ không thay thế kiểm tra chuyển động.

`--scroll` kiểm tra nguồn/demo/public bằng backend thật và ghi `minimalism-scroll/report.json`: chờ bắt đầu, tốc độ, pause/resume, nhập form, dialog, cuối trang, reduced motion và editor. Phải chờ hydration trước khi click bản replay; nếu không, link SSR có thể điều hướng `?open=1` và cho kết quả đo sai. Khi kiểm tra focus làm tạm dừng, tách việc trình duyệt cuộn ô nhập vào màn hình khỏi việc hook còn tự cuộn; có thể dùng `focus({preventScroll:true})` trong phép đo này.

## 9. Điều kiện chốt công việc để tránh bỏ sót lần sau

Khi sửa trang demo chung, registry, renderer hoặc cấu hình CSS, bắt buộc kiểm tra hồi quy các package đang dùng, gồm cả HB04. Không lấy kết quả đạt của riêng mẫu mới để kết luận phần dùng chung an toàn. Khi chuyển component sang `src/templates`, cập nhật glob `content` của Tailwind để CSS trong package được sinh đầy đủ. Class đánh dấu ngữ cảnh như `invitation-demo` phải được ghép với bố cục mặc định; chỉ class kích thước được phép ghi đè kích thước (dùng `cn` để xử lý xung đột Tailwind).

Chạy `node frontend/scripts/test-demo-layout-browser.mjs` với frontend/backend/MinIO thật: HB04 và Minimalism ở 320/375/430/768/1280px, không chặn API hoặc giả lập tài nguyên. Kiểm tra khung HB04 tối đa 400px và căn giữa, font 38px, ảnh không lỗi, không tràn ngang, nút chọn đúng mẫu; kiểm tra thêm HB04 trong editor vẫn nhận `max-w-full`. Ảnh và báo cáo ở `extracted_templates/browser-check/demo-layout/after/`. Đây là kiểm tra bố cục hồi quy, không thay thế kiểm tra chuyển động và lưu dữ liệu.

1. Lập danh sách tất cả section và tương tác của nguồn trước khi sửa. Mỗi mục có nguồn triển khai, trạng thái, dữ liệu đầu vào và bằng chứng tham chiếu. Mục chưa khảo sát ghi chưa xác minh, không âm thầm bỏ qua.
2. Chạy riêng ba nhóm: giao diện, chuyển động/tương tác, dữ liệu/lưu trữ. Một nhóm đạt không được dùng để kết luận nhóm khác đạt.
   Khi kiểm tra trình duyệt, thu cả console warning/error bên cạnh exception và request lỗi. Với React, phải loại thuộc tính HTML gốc khỏi props sau khi đổi tên (`class` → `className`); gán `class: undefined` vẫn để lại key và có thể gây cảnh báo. Kiểm tra cả favicon dùng chung trả HTTP 200.
3. Với chuyển động, phải xem khung hình/video thực tế của cả hai phía và có kiểm tra tự động phát hiện phiên bản đứng yên. Ảnh trang đầu hoặc không có exception không đủ làm điều kiện qua.
   Kiểm tra phải phát hiện cả phiên bản còn chuyển động chính nhưng thiếu lớp phụ, ví dụ bỏ riêng hai lớp hoa bay mà vẫn giữ niêm tan và tấm thiệp bay. Bản báo cáo lần chạy mới phải ghi trạng thái đang chạy/đạt/thất bại; không giữ báo cáo đạt cũ khi lần chạy mới lỗi.
4. Chạy lại trên link được đọc từ backend, dùng ảnh/nhạc thật và đối chiếu database. Ghi rõ hostname, dữ liệu, viewport, reduced motion, script kiểm tra và đường dẫn bằng chứng để có thể tái lập.
5. Báo cáo cuối phải tách rõ đã đạt, chưa đạt và khác biệt có chủ đích. Còn một hiệu ứng bắt buộc chưa đạt thì tiếp tục sửa trong phạm vi được giao; không chốt “đã hoàn tất” chỉ vì tạo được thiệp và lưu RSVP.

Kết quả cần đạt là một quy trình giữ nguyên chương trình đang tạo ra giao diện và hiệu ứng khi có thể, có adapter dữ liệu rõ ràng và có bằng chứng kiểm thử. Việc lưu JSON thành công hoặc một ảnh chụp giống mẫu không đủ để nghiệm thu mẫu.
