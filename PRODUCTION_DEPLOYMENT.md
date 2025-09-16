# AeroSafe Documentation - Production Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the AeroSafe documentation portal to production.

## Security Features Implemented

### 1. Authentication & Authorization
- **JWT-based authentication** with secure token generation
- **Environment-based credentials** (never hardcoded)
- **Session timeout** after 8 hours of inactivity
- **Login attempt limiting** (5 attempts before 15-minute lockout)
- **Secure cookie configuration** with httpOnly, secure, and sameSite flags

### 2. API Security
- **Helmet.js** for security headers
- **CORS configuration** with whitelisted origins
- **Rate limiting** on all API endpoints
- **Input validation** to prevent injection attacks
- **File path sanitization** to prevent directory traversal

### 3. Data Protection
- **Automatic backups** before file edits and deletions
- **Daily automated backups** with 7-day retention
- **Backup versioning** with timestamps
- **Secure file operations** with validation

### 4. Infrastructure Security
- **HTTPS enforcement** in production
- **Non-root user** in Docker containers
- **Network isolation** with Docker networks
- **Health checks** for monitoring
- **Log rotation** to prevent disk exhaustion

## Deployment Instructions

### Prerequisites
- Docker and Docker Compose installed
- Domain configured with SSL certificate
- Environment variables configured

### Step 1: Configure Environment Variables

Create `.env.production` file:
```bash
# Admin Credentials (CHANGE THESE!)
REACT_APP_ADMIN_USERNAME=your_secure_username
REACT_APP_ADMIN_PASSWORD=YourVerySecurePassword123!
ADMIN_JWT_SECRET=generate_64_char_random_string_here
ADMIN_TOKEN_EXPIRY=8h

# Redis Password
REDIS_PASSWORD=YourRedisPassword2024

# Site Configuration
SITE_URL=https://docs.aerosafe.it
API_URL=https://docs.aerosafe.it/api

# Environment
NODE_ENV=production
```

### Step 2: Build Production Image

```bash
# Build production Docker image
docker compose -f docker-compose.prod.yml build

# Or build with specific arguments
docker build -f Dockerfile.prod \
  --build-arg NODE_ENV=production \
  --build-arg DOCUSAURUS_URL=https://docs.aerosafe.it \
  -t aerosafe-docs:production .
```

### Step 3: Deploy with Docker Compose

```bash
# Start production services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Check health
docker compose -f docker-compose.prod.yml ps
```

### Step 4: Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name docs.aerosafe.it;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Admin Panel Features

### 1. File Management
- **Create** new Markdown files (.md, .mdx)
- **Edit** existing documentation files
- **Delete** files with automatic backup
- **Search** across all documentation
- **Preview** changes before saving

### 2. Content Organization
- Separate management for **Documentation** and **Blog** sections
- Intuitive file browser interface
- Real-time search functionality
- File metadata display (size, last modified)

### 3. Editor Features
- **Markdown editor** with syntax highlighting
- **Live preview** of content
- **Auto-save** functionality
- **Version history** through backups
- **Undo/Redo** support

### 4. Security Features
- **Session management** with automatic logout
- **Activity logging** for audit trail
- **Secure file operations** with validation
- **Backup before destructive operations**

## Admin Access

### Default Credentials (CHANGE IMMEDIATELY!)
- Username: `admin`
- Password: `AeroSafe2024#Secure!`

### First Login Steps:
1. Navigate to `/admin/login`
2. Enter credentials
3. Access dashboard at `/admin/dashboard`
4. Change default password immediately

## Maintenance Operations

### Backup Management
```bash
# Manual backup
docker exec aerosafe-docs-production tar -czf /backups/manual-backup-$(date +%Y%m%d-%H%M%S).tar.gz /api/docs /api/blog

# Restore from backup
docker exec aerosafe-docs-production tar -xzf /backups/backup-YYYYMMDD-HHMMSS.tar.gz -C /

# List backups
docker exec aerosafe-docs-production ls -la /backups/
```

### Log Management
```bash
# View logs
docker logs aerosafe-docs-production --tail 100

# Follow logs
docker logs -f aerosafe-docs-production

# Export logs
docker logs aerosafe-docs-production > aerosafe-logs-$(date +%Y%m%d).log
```

### Health Monitoring
```bash
# Check health status
curl http://localhost:8080/api/health

# Check container status
docker ps --filter name=aerosafe

# Check resource usage
docker stats aerosafe-docs-production
```

## Security Best Practices

1. **Regular Updates**
   - Update Docker images monthly
   - Update npm dependencies regularly
   - Apply security patches promptly

2. **Access Control**
   - Use strong, unique passwords
   - Rotate credentials quarterly
   - Limit admin access to necessary personnel

3. **Monitoring**
   - Set up alerts for failed login attempts
   - Monitor disk usage and performance
   - Review logs regularly for anomalies

4. **Backup Strategy**
   - Test backup restoration regularly
   - Store backups in multiple locations
   - Encrypt sensitive backup data

## Troubleshooting

### Common Issues

1. **Login not working**
   - Check environment variables are set
   - Verify cookies are enabled
   - Check browser console for errors

2. **Files not saving**
   - Check file permissions in Docker volumes
   - Verify disk space availability
   - Check API server logs

3. **Performance issues**
   - Increase Docker memory allocation
   - Check for large files in documentation
   - Review and optimize images

## Support

For technical support or questions:
- Email: support@aerosafe.it
- Documentation: https://docs.aerosafe.it
- GitHub: https://github.com/aerosafe-ist/aerosafe-docs

## Version History

- **v1.0.0** - Initial production release
  - Secure authentication system
  - File management capabilities
  - Automated backup system
  - Production-ready Docker configuration

---

Last Updated: September 2024
Copyright © 2024 AeroSafe - All Rights Reserved