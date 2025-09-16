const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const chokidar = require('chokidar');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Security Configuration
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    'http://localhost:7112',
    'http://localhost:3000',
    'https://docs.aerosafe.it'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

// JWT Configuration
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('AeroSafe2024#Admin', 10);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { username, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Document Management Routes
const DOCS_DIR = path.join(__dirname, 'docs');
const BLOG_DIR = path.join(__dirname, 'blog');

// Get all documents
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const documents = [];
    
    // Read docs directory
    const docFiles = await fs.readdir(DOCS_DIR, { recursive: true });
    for (const file of docFiles) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const filePath = path.join(DOCS_DIR, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          const content = await fs.readFile(filePath, 'utf-8');
          const { data, content: markdown } = matter(content);
          
          documents.push({
            path: `/docs/${file}`,
            name: data.title || path.basename(file, path.extname(file)),
            frontMatter: data,
            lastModified: stat.mtime,
            type: 'doc'
          });
        }
      }
    }
    
    // Read blog directory
    const blogFiles = await fs.readdir(BLOG_DIR, { recursive: true });
    for (const file of blogFiles) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const filePath = path.join(BLOG_DIR, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          const content = await fs.readFile(filePath, 'utf-8');
          const { data } = matter(content);
          
          documents.push({
            path: `/blog/${file}`,
            name: data.title || path.basename(file, path.extname(file)),
            frontMatter: data,
            lastModified: stat.mtime,
            type: 'blog'
          });
        }
      }
    }
    
    res.json(documents);
  } catch (error) {
    console.error('Error reading documents:', error);
    res.status(500).json({ error: 'Failed to read documents' });
  }
});

// Get single document
app.get('/api/documents/*', authenticateToken, async (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = docPath.startsWith('blog/') 
      ? path.join(BLOG_DIR, docPath.replace('blog/', ''))
      : path.join(DOCS_DIR, docPath.replace('docs/', ''));
    
    const content = await fs.readFile(fullPath, 'utf-8');
    const stat = await fs.stat(fullPath);
    const { data, content: markdown } = matter(content);
    
    res.json({
      path: docPath,
      content: content,
      frontMatter: data,
      markdown: markdown,
      lastModified: stat.mtime
    });
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(404).json({ error: 'Document not found' });
  }
});

// Save document
app.post('/api/documents/save', authenticateToken, async (req, res) => {
  try {
    const { path: docPath, content } = req.body;
    
    if (!docPath || !content) {
      return res.status(400).json({ error: 'Path and content required' });
    }
    
    const fullPath = docPath.startsWith('/blog/') 
      ? path.join(BLOG_DIR, docPath.replace('/blog/', ''))
      : path.join(DOCS_DIR, docPath.replace('/docs/', ''));
    
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
    
    res.json({ 
      success: true, 
      message: 'Document saved successfully',
      path: docPath 
    });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// Create new document
app.post('/api/documents/create', authenticateToken, async (req, res) => {
  try {
    const { name, type = 'doc', content } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Document name required' });
    }
    
    const fileName = name.toLowerCase().replace(/\s+/g, '-') + '.md';
    const docPath = type === 'blog' 
      ? path.join(BLOG_DIR, fileName)
      : path.join(DOCS_DIR, fileName);
    
    // Check if file exists
    try {
      await fs.access(docPath);
      return res.status(409).json({ error: 'Document already exists' });
    } catch {
      // File doesn't exist, continue
    }
    
    const defaultContent = content || `---
title: ${name}
sidebar_position: 999
---

# ${name}

Start writing your content here...
`;
    
    await fs.writeFile(docPath, defaultContent, 'utf-8');
    
    res.json({ 
      success: true,
      path: `/${type === 'blog' ? 'blog' : 'docs'}/${fileName}`,
      message: 'Document created successfully' 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Delete document
app.delete('/api/documents/*', authenticateToken, async (req, res) => {
  try {
    const docPath = req.params[0];
    const fullPath = docPath.startsWith('blog/') 
      ? path.join(BLOG_DIR, docPath.replace('blog/', ''))
      : path.join(DOCS_DIR, docPath.replace('docs/', ''));
    
    await fs.unlink(fullPath);
    
    res.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: http://localhost:7112`);
});