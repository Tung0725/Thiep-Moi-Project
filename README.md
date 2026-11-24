# Thiep-Moi-Project

## Đăng nhập Google

1. Trong Google Cloud Console, dùng OAuth Client loại **Web application**. Thêm `http://localhost` và `http://localhost:3000` vào **Authorized JavaScript origins** khi chạy local. Thêm origin HTTPS thực tế của frontend khi triển khai. Popup Google Identity Services dùng cùng Client ID cho frontend và backend. [Hướng dẫn của Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
2. Đặt `GOOGLE_CLIENT_ID` trong `.env` ở thư mục gốc cho profile `dev` và Docker Compose, hoặc cấp biến môi trường cho Spring Boot. Đặt cùng giá trị cho `NEXT_PUBLIC_GOOGLE_CLIENT_ID` trong `frontend/.env.local` hoặc môi trường build của Next.js. Khởi động lại backend và khởi động lại hoặc build lại frontend sau khi đổi cấu hình.
3. Với profile `prod`, áp dụng [SQL bổ sung định danh Google](backend/sql/add-google-subject.sql) vào cơ sở dữ liệu hiện có trước khi triển khai. Dùng HTTPS với `COOKIE_SECURE=true`, cấu hình `CORS_ALLOWED_ORIGINS` theo origin frontend, và đặt frontend với API trên cùng site để trình duyệt gửi cookie phiên.

Người dùng mở `/login` và chọn nút Google ở form đăng nhập hoặc đăng ký. Tài khoản mới dùng Gmail hoặc Google Workspace đã xác minh email. Email đã được dùng trên hệ thống tiếp tục đăng nhập bằng phương thức ban đầu.

## Email xác minh tài khoản

Đặt `MAIL_USERNAME` là địa chỉ Gmail đã tạo mật khẩu ứng dụng và `MAIL_APP_PASSWORD` là mật khẩu ứng dụng. Dùng `.env` ở thư mục gốc cho profile `dev` và Docker Compose, hoặc cấp biến môi trường cho Spring Boot. Đặt `FRONTEND_URL` thành địa chỉ frontend mà người nhận có thể truy cập, rồi khởi động lại backend. [.env.example](.env.example)

Đăng ký bằng email và chức năng gửi lại đều gửi liên kết `/verify-email` sau khi mã xác minh đã được lưu. Mã có hiệu lực trong 24 giờ. Người dùng có thể yêu cầu gửi lại nếu chưa nhận được thư.
