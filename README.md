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
- **Database:** PostgreSQL (pg).
- **Styling:** Lucide React (Icons).

## 📂 Cấu trúc dự án

- `src/components/`: Chứa các component dùng chung (Layout, SkyBackground...).
- `src/pages/`: Các trang giao diện chính (Home, Admin, Blog...).
- `src/server/`: Backend API với Express và logic kết nối cơ sở dữ liệu.
- `src/public/`: Các tài nguyên tĩnh và các trang index tùy biến (Neon, Cyberpunk).
- `src/utils/`: Các hàm hỗ trợ (Storage, helper functions).

## 🏁 Hướng dẫn cài đặt và chạy thử

### Tiền đề
- **Node.js** (Phiên bản mới nhất)
- **PostgreSQL** (Để lưu trữ dữ liệu bản đồ và nội dung)

### Các bước thực hiện

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Thiết lập các biến môi trường cần thiết trong file `.env` hoặc cấu hình tương ứng cho Backend.

3. **Khởi tạo Database:**
   Sử dụng các file `.sql` kèm theo (`schema.sql`, `dulieu_webgis_2026-04-02.sql`) để nạp dữ liệu vào PostgreSQL.

4. **Chạy ở chế độ Development:**
   ```bash
   npm run dev
   ```

5. **Build & Chạy Production:**
   ```bash
   npm start
   ```

## 📄 Ghi chú
Dự án được khởi tạo từ AI Studio và được tùy chỉnh chuyên sâu cho mục đích quản lý WebGIS không gian.

