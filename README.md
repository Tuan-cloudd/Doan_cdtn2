# StudyShare — Hệ thống Web Tìm kiếm và Chia sẻ Tài liệu Học tập

Ứng dụng Client–Server gồm React/Vite, Express REST API và MongoDB/Mongoose. Nội dung dữ liệu được đọc/ghi từ MongoDB; tệp tải lên được lưu trên ổ đĩa server trong `backend/uploads/` (có thể đổi bằng `UPLOAD_DIR`). Tài liệu mới ở trạng thái chờ duyệt và chỉ tài liệu đã duyệt mới được tìm kiếm, xem trước hoặc tải xuống.

## Chức năng hiện có

- Đăng ký/đăng nhập JWT, mật khẩu bcrypt, vai trò `user` và `admin`.
- Hồ sơ cá nhân, đổi mật khẩu, xem trạng thái các tài liệu đã tải lên và danh sách yêu thích.
- Tìm kiếm toàn văn, lọc khoa/ngành/môn/loại, sắp xếp mới nhất/phổ biến/đánh giá cao và phân trang.
- Tải PDF/DOCX/PPTX (mặc định tối đa 20 MB), thông tin/từ khóa, hàng chờ duyệt; xem trước PDF, tải xuống tài liệu.
- Đánh giá 1–5 sao, bình luận và lưu/bỏ lưu yêu thích.
- Admin: số liệu, duyệt/từ chối/xóa tài liệu, quản lý trạng thái người dùng, danh mục và bình luận.
- Rate limit API, Helmet, CORS, kiểm tra đầu vào cơ bản, xử lý lỗi tập trung và cấu hình qua biến môi trường.

## Cấu trúc thư mục

```text
backend/
  src/
    config/          Kết nối MongoDB
    controllers/     Xử lý API và nghiệp vụ
    middleware/      JWT, phân quyền, upload và lỗi
    models/          User, Document, Category, Subject, Comment, Rating, Favorite, Download
    routes/          REST endpoints
    seeds/            Tạo admin và dữ liệu danh mục mẫu
    utils/            Hàm dùng chung
  uploads/            Tệp người dùng (tự tạo khi upload)
frontend/
  src/
    components/       Layout, thẻ tài liệu và lưới
    context/          Trạng thái đăng nhập
    pages/            Trang chủ, tìm kiếm, chi tiết, đăng nhập, tải lên, hồ sơ, yêu thích, admin
    services/         Axios API client
```

## MongoDB collections

| Collection | Dữ liệu chính |
|---|---|
| `users` | Họ tên, email duy nhất, `passwordHash`, vai trò, hồ sơ, trạng thái tài khoản |
| `documents` | Metadata/tệp, người đăng, khoa/ngành/môn/loại, từ khóa, trạng thái duyệt, lượt tải và rating tổng hợp |
| `categories` | Danh mục khoa, ngành và loại tài liệu |
| `subjects` | Môn học, khoa/ngành tùy chọn và mô tả |
| `comments` | Bình luận gắn tài liệu và người dùng |
| `ratings` | Mỗi người dùng một đánh giá cho một tài liệu (unique index) |
| `favorites` | Tài liệu yêu thích của người dùng (unique index) |
| `downloads` | Lịch sử tải, có thể không gắn user với khách |

`Document` sử dụng text index cho tiêu đề, mô tả, từ khóa, môn học; rating và favorites có unique compound index.

## Cài đặt và chạy trong Visual Studio Code

Yêu cầu: Node.js 20+, npm và MongoDB đang chạy (local hoặc MongoDB Atlas).

1. Mở thư mục gốc trong VS Code.
2. Tạo file môi trường:
   - Sao chép `backend/.env.example` thành `backend/.env`.
   - Sao chép `frontend/.env.example` thành `frontend/.env`.
   - Đặt `MONGODB_URI`, `JWT_SECRET` ngẫu nhiên đủ mạnh, `ADMIN_EMAIL` và `ADMIN_PASSWORD` riêng tư. Không dùng mật khẩu mặc định ở môi trường triển khai.
