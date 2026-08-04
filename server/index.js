
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Import multer
const db = require('./db');

const app = express();
const port = Number(process.env.PORT || 5001);
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:4000')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const publicApiUrl = (process.env.PUBLIC_API_URL || `http://localhost:${port}`).replace(/\/$/, '');
const passwordRounds = Number(process.env.BCRYPT_ROUNDS || 12);
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'development-only-secret' : '');
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';
const isPasswordHash = (password) => /^\$2[aby]\$\d{2}\$/.test(password || '');

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required when NODE_ENV=production');
}

const authenticate = (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication required' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  return next();
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' }
});

const hashPlaintextPasswords = async () => {
  const result = await db.query('SELECT id, password FROM users');
  const plaintextUsers = result.rows.filter(user => !isPasswordHash(user.password));

  for (const user of plaintextUsers) {
    const passwordHash = await bcrypt.hash(user.password, passwordRounds);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, user.id]);
  }

  if (plaintextUsers.length > 0) {
    console.log(`[System] Hashed ${plaintextUsers.length} plaintext password(s).`);
  }
};

// Middleware
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || frontendOrigins.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error(`Origin not allowed by CORS: ${origin}`);
    error.status = 403;
    return callback(error);
  }
}));
app.use(bodyParser.json({ limit: '1mb' }));

app.use((err, req, res, next) => {
  if (err.status === 403) {
    return res.status(403).json({ error: err.message });
  }
  return next(err);
});

