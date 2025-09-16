// Production API Server for AeroSafe Documentation
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.SITE_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// JWT configuration
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ae5f2d8b9c3e1a7d4f6b2c8e9a3f5d7b1e4c6a8d2f9b3e7c1a5d8f2b4e7c9a1d';
const TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '8h';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Get credentials from environment
    const validUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
    const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'AeroSafe2024#Secure!';
    
    // Verify credentials (constant-time comparison to prevent timing attacks)
    const usernameMatch = crypto.timingSafeEqual(
      Buffer.from(username),
      Buffer.from(validUsername)
    );
    const passwordMatch = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(validPassword)
    );

    if (!usernameMatch || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ 
      success: true, 
      token,
      user: { username, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In production, you might want to blacklist the token
  res.json({ success: true });
});

// File management endpoints (protected)
const DOCS_DIR = path.join(__dirname, 'docs');
const BLOG_DIR = path.join(__dirname, 'blog');

// List files
app.get('/api/files/:directory', authenticateToken, async (req, res) => {
  try {
    const { directory } = req.params;
    const dir = directory === 'blog' ? BLOG_DIR : DOCS_DIR;
    
    const files = await fs.readdir(dir, { withFileTypes: true });
    const fileList = await Promise.all(
      files
        .filter(file => file.name.endsWith('.md') || file.name.endsWith('.mdx'))
        .map(async file => {
          const filePath = path.join(dir, file.name);
          const stats = await fs.stat(filePath);
          return {
            name: file.name,
            path: `${directory}/${file.name}`,
            size: stats.size,
            lastModified: stats.mtime,
            isMarkdown: true,
            type: 'file'
          };
        })
    );
    
    res.json(fileList);
  } catch (error) {
    console.error('File list error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Read file
app.get('/api/file/:directory/:filename', authenticateToken, async (req, res) => {
  try {
    const { directory, filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const dir = directory === 'blog' ? BLOG_DIR : DOCS_DIR;
    const filePath = path.join(dir, filename);
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content, path: `${directory}/${filename}` });
  } catch (error) {
    console.error('File read error:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// Save file
app.put('/api/file/:directory/:filename', authenticateToken, async (req, res) => {
  try {
    const { directory, filename } = req.params;
    const { content } = req.body;
    
    // Validate filename
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const dir = directory === 'blog' ? BLOG_DIR : DOCS_DIR;
    const filePath = path.join(dir, filename);
    
    // Create backup
    const backupDir = path.join(dir, '.backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `${filename}.${Date.now()}.bak`);
    
    try {
      const originalContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, originalContent);
    } catch (err) {
      // File might not exist yet
    }
    
    // Save new content
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ 
      success: true, 
      message: 'File saved successfully',
      backup: backupPath
    });
  } catch (error) {
    console.error('File save error:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Create file
app.post('/api/file/:directory', authenticateToken, async (req, res) => {
  try {
    const { directory } = req.params;
    const { filename, content = '' } = req.body;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) {
      return res.status(400).json({ error: 'Filename must end with .md or .mdx' });
    }
    
    const dir = directory === 'blog' ? BLOG_DIR : DOCS_DIR;
    const filePath = path.join(dir, filename);
    
    // Check if file already exists
    try {
      await fs.access(filePath);
      return res.status(409).json({ error: 'File already exists' });
    } catch (err) {
      // File doesn't exist, good to create
    }
    
    // Create file
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ 
      success: true, 
      message: 'File created successfully',
      path: `${directory}/${filename}`
    });
  } catch (error) {
    console.error('File create error:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// Delete file
app.delete('/api/file/:directory/:filename', authenticateToken, async (req, res) => {
  try {
    const { directory, filename } = req.params;
    
    // Validate filename
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const dir = directory === 'blog' ? BLOG_DIR : DOCS_DIR;
    const filePath = path.join(dir, filename);
    
    // Create backup before deletion
    const backupDir = path.join(dir, '.backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `${filename}.deleted.${Date.now()}.bak`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, content);
    
    // Delete file
    await fs.unlink(filePath);
    
    res.json({ 
      success: true, 
      message: 'File deleted successfully',
      backup: backupPath
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});