3. Trong terminal thứ nhất:

   ```powershell
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

   API chạy tại `http://localhost:5000`; health check tại `http://localhost:5000/api/health`.
4. Trong terminal thứ hai:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Mở URL Vite hiển thị (mặc định `http://localhost:5173`). Đăng nhập bằng email/mật khẩu admin đã cấu hình để quản trị; tạo tài khoản thường ngay tại giao diện.
5. Giai đoạn kiểm thử đề xuất: (1) `/api/health` và kết nối MongoDB; (2) đăng ký/đăng nhập; (3) upload tài liệu, duyệt bằng Admin; (4) tìm kiếm, xem trước/tải file, đánh giá/bình luận/yêu thích; (5) quản lý danh mục và người dùng.

Muốn tăng giới hạn tệp, cập nhật `MAX_FILE_SIZE_MB`. Tệp và MongoDB đều cần được backup. Local disk là adapter triển khai đơn giản; khi scale ra nhiều instance, thay vùng lưu trữ bằng object storage riêng tư và dùng URL ký thời hạn ngắn.

## REST API

Tất cả endpoint có tiền tố `/api`. Endpoint bảo vệ yêu cầu `Authorization: Bearer <JWT>`. Tệp không được phục vụ trực tiếp từ thư mục lưu trữ: tải/xem đi qua endpoint kiểm tra trạng thái duyệt.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | Khách | Kiểm tra API |
| POST | `/auth/register` | Khách | Tạo tài khoản user |
| POST | `/auth/login` | Khách | Đăng nhập, nhận JWT |
| GET | `/auth/me` | User | Lấy tài khoản hiện tại |
| GET | `/documents?q=&faculty=&major=&subject=&type=&sort=&page=` | Khách | Tìm kiếm/phân trang tài liệu đã duyệt |
| POST | `/documents` | User | Multipart upload (`file`, metadata), tạo hàng chờ |
| GET | `/documents/:id` | Khách | Chi tiết, bình luận, rating và trạng thái yêu thích nếu đăng nhập |
| GET | `/documents/:id/file` | Khách | Xem file đã duyệt (PDF inline) |
| GET | `/documents/:id/download` | Khách | Ghi nhận và tải file đã duyệt |
| POST | `/documents/:id/comments` | User | Thêm bình luận |
| PUT | `/documents/:id/rating` | User | Tạo/cập nhật rating 1–5 |
| POST | `/documents/:id/favorite` | User | Bật/tắt yêu thích |
| GET | `/categories` | Khách | Danh mục khoa/ngành/môn/loại |
| POST, DELETE | `/categories`, `/categories/:id` | Admin | Quản lý danh mục |
| PUT | `/users/profile` | User | Cập nhật tên và giới thiệu |
| PUT | `/users/password` | User | Đổi mật khẩu |
| GET | `/users/documents` | User | Tài liệu do user đăng tải |
| GET | `/users/favorites` | User | Danh sách yêu thích |
| GET | `/admin/dashboard` | Admin | Thống kê, tài liệu phổ biến/mới |
| GET | `/admin/users` | Admin | Danh sách người dùng |
| PATCH | `/admin/users/:id/status` | Admin | Khóa/mở khóa user |
| GET | `/admin/documents/pending` | Admin | Hàng chờ kiểm duyệt |
| PATCH | `/admin/documents/:id/moderate` | Admin | Duyệt/từ chối tài liệu |
| DELETE | `/admin/documents/:id` | Admin | Xóa tài liệu và dữ liệu liên quan |
| GET | `/admin/comments` | Admin | Danh sách bình luận |
| DELETE | `/admin/comments/:commentId` | Admin | Xóa bình luận |

## Lưu ý triển khai

- Không commit `.env`, JWT secret, hoặc mật khẩu; tắt/tạo lại thông tin admin mẫu trước khi public.
- Chạy HTTPS, CORS theo đúng domain, và cân nhắc xác minh nội dung thực tế của tệp, antivirus, object storage riêng tư, backup và logging/monitoring khi production.
- Tài khoản admin được tạo idempotent bởi `npm run seed`; lệnh không ghi đè mật khẩu của admin đã tồn tại.
