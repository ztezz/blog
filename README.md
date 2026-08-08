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

## Tự động tạo bài viết bằng AI

Backend có thể lấy dữ kiện từ danh sách RSS/Atom và website cho phép, sau đó gọi API OpenAI-compatible của 9Router để viết và đăng tối đa một bài trong mỗi lượt chạy.

1. Cài và chạy 9Router: `npm install -g 9router`, sau đó `9router`.
2. Cấu hình provider/model hoặc combo trong dashboard 9Router.
3. Nếu 9Router chạy cùng máy backend, dùng `AI_BASE_URL=http://localhost:20128/v1`. Nếu backend ở server khác, dùng tunnel/instance 9Router mà server truy cập được; `localhost` của server không trỏ về máy cá nhân.
4. Mở **Cài đặt > Tự động AI** trong trang quản trị, nhập model, nguồn, giờ chạy rồi lưu. Các biến `AI_*` trong `.env` chỉ dùng để seed lần đầu khi database chưa có cấu hình.
5. Chạy thử bằng nút **Tạo bài AI** trong dashboard quản trị. Khi kết quả đúng, bật lịch tự động trong tab cấu hình AI.

Ví dụ:

```env
AI_AUTOMATION_ENABLED=true
AI_BASE_URL=http://localhost:20128/v1
AI_API_KEY=
AI_MODEL=my-writing-combo
AI_RUN_HOUR_UTC=1
AI_RSS_FEEDS=https://example.com/feed.xml,https://example.org/atom.xml
AI_WEBSITE_URLS=https://example.com/news
```

- Chỉ thêm nguồn bạn được phép xử lý và tuân thủ điều khoản sử dụng, bản quyền, robots.txt của từng website.
- Có thể bật **Tự tìm nguồn theo chủ đề**. Hệ thống tự kết hợp tên website và các danh mục CMS, cộng thêm từ khóa bạn nhập, rồi dùng DuckDuckGo HTML Search để lấy URL ứng viên.
- DuckDuckGo chỉ dùng để tìm URL. Backend tải và kiểm tra bài nguồn thật; sau đó model 9Router mới đọc dữ kiện, biên tập lại bài tiếng Việt, chọn danh mục và tạo tags. Vì vậy không cần cấu hình model search riêng.
- Danh sách domain cho phép có thể để trống để nhận mọi public domain. Domain chặn luôn được ưu tiên và áp dụng cho cả subdomain. URL do AI trả vẫn phải qua DNS/private-IP, robots.txt, timeout, kích thước, chống trùng và bước tải bài thật; URL bịa sẽ tự thất bại.
- Bot không sao chép HTML nguồn. Nội dung nguồn được chuyển thành văn bản dữ kiện, AI được yêu cầu viết lại, bài cuối được sanitize và tự thêm liên kết nguồn tham khảo.
- URL và hash nội dung nguồn được chống trùng bằng bảng `ai_generation_log`, tránh đăng lại cùng một tin được syndicate qua nhiều website; nhiều process không thể đồng thời nhận cùng một nguồn. Lỗi nguồn được ghi lại để nguồn khác vẫn tiếp tục.
- Endpoint admin: `GET/POST /api/automation/settings`, `GET /api/automation/status`, `GET /api/automation/history`, `POST /api/automation/run`.
- Mỗi lượt chạy có heartbeat, deadline và ngân sách riêng cho số nguồn, số lượt gọi model và tổng thời gian. Backend tự đánh dấu run mất heartbeat là gián đoạn, giải phóng đúng source thuộc run đó và không cần dọn toàn bộ hàng đợi.
- Bước hoàn tất được commit bằng một transaction SQLite: xác nhận run vẫn giữ lease, lưu bài, cập nhật source log và đóng run cùng lúc. Nếu một bước mất ownership hoặc lỗi database, toàn bộ thay đổi được rollback để tránh bài mồ côi và lịch sử sai trạng thái.
- Dashboard lưu timeline, structured error, model calls và source attempts cho từng run. Có thể mở chi tiết 10 lượt gần nhất và chạy lại source cũ với model override hoặc tắt ảnh mà không thay đổi cấu hình toàn cục.
- Nút **Kiểm tra kết nối** không chỉ đọc danh sách model mà còn gọi schema probe `{ "ok": true }`, cho biết model có hỗ trợ JSON mode trực tiếp hay phải dùng fallback.
- Khi model trả JSON sai schema, backend cho phép đúng một lượt sửa cấu trúc với `temperature: 0`; lượt sửa không được thêm dữ kiện, URL hoặc citation mới. JSON vẫn sai sẽ dừng toàn lượt với danh sách trường lỗi rút gọn.
- API vận hành bổ sung: `GET /api/automation/runs`, `GET /api/automation/runs/:id`, `POST /api/automation/runs/:id/rerun` và `POST /api/automation/cancel`.
- API key được lưu trong SQLite nhưng endpoint đọc chỉ trả trạng thái có/không, không bao giờ trả secret về trình duyệt. Để trống ô key khi lưu sẽ giữ key cũ; thao tác xóa phải được chọn rõ ràng.
- API key trong file SQLite là secret at rest: giới hạn quyền đọc file database/backup và chỉ nhập key nếu endpoint 9Router thực sự yêu cầu. 9Router chạy local thường có thể để trống.
- Chế độ hiện tại đăng bài ngay theo lựa chọn của bạn. Nên thường xuyên kiểm tra lịch sử và nội dung vì AI vẫn có thể tạo thông tin sai dù prompt yêu cầu không bịa dữ kiện.
- Khi triển khai thay đổi automation, cập nhật backend trước rồi mới cập nhật frontend để migration SQLite và API contract mới sẵn sàng trước khi giao diện gửi các trường ngân sách/rerun.

