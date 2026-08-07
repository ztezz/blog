# CosmoGIS Website

CosmoGIS là một nền tảng WebGIS hiện đại kết hợp giữa công nghệ bản đồ và hiệu ứng không gian (Space/Galaxy) độc đáo, được xây dựng trên nền tảng React, Vite và Three.js.

## 🚀 Tính năng chính

- **Giao diện Space/Sky:** Hiệu ứng nền bầu trời sao và không gian ảo diệu (React Three Fiber).
- **Hệ thống Quản lý Nội dung (CMS):** Quản lý bài viết (Blog), danh mục và cài đặt hệ thống.
- **Dashboard Admin:** Quản trị viên có thể điều phối người dùng, hộp thư và nội dung.
- **WebGIS:** Tích hợp dữ liệu bản đồ chuyên sâu (SQL/PostgreSQL).
- **Phản hồi người dùng:** Hệ thống Mailbox để tiếp nhận liên hệ và phản hồi.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 19, Vite, Wouter.
- **3D/Graphics:** Three.js, @react-three/fiber, @react-three/drei.
- **Backend:** Node.js, Express.
- **Database:** SQLite (`better-sqlite3`).
- **Styling:** Tailwind CSS 4, Tailwind Typography và Lucide React.

## 📂 Cấu trúc dự án

- `src/components/`: Chứa các component dùng chung (Layout, SkyBackground...).
- `src/pages/`: Các trang giao diện chính (Home, Admin, Blog...).
- `server/`: Backend API với Express và cơ sở dữ liệu SQLite.
- `src/public/`: Các tài nguyên tĩnh và các trang index tùy biến (Neon, Cyberpunk).
- `src/utils/`: Các hàm hỗ trợ (Storage, helper functions).

## 🏁 Hướng dẫn cài đặt và chạy thử

### Tiền đề
- **Node.js 22 LTS** (tối thiểu 22.12; xem `.nvmrc`)
- Trình biên dịch C/C++ có thể cần thiết nếu hệ điều hành hoặc phiên bản Node.js không có binary dựng sẵn cho `better-sqlite3`.

### Các bước thực hiện

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` dựa trên `.env.example`. Frontend dùng `VITE_API_URL` để gọi API, ví dụ `https://api.example.com/api`. Backend dùng `FRONTEND_URL` để cho phép CORS và `PUBLIC_API_URL` để tạo URL tuyệt đối cho ảnh upload.

3. **Khởi tạo Database:**
   Backend tự tạo schema và dữ liệu mặc định khi chạy lần đầu. Mặc định database nằm tại `server/data/cosmogis.db`; có thể đổi bằng `SQLITE_PATH`.

4. **Chạy frontend ở chế độ Development:**
   ```bash
   npm run dev:frontend
   ```

5. **Chạy backend riêng:**
   ```bash
   npm run dev:backend
   ```

6. **Kiểm tra type và production build:**
   ```bash
   npm run check
   ```
   Lệnh này chạy lần lượt ESLint, Vitest, TypeScript và production build. Có thể chạy riêng bằng `npm run lint`, `npm test`, `npm run typecheck` hoặc `npm run build`.

## Triển khai frontend trên Cloudflare Pages

- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Deploy command: để trống vì Cloudflare Pages tự xuất bản thư mục `dist` sau khi build.
- Environment variable: `VITE_API_URL=https://api.example.com/api`
- SPA fallback được cấu hình trong `wrangler.jsonc` khi triển khai bằng Workers Builds.

Nếu dùng Cloudflare Workers Builds thay vì Pages, sử dụng deploy command `npx wrangler deploy`. File `wrangler.jsonc` đã cấu hình `dist` là static assets và bật SPA fallback mà không phụ thuộc vào phiên bản Vite.

## Triển khai backend trên server riêng

- Cài dependencies bằng `npm ci`.
- Khai báo `SQLITE_PATH`, `PORT`, `FRONTEND_URL` và `PUBLIC_API_URL` trong môi trường của server. Nếu chạy sau reverse proxy, đặt `TRUST_PROXY` bằng số proxy tin cậy (thường là `1` với Nginx/Caddy) để rate limit dùng đúng IP client.
- `FRONTEND_URL` có thể chứa nhiều tên miền, phân cách bằng dấu phẩy, ví dụ `https://project.pages.dev,https://www.example.com`.
- Chạy API bằng `npm run start:backend`. Backend không còn build hoặc phục vụ frontend.
- Trỏ DNS của tên miền API, ví dụ `api.example.com`, tới server và cấu hình HTTPS bằng reverse proxy như Nginx hoặc Caddy.
- Đặt `SQLITE_PATH` trên volume/ổ đĩa bền vững và sao lưu cả file SQLite lẫn thư mục `server/uploads`.
- Nút khôi phục trong trang quản trị có thể nhập dữ liệu từ các khối `COPY` của file dump PostgreSQL `dulieu_webgis_2026-04-02.sql` vào SQLite. Thao tác này thay thế dữ liệu hiện có trong các bảng tương ứng.
- Mật khẩu được hash bằng bcrypt. Khi backend khởi động hoặc nhập dump cũ, các mật khẩu plaintext hiện có được tự động chuyển thành hash. Dùng `ADMIN_PASSWORD` để đặt mật khẩu admin khi tạo database mới và `BCRYPT_ROUNDS` để điều chỉnh cost trong khoảng `10-15` (mặc định `12`).
- API quản trị dùng JWT Bearer và phân quyền `admin`/`editor`. Production bắt buộc khai báo `JWT_SECRET`; token mặc định hết hạn sau `8h`, có thể đổi bằng `JWT_EXPIRES_IN`.
- Các request ghi dữ liệu và route parameter được kiểm tra schema, giới hạn kích thước trường; form liên hệ bị giới hạn 5 request mỗi 10 phút trên mỗi IP.
- Production yêu cầu `ADMIN_PASSWORD` tối thiểu 12 ký tự khi tạo người dùng đầu tiên. API chặn tự xóa/tự hạ quyền và không cho xóa admin cuối cùng.
- Upload chỉ nhận JPEG, PNG, GIF hoặc WebP tối đa 5 MB; backend xác minh chữ ký nội dung, tự đặt UUID và phần mở rộng thay vì tin tên file từ client.

