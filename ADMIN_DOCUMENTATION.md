# AeroSafe Admin Panel Documentation

## Overview

The AeroSafe Admin Panel is a secure, web-based content management system integrated into the Docusaurus documentation website. It allows authorized administrators to create, edit, and manage Markdown documentation files directly through a browser interface.

## Features

### 🔐 Secure Authentication
- JWT-based authentication with bcrypt password hashing
- Configurable session timeout (default: 8 hours)
- Rate limiting with account lockout after 5 failed attempts
- Automatic session extension for active users

### 📝 Content Management
- Full-featured Markdown editor with live preview
- Syntax highlighting and auto-completion
- Frontmatter editor for document metadata
- File browser with search functionality
- Support for both `/docs` and `/blog` directories

### 🛡️ Security Features
- Environment variable-based credentials
- Automatic file backups before editing
- Path validation to prevent directory traversal
- Session monitoring and validation
- Comprehensive activity logging

### 🎨 User Experience
- Responsive design that works on desktop and mobile
- Dark mode support
- Real-time save status indicators
- Keyboard shortcuts (Ctrl+S for save)
- Comprehensive error handling and user feedback

## Installation & Setup

### 1. Prerequisites
The admin system is already integrated into the AeroSafe Docusaurus site. Ensure you have:
- Node.js 18+ installed
- All project dependencies installed (`npm install`)

### 2. Configure Environment Variables

Edit the `.env` file and update the admin credentials:

```bash
# Admin Authentication - CHANGE THESE VALUES!
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
ADMIN_JWT_SECRET=your_super_secure_jwt_secret_here
ADMIN_TOKEN_EXPIRY=8h

# Security Settings
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_LOCKOUT_DURATION=900000    # 15 minutes in milliseconds
ADMIN_SESSION_TIMEOUT=28800000   # 8 hours in milliseconds
```

### 3. Generate Secure Password Hash

Use the built-in utility to generate a secure password hash:

```javascript
// Run this in a Node.js environment or browser console
const bcrypt = require('bcryptjs');
const password = 'your_secure_password';
const hash = bcrypt.hashSync(password, 12);
console.log('Your password hash:', hash);
```

Or use the auth service directly:

```javascript
import { generateAdminHash } from './src/utils/auth';
const hash = await generateAdminHash('your_secure_password');
console.log('Password hash:', hash);
```

### 4. Set Strong JWT Secret

Generate a strong JWT secret (at least 32 characters):

```bash
openssl rand -base64 32
```

## Usage Guide

### Accessing the Admin Panel

1. Navigate to `/admin/login` on your site
2. Enter your admin credentials
3. Click "Sign In" to authenticate

**Default Development Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Security Warning:** Change these credentials immediately in production!

### Admin Dashboard

Once authenticated, you'll see the admin dashboard with three main sections:

#### 📁 File Manager
- **Documentation Tab**: Manage files in the `/docs` directory
- **Blog Tab**: Manage files in the `/blog` directory
- **Search**: Find files by name or content
- **New File**: Create new Markdown documents
- **Refresh**: Reload the file list

#### ✏️ Editor
- **Monaco Editor**: Full-featured code editor with Markdown support
- **Toolbar**: Quick formatting buttons for common Markdown syntax
- **Preview Mode**: Toggle between editing and preview modes
- **Frontmatter Editor**: Manage document metadata (title, tags, etc.)
- **Auto-save Warning**: Visual indicators for unsaved changes

#### ⚙️ Settings
- View account information
- Check session status
- Review security settings
- Sign out securely

### File Management

#### Creating New Files
1. Navigate to the desired directory (Docs or Blog)
2. Click "New File" button
3. Enter filename (must end with `.md` or `.mdx`)
4. File will be created with basic frontmatter

#### Editing Files
1. Click on any Markdown file in the file browser
2. Use the Monaco editor to make changes
3. Edit frontmatter using the dedicated editor
4. Save changes with Ctrl+S or the Save button

#### Deleting Files
1. Open the file in the editor
2. Click the "Delete" button
3. Confirm deletion in the dialog
4. File will be backed up before deletion

### Markdown Editor Features

#### Toolbar Quick Actions
- **H**: Insert heading
- **B**: Bold text
- **I**: Italic text
- **<>**: Inline code
- **🔗**: Insert link
- **🖼️**: Insert image
- **📝**: Code block
- **❝**: Blockquote
- **•**: Bullet list
- **1.**: Numbered list

