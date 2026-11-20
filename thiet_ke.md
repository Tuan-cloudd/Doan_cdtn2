# Tài liệu thiết kế StudyShare

## 1. Tổng quan

StudyShare là hệ thống web tìm kiếm và chia sẻ tài liệu học tập theo kiến trúc Client–Server:

- Frontend: React/Vite
- Backend: Node.js/Express REST API
- Cơ sở dữ liệu: MongoDB/Mongoose
- Xác thực: JWT
- Lưu trữ tệp: thư mục trên server hoặc cấu hình `UPLOAD_DIR`

## 2. Chức năng đã hiện thực trong phiên bản đồ án

| Chức năng | Vai trò người dùng | Vai trò quản trị | Dữ liệu chính |
|---|---|---|---|
| Thông báo hệ thống | Nhận thông báo duyệt/từ chối tài liệu và bình luận | Hệ thống tạo thông báo tự động | `Notification` |
| Báo cáo tài liệu vi phạm | Gửi báo cáo kèm lý do và chi tiết | Xem, xử lý hoặc bỏ qua báo cáo | `Report` |
| Bộ sưu tập tài liệu | Tạo và quản lý nhiều bộ sưu tập, thêm/bỏ tài liệu | — | `Collection` |
| Lịch sử tải tài liệu | Xem tài liệu đã tải gần đây | Thống kê tổng lượt tải | `Download` |
| Cập nhật phiên bản tài liệu | Upload phiên bản mới, ghi chú thay đổi | Duyệt phiên bản như tài liệu mới | Trường `version`, `previousDocument`, `versionNote` trên `Document` |
| Quên/đặt lại mật khẩu | Yêu cầu email đặt lại và đặt mật khẩu mới bằng token hết hạn | — | `passwordResetTokenHash`, `passwordResetExpires` trên `User` |

## 3. Thiết kế luồng nghiệp vụ

### 3.1 Thông báo

1. Backend tạo bản ghi `Notification` khi tài liệu được duyệt/từ chối.
2. Backend tạo thông báo cho chủ tài liệu khi tài liệu nhận bình luận mới.
3. Người dùng lấy danh sách thông báo và số lượng chưa đọc qua API.
4. Người dùng đánh dấu từng thông báo hoặc toàn bộ thông báo là đã đọc.

### 3.2 Báo cáo vi phạm

1. Người dùng chọn lý do và nhập chi tiết tại trang chi tiết tài liệu.
2. Backend kiểm tra tài liệu tồn tại và dùng unique index `(document, reporter)` để ngăn báo cáo trùng.
3. Quản trị viên xem báo cáo trong mục “Báo cáo”, sau đó cập nhật trạng thái `reviewed` hoặc `dismissed`.

### 3.3 Bộ sưu tập

1. Người dùng tạo bộ sưu tập qua trang `/collections`.
2. Tại trang chi tiết tài liệu, người dùng thêm hoặc bỏ tài liệu khỏi từng bộ sưu tập.
3. Backend lưu danh sách ObjectId tài liệu trong collection và chỉ trả tài liệu đã được duyệt.

### 3.4 Lịch sử tải

1. Khi tải tài liệu thành công, hệ thống tăng lượt tải và tạo bản ghi `Download`.
2. Nếu người dùng đã đăng nhập, bản ghi gắn với tài khoản.
3. Trang cá nhân truy cập bộ sưu tập và lịch sử để lấy 100 lượt tải gần nhất.

### 3.5 Phiên bản tài liệu

1. Chủ tài liệu nhấn “Phiên bản mới” trong hồ sơ cá nhân.
2. Frontend gửi tệp và metadata tới `POST /api/documents/:id/version`.
3. Backend tạo tài liệu mới với `status=pending`, tăng `version`, lưu tài liệu trước đó trong `previousDocument` và ghi `versionNote`.
4. Quản trị viên duyệt/từ chối phiên bản mới theo luồng hiện có.

### 3.6 Quên và đặt lại mật khẩu

1. Người dùng gửi email ở `/forgot-password`.
2. Backend tạo token ngẫu nhiên, lưu SHA-256 của token và thời hạn 30 phút.
3. Backend gửi liên kết qua SMTP; nếu chưa cấu hình SMTP trong môi trường demo, liên kết được ghi log và có thể trả về cho giao diện demo.
4. Người dùng mở `/reset-password/:token` và đặt mật khẩu mới.
5. Backend kiểm tra token còn hạn, cập nhật bcrypt hash và xóa token cũ.

## 4. REST API mới

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/auth/forgot-password` | Khách | Tạo và gửi liên kết đặt lại |
| POST | `/api/auth/reset-password` | Khách | Đặt lại mật khẩu bằng token |
| POST | `/api/documents/:id/version` | Chủ tài liệu | Upload phiên bản mới |
| GET | `/api/features/notifications` | Người dùng | Danh sách thông báo |
| PATCH | `/api/features/notifications/:id/read` | Người dùng | Đánh dấu một thông báo |
| PATCH | `/api/features/notifications/read-all` | Người dùng | Đánh dấu toàn bộ thông báo |
| POST | `/api/features/documents/:id/reports` | Người dùng | Báo cáo tài liệu |
| GET/POST | `/api/features/collections` | Người dùng | Danh sách/tạo bộ sưu tập |
| PUT/DELETE | `/api/features/collections/:id` | Chủ sở hữu | Cập nhật/xóa bộ sưu tập |
| POST | `/api/features/collections/:id/documents/:documentId` | Chủ sở hữu | Thêm/bỏ tài liệu |
| GET | `/api/features/history/downloads` | Người dùng | Lịch sử tải |
| GET/PATCH | `/api/admin/reports` và `/api/admin/reports/:id` | Admin | Quản lý báo cáo |

## 5. Giao diện mới

- Menu thông báo trên thanh điều hướng.
- Trang quên mật khẩu và đặt lại mật khẩu.
- Trang bộ sưu tập và lịch sử tải.
- Nút “Phiên bản mới” trong hồ sơ tài khoản.
- Form báo cáo và chọn bộ sưu tập trong trang chi tiết tài liệu.
- Mục “Báo cáo” trong trang quản trị.

## 6. Cấu hình email

Thêm cấu hình SMTP vào `backend/.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Không cấu hình SMTP thì hệ thống chạy ở chế độ demo, ghi liên kết reset ra console backend. Trước khi public cần dùng tài khoản SMTP hợp lệ, HTTPS và môi trường `NODE_ENV=production`.

## 7. Bảo mật và kiểm thử đề xuất

- Token đặt lại chỉ lưu dạng SHA-256, không lưu token gốc.
- Token hết hạn sau 30 phút.
- Rate limit chung cho toàn bộ API.
- JWT và bcrypt cho xác thực/mật khẩu.
- Unique index ngăn báo cáo trùng và trùng tên bộ sưu tập của một người dùng.
- Kiểm tra quyền chủ sở hữu tài liệu, bộ sưu tập và tài khoản.
- Các bước kiểm thử: quên/reset mật khẩu, tạo/xóa bộ sưu tập, báo cáo tài liệu, xử lý báo cáo bằng admin, upload phiên bản, nhận thông báo duyệt và kiểm tra lịch sử tải.
