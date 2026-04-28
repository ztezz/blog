const { Pool } = require('pg');

// CẤU HÌNH DATABASE TRỰC TIẾP TẠI ĐÂY
// Hãy thay đổi các giá trị bên dưới cho đúng với PostgreSQL của bạn
const pool = new Pool({
  user: 'postgres',       // Tên user mặc định thường là postgres
  password: '123456thai',        // Điền mật khẩu database của bạn vào đây
  host: '103.163.119.228',      // Server database
  port: 5432,             // Cổng mặc định của PostgreSQL
  database: 'Website',   // Tên database bạn đã tạo
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};