const { Pool } = require('pg');

// CẤU HÌNH DATABASE TRỰC TIẾP TẠI ĐÂY
// Hãy thay đổi các giá trị bên dưới cho đúng với PostgreSQL của bạn
const pool = new Pool({
  user: 'postgres.rxxotaqssdzlxvwmapfd',
  password: '543457@@!!Thai',
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};