// Logger middleware (chỉ log API request cơ bản)
app.use((req, res, next) => {
  // Bỏ qua log cho các file tĩnh để tránh spam console
  if (!req.url.startsWith('/api/uploads') && !req.url.startsWith('/uploads')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// --- CONSTANTS FOR SEEDING ---
const INITIAL_CATEGORIES = [
  { id: 'gis-basic', name: 'GIS Cơ Bản & Nâng Cao' },
  { id: 'earth-obs', name: 'Quan Sát Trái Đất' },
  { id: 'solar-system', name: 'Hệ Mặt Trời' },
  { id: 'space-tech', name: 'Công Nghệ Vũ Trụ' },
];

// --- AUTO MIGRATION (Tự động cập nhật Database khi khởi động) ---
const initDb = async () => {
  try {
    console.log('[System] Checking Database Schema...');
    
    // 1. Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'editor'
      );
    `);

    // Seed Admin User
    const userCheck = await db.query('SELECT count(*) AS count FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('[System] Seeding default admin...');
      const defaultAdminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123', passwordRounds);
      await db.query(
        'INSERT INTO users (id, username, password, display_name, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin-01', 'admin', defaultAdminHash, 'Administrator', 'admin']
      );
    }

    await hashPlaintextPasswords();

    // 2. Settings Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_name_prefix VARCHAR(100),
        site_name_suffix VARCHAR(100),
        footer_description TEXT,
        footer_copyright VARCHAR(255),
        navigation TEXT,
        social_links TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        about_content TEXT,
        contact_content TEXT,
        page_title VARCHAR(255)
      );
    `);
    
    // Seed Settings
    const settingsCheck = await db.query('SELECT count(*) AS count FROM settings');
    if (parseInt(settingsCheck.rows[0].count) === 0) {
        console.log('[System] Seeding default settings...');
        const defaultNav = JSON.stringify([
            { id: 'home', label: 'Trang Chủ', path: '/', isExternal: false },
            { id: 'blog', label: 'Bài Viết', path: '/blog', isExternal: false },
            { id: 'about', label: 'Giới Thiệu', path: '/about', isExternal: false },
            { id: 'contact', label: 'Liên Hệ', path: '/contact', isExternal: false }
        ]);
        const defaultSocial = JSON.stringify({ facebook: '#', twitter: '#', linkedin: '#' });
        await db.query(`
            INSERT INTO settings (id, site_name_prefix, site_name_suffix, footer_description, footer_copyright, navigation, social_links, page_title)
            VALUES (1, 'COSMO', 'GIS', 'Khám phá vũ trụ thông qua lăng kính dữ liệu không gian.', '© 2023 CosmoGIS.', $1, $2, 'CosmoGIS - Bản Đồ Của Vũ Trụ')
        `, [defaultNav, defaultSocial]);
    }

    // 3. Posts Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        excerpt TEXT,
        content TEXT,
        author VARCHAR(100),
        date VARCHAR(20),
        category VARCHAR(50),
        tags TEXT,
        image_url TEXT,
        read_time VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Messages Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_status INTEGER DEFAULT 0
      );
    `);

    // 5. Categories Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
     // Seed Categories
    const catCheck = await db.query('SELECT count(*) AS count FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await db.query('INSERT OR IGNORE INTO categories (id, name) VALUES ($1, $2)', [cat.id, cat.name]);
      }
    }

    console.log(`[System] SQLite database ready: ${db.databasePath}`);
  } catch (err) {
    console.error('[System] CRITICAL DB INIT ERROR:', err);
    throw err;
  }
};

// --- FILE UPLOAD CONFIGURATION ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
});

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, GIF and WebP images are allowed'));
    }
    return callback(null, true);
  }
});

// --- STATIC FILE SERVING ---
app.use('/api/uploads', express.static(uploadDir));
app.use('/uploads', express.static(uploadDir));

// Route Upload
app.post('/api/upload', authenticate, authorize('admin', 'editor'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `${publicApiUrl}/api/uploads/${req.file.filename}` });
});

// Return absolute media URLs because the frontend and API use different domains.
const fixUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('/uploads/')) {
    return publicApiUrl + '/api' + url;
  }
  if (url.startsWith('/')) {
    return publicApiUrl + url;
  }
  return url;
};

// --- API ROUTES ---

app.get('/', (req, res) => {
  res.json({
    service: 'CosmoGIS API',
    status: 'ok',
    health: '/health',
    api: '/api'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 0. Database Restore
app.post('/api/restore-db', authenticate, authorize('admin'), async (req, res) => {
  try {
    const sqlFilePath = path.join(__dirname, '..', 'dulieu_webgis_2026-04-02.sql');
    if (!fs.existsSync(sqlFilePath)) {
      return res.status(404).json({ error: 'File SQL không tồn tại!' });
    }

    const imported = db.importPostgresDump(fs.readFileSync(sqlFilePath, 'utf8'));
    await hashPlaintextPasswords();
    console.log('[System] PostgreSQL dump imported into SQLite:', imported);
    res.json({ message: 'Khôi phục dữ liệu vào SQLite thành công!', imported });
  } catch (err) {
    console.error('Restore Error:', err);
    res.status(500).json({ error: 'Khôi phục database thất bại: ' + err.message });
  }
});

// 1. Settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length > 0) {
      const s = result.rows[0];
      res.json({
        siteNamePrefix: s.site_name_prefix,
        siteNameSuffix: s.site_name_suffix,
        logoUrl: fixUrl(s.logo_url),
        faviconUrl: fixUrl(s.favicon_url),
        footerDescription: s.footer_description,
        footerCopyright: s.footer_copyright,
        navigation: JSON.parse(s.navigation || '[]'),
        socialLinks: JSON.parse(s.social_links || '{}'),
        aboutContent: s.about_content,
        contactContent: s.contact_content,
        pageTitle: s.page_title
      });
    } else {
      res.status(404).json({ error: 'Settings not found' });
    }
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.post('/api/settings', authenticate, authorize('admin'), async (req, res) => {
  const s = req.body;
  try {
    await db.query(
      `UPDATE settings SET 
        site_name_prefix=$1, 
        site_name_suffix=$2, 
        footer_description=$3, 
        footer_copyright=$4, 
        navigation=$5, 
        social_links=$6, 
        logo_url=$7, 
        favicon_url=$8,
        about_content=$9,
        contact_content=$10,
        page_title=$11
       WHERE id = 1`,
      [
        s.siteNamePrefix, 
        s.siteNameSuffix, 
        s.footerDescription, 
        s.footerCopyright, 
        JSON.stringify(s.navigation),
        JSON.stringify(s.socialLinks),
        s.logoUrl,
        s.faviconUrl,
        s.aboutContent,
        s.contactContent,
        s.pageTitle
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Categories (NEW)
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/categories', authenticate, authorize('admin'), async (req, res) => {
  const c = req.body;
  try {
    // Check exist
    const check = await db.query('SELECT id FROM categories WHERE id = $1', [c.id]);
    if (check.rows.length > 0) {
      await db.query('UPDATE categories SET name=$1 WHERE id=$2', [c.name, c.id]);
    } else {
      await db.query('INSERT INTO categories (id, name) VALUES ($1, $2)', [c.id, c.name]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/categories/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});


// 3. Posts
app.get('/api/posts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    const posts = result.rows.map(p => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      author: p.author,
      date: p.date,
      category: p.category,
      tags: JSON.parse(p.tags || '[]'),
      imageUrl: fixUrl(p.image_url),
      readTime: p.read_time
    }));
    res.json(posts);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      const p = result.rows[0];
      res.json({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        author: p.author,
        date: p.date,
        category: p.category,
        tags: JSON.parse(p.tags || '[]'),
        imageUrl: fixUrl(p.image_url),
        readTime: p.read_time
      });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/posts', authenticate, authorize('admin', 'editor'), async (req, res) => {
  const p = req.body;
  try {
    const check = await db.query('SELECT id FROM posts WHERE id = $1', [p.id]);
    if (check.rows.length > 0) {
      await db.query(
        `UPDATE posts SET title=$1, excerpt=$2, content=$3, author=$4, date=$5, category=$6, tags=$7, image_url=$8, read_time=$9 WHERE id=$10`,
        [p.title, p.excerpt, p.content, p.author, p.date, p.category, JSON.stringify(p.tags), p.imageUrl, p.readTime, p.id]
      );
    } else {
      await db.query(
        `INSERT INTO posts (id, title, excerpt, content, author, date, category, tags, image_url, read_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [p.id, p.title, p.excerpt, p.content, p.author, p.date, p.category, JSON.stringify(p.tags), p.imageUrl, p.readTime]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/posts/:id', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Users
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const u = result.rows[0];
    if (u && await bcrypt.compare(password || '', u.password)) {
      const token = jwt.sign(
        { sub: u.id, username: u.username, role: u.role },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );
      res.json({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        role: u.role,
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, display_name as "displayName", role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/users', authenticate, authorize('admin'), async (req, res) => {
  const u = req.body;
  try {
    const check = await db.query('SELECT id FROM users WHERE id = $1', [u.id]);
    if (check.rows.length > 0) {
      if (u.password) {
        const passwordHash = await bcrypt.hash(u.password, passwordRounds);
        await db.query(
          `UPDATE users SET username=$1, password=$2, display_name=$3, role=$4 WHERE id=$5`,
          [u.username, passwordHash, u.displayName, u.role, u.id]
        );
      } else {
        await db.query(
          `UPDATE users SET username=$1, display_name=$2, role=$3 WHERE id=$4`,
          [u.username, u.displayName, u.role, u.id]
        );
      }
    } else {
      if (!u.password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      const passwordHash = await bcrypt.hash(u.password, passwordRounds);
      await db.query(
        `INSERT INTO users (id, username, password, display_name, role) VALUES ($1, $2, $3, $4, $5)`,
        [u.id, u.username, passwordHash, u.displayName, u.role]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 5. Messages (Hộp thư)
app.post('/api/messages', async (req, res) => {
  const m = req.body;
  console.log('[API] Receiving message from:', m.email); // Debug log
  try {
    await db.query(
      `INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
      [m.name, m.email, m.subject, m.message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/messages', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/messages/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- QUAN TRỌNG: API 404 Handler ---
// Đây là nguyên nhân trả về lỗi 404 nếu route ở trên chưa được đăng ký
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message?.startsWith('Only ')) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(err.status || 500).json({ error: 'Internal server error' });
});

// Initialize DB then Start Server
initDb().then(() => {
    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
      console.log('Routes registered: /api/messages, /api/posts, /api/users, /api/settings, /api/categories');
    });
});