#### Keyboard Shortcuts
- `Ctrl+S`: Save file
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Tab`: Indent selected lines
- `Shift+Tab`: Outdent selected lines

#### Frontmatter Management
The frontmatter editor allows you to:
- Add new metadata fields
- Edit existing field values
- Remove unwanted fields
- Maintain proper YAML formatting

Common frontmatter fields:
```yaml
title: "Document Title"
description: "Document description"
sidebar_position: 1
tags: ["tag1", "tag2"]
```

## Security Best Practices

### 1. Credential Management
- Use strong, unique passwords (minimum 12 characters)
- Change default credentials immediately
- Store password hashes, never plain text passwords
- Use a secure JWT secret (minimum 32 characters)

### 2. Environment Security
- Keep `.env` file out of version control
- Use different credentials for each environment
- Regularly rotate JWT secrets
- Monitor for suspicious login attempts

### 3. Access Control
- Limit admin access to necessary personnel only
- Use HTTPS in production environments
- Consider IP whitelisting for admin routes
- Regularly review admin activity logs

### 4. File Safety
- Files are automatically backed up before editing
- Backups are stored in `.admin_backups/` directory
- Only 10 most recent backups are kept per file
- Validate file paths to prevent directory traversal

## Troubleshooting

### Login Issues

**Problem**: Can't log in with correct credentials
- Check if account is locked (5 failed attempts)
- Wait 15 minutes for automatic unlock
- Verify password hash in environment variables
- Check browser console for JavaScript errors

**Problem**: Session expires too quickly
- Increase `ADMIN_TOKEN_EXPIRY` value
- Check `ADMIN_SESSION_TIMEOUT` setting
- Ensure cookies are enabled in browser

### Editor Issues

**Problem**: Changes aren't saving
- Check network connectivity
- Verify file permissions on server
- Look for error messages in the interface
- Try refreshing the page

**Problem**: File not loading in editor
- Check if file exists on filesystem
- Verify file permissions
- Ensure file is valid Markdown/MDX

### Performance Issues

**Problem**: Slow file loading
- Check file size (large files may take time)
- Verify server resources
- Consider breaking large files into smaller ones

## File Structure

```
src/
├── components/admin/
│   ├── AdminDashboard.tsx      # Main dashboard component
│   ├── AdminDashboard.css      # Dashboard styles
│   ├── AdminLogin.tsx          # Login form component
│   ├── AdminLogin.css          # Login styles
│   ├── AdminMarkdownEditor.tsx # Editor component
│   └── AdminMarkdownEditor.css # Editor styles
├── pages/admin/
│   ├── dashboard.tsx           # Dashboard page
│   └── login.tsx              # Login page
├── utils/
│   ├── auth.ts                # Authentication utilities
│   └── fileManager.ts         # File management utilities
└── ...
```

## API Reference

### Authentication Service

```javascript
import { authService } from '../utils/auth';

// Authenticate user
const result = await authService.authenticate('username', 'password');

// Verify token
const user = await authService.verifyToken('jwt_token');

// Check authentication status
const isAuth = await authService.isAuthenticated();

// Logout user
authService.logout();
```

### File Manager Service

```javascript
import { fileManager } from '../utils/fileManager';

// List files in directory
const files = await fileManager.listFiles('docs');

// Get file content
const content = await fileManager.getFileContent('docs/example.md');

// Save file content
await fileManager.saveFileContent('docs/example.md', content, frontmatter);

// Create new file
const path = await fileManager.createFile('docs', 'new-file.md', content);

// Delete file
await fileManager.deleteFile('docs/old-file.md');

// Search files
const results = await fileManager.searchFiles('search term', 'docs');
```

## Production Deployment

### 1. Security Checklist
- [ ] Changed default admin credentials
- [ ] Set strong JWT secret
- [ ] Enabled HTTPS
- [ ] Configured proper CORS headers
- [ ] Set up proper logging
- [ ] Tested backup/restore procedures

### 2. Environment Variables
Ensure all production environment variables are set:
```bash
ADMIN_USERNAME=your_production_admin
ADMIN_PASSWORD_HASH=production_hash_here
ADMIN_JWT_SECRET=production_jwt_secret_here
```

### 3. Monitoring
Consider implementing:
- Login attempt monitoring
- File change auditing
- Session activity tracking
- Error alerting

## Maintenance

### Regular Tasks
1. **Review admin activity logs** monthly
2. **Rotate JWT secret** quarterly
3. **Update admin password** annually
4. **Clean old backups** as needed
5. **Update dependencies** regularly

### Backup Strategy
- Admin file backups are automatic (last 10 versions)
- Consider additional backup strategies for critical content
- Test restore procedures regularly

## Support

For technical support or questions about the admin panel:

1. Check this documentation first
2. Review error messages in browser console
3. Check server logs for backend issues
4. Contact your system administrator

## Changelog

### Version 1.0.0 (2024-09-07)
- Initial release
- JWT-based authentication
- File browser and editor
- Markdown editing with live preview
- Frontmatter management
- Automatic file backups
- Security features and monitoring

---

**⚠️ Security Notice**: This admin panel provides powerful editing capabilities. Ensure only trusted administrators have access and that proper security measures are in place.