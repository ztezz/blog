# CosmoGIS Website

CosmoGIS là một nền tảng WebGIS hiện đại kết hợp giữa công nghệ bản đồ và hiệu ứng không gian (Space/Galaxy) độc đáo, được xây dựng trên nền tảng React, Vite và Three.js.

## 🚀 Tính năng chính

- **Giao diện Space/Sky:** Hiệu ứng nền bầu trời sao và không gian ảo diệu (React Three Fiber).
- **Hệ thống Quản lý Nội dung (CMS):** Quản lý bài viết (Blog), danh mục và cài đặt hệ thống.
- **Dashboard Admin:** Quản trị viên có thể điều phối người dùng, hộp thư và nội dung.
- **WebGIS:** Tích hợp dữ liệu bản đồ chuyên sâu (SQL/PostgreSQL).
- **Phản hồi người dùng:** Hệ thống Mailbox để tiếp nhận liên hệ và phản hồi.

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 18, Vite, React Router DOM.
- **3D/Graphics:** Three.js, @react-three/fiber, @react-three/drei.
- **Backend:** Node.js, Express.
- **Database:** SQLite (`better-sqlite3`).
- **Styling:** Lucide React (Icons).

## 📂 Cấu trúc dự án

- `src/components/`: Chứa các component dùng chung (Layout, SkyBackground...).
- `src/pages/`: Các trang giao diện chính (Home, Admin, Blog...).
- `server/`: Backend API với Express và cơ sở dữ liệu SQLite.
- `src/public/`: Các tài nguyên tĩnh và các trang index tùy biến (Neon, Cyberpunk).
- `src/utils/`: Các hàm hỗ trợ (Storage, helper functions).

## 🏁 Hướng dẫn cài đặt và chạy thử

### Tiền đề
- **Node.js 22 trở lên**
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

## Triển khai frontend trên Cloudflare Pages

- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Deploy command: để trống vì Cloudflare Pages tự xuất bản thư mục `dist` sau khi build.
- Environment variable: `VITE_API_URL=https://api.example.com/api`
- SPA fallback được cấu hình trong `wrangler.jsonc` khi triển khai bằng Workers Builds.

Nếu dùng Cloudflare Workers Builds thay vì Pages, sử dụng deploy command `npx wrangler deploy`. File `wrangler.jsonc` đã cấu hình `dist` là static assets và bật SPA fallback mà không phụ thuộc vào phiên bản Vite.

## Triển khai backend trên server riêng

- Cài dependencies bằng `npm ci`.
- Khai báo `SQLITE_PATH`, `PORT`, `FRONTEND_URL` và `PUBLIC_API_URL` trong môi trường của server.
- `FRONTEND_URL` có thể chứa nhiều tên miền, phân cách bằng dấu phẩy, ví dụ `https://project.pages.dev,https://www.example.com`.
- Chạy API bằng `npm run start:backend`. Backend không còn build hoặc phục vụ frontend.
- Trỏ DNS của tên miền API, ví dụ `api.example.com`, tới server và cấu hình HTTPS bằng reverse proxy như Nginx hoặc Caddy.
- Đặt `SQLITE_PATH` trên volume/ổ đĩa bền vững và sao lưu cả file SQLite lẫn thư mục `server/uploads`.
- Nút khôi phục trong trang quản trị có thể nhập dữ liệu từ các khối `COPY` của file dump PostgreSQL `dulieu_webgis_2026-04-02.sql` vào SQLite. Thao tác này thay thế dữ liệu hiện có trong các bảng tương ứng.

## 📄 Ghi chú
Dự án được khởi tạo từ AI Studio và được tùy chỉnh chuyên sâu cho mục đích quản lý WebGIS không gian.

