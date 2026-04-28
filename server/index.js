
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Import multer
const db = require('./db');

const app = express();
// Đặt cổng cứng là 5001
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
    const userCheck = await db.query('SELECT count(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('[System] Seeding default admin...');
      await db.query(`
        INSERT INTO users (id, username, password, display_name, role) 
        VALUES ('admin-01', 'admin', '123', 'Administrator', 'admin')
      `);
    }

    // 2. Settings Table (Use JSONB for complex fields)
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_name_prefix VARCHAR(100),
        site_name_suffix VARCHAR(100),
        footer_description TEXT,
        footer_copyright VARCHAR(255),
        navigation JSONB,
        social_links JSONB,
        logo_url TEXT,
        favicon_url TEXT,
        about_content TEXT,
        contact_content TEXT,
        page_title VARCHAR(255)
      );
    `);
    
    // Seed Settings
    const settingsCheck = await db.query('SELECT count(*) FROM settings');
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
        tags JSONB, 
        image_url TEXT,
        read_time VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Messages Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_status BOOLEAN DEFAULT FALSE
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
    const catCheck = await db.query('SELECT count(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await db.query('INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cat.id, cat.name]);
      }
    }
    
    // Migration for new columns (safe to keep)
    try {
        await db.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_content TEXT;`);
        await db.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS contact_content TEXT;`);
        await db.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS page_title VARCHAR(255);`);
        // Ensure JSONB types if upgrading from older schema
        await db.query(`ALTER TABLE settings ALTER COLUMN navigation TYPE JSONB USING navigation::JSONB;`);
        await db.query(`ALTER TABLE settings ALTER COLUMN social_links TYPE JSONB USING social_links::JSONB;`);
        await db.query(`ALTER TABLE posts ALTER COLUMN tags TYPE JSONB USING tags::JSONB;`);
    } catch (e) { 
        // Ignore errors if types are already correct or columns exist
    }

    console.log('[System] Database Schema Verified & Updated.');
  } catch (err) {
    console.error('[System] CRITICAL DB INIT ERROR:', err);
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

const upload = multer({ storage: storage });

// --- STATIC FILE SERVING ---
app.use('/api/uploads', express.static(uploadDir));
app.use('/uploads', express.static(uploadDir));

// Route Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

// Helper: Fix URL nếu thiếu /api
const fixUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('/uploads/')) {
    return '/api' + url;
  }
  return url;
};

// --- API ROUTES ---

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
        navigation: s.navigation,
        socialLinks: s.social_links,
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

app.post('/api/settings', async (req, res) => {
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
        JSON.stringify(s.navigation), // FIX: Stringify explicitly for JSONB
        JSON.stringify(s.socialLinks), // FIX: Stringify explicitly for JSONB
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

app.post('/api/categories', async (req, res) => {
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

app.delete('/api/categories/:id', async (req, res) => {
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
      tags: p.tags, // JSONB returns object/array automatically
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
        tags: p.tags,
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

app.post('/api/posts', async (req, res) => {
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

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Users
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length > 0) {
      const u = result.rows[0];
      res.json({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        role: u.role
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, display_name as "displayName", role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/users', async (req, res) => {
  const u = req.body;
  try {
    const check = await db.query('SELECT id FROM users WHERE id = $1', [u.id]);
    if (check.rows.length > 0) {
      await db.query(
        `UPDATE users SET username=$1, password=$2, display_name=$3, role=$4 WHERE id=$5`,
        [u.username, u.password, u.displayName, u.role, u.id]
      );
    } else {
      await db.query(
        `INSERT INTO users (id, username, password, display_name, role) VALUES ($1, $2, $3, $4, $5)`,
        [u.id, u.username, u.password, u.displayName, u.role]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
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

app.get('/api/messages', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
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

// Serve Static Files for Build
app.use(express.static(path.join(__dirname, '../dist'), {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Initialize DB then Start Server
initDb().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Routes registered: /api/messages, /api/posts, /api/users, /api/settings, /api/categories');
    });
});
