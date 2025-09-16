# AeroSafe Documentation - Deployment Guide

This guide covers all deployment options and configurations for the AeroSafe documentation site.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Update the values in `.env` according to your environment.

### 2. Choose Your Deployment Method

#### Option A: Vercel (Recommended for simplicity)
```bash
npm run vercel:deploy
```

#### Option B: Docker Compose (Recommended for control)
```bash
npm run compose:up
```

#### Option C: Manual Build
```bash
npm run build:prod
npm run serve
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Core Configuration
NODE_ENV=production
DOCUSAURUS_URL=https://docs.aerosafe.it
DOCUSAURUS_BASE_URL=/

# Deployment Ports
PROD_PORT=8080
STAGING_PORT=8081
DEV_PORT=3000

# Search (Algolia DocSearch)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
ALGOLIA_INDEX_NAME=aerosafe-docs
```

### GitHub Secrets (for CI/CD)

Configure these secrets in your GitHub repository:

```
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id

# Self-hosted deployment
SSH_PRIVATE_KEY=your_ssh_private_key
PROD_HOST=your.production.server
STAGING_HOST=your.staging.server
PROD_PORT=22
STAGING_PORT=22

# Notifications
SLACK_WEBHOOK=your_slack_webhook_url
NOTIFICATION_EMAIL=admin@aerosafe.it
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@aerosafe.it
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@aerosafe.it
```

## 🚀 Deployment Options

### 1. Vercel Deployment

#### Automatic Deployment
- Push to `main` branch → Production deployment
- Push to `staging` branch → Staging deployment
- Pull requests → Preview deployments

#### Manual Deployment
```bash
# Deploy to production
npm run vercel:deploy

# Deploy to staging
npm run vercel:deploy:staging

# Pull environment variables from Vercel
npm run vercel:pull
```

#### Vercel Configuration
The `vercel.json` file includes:
- Security headers (CSP, HSTS, XSS protection)
- Caching strategies for static assets
- Redirects and rewrites
- Build optimization

### 2. Docker Deployment

#### Single Container
```bash
# Build production image
npm run docker:build:prod

# Run production container
npm run docker:run:prod

# Build and run staging
npm run docker:build:staging
npm run docker:run:staging
```

#### Docker Compose (Multi-Environment)
```bash
# Production environment
npm run compose:up

# Staging environment  
npm run compose:up:staging

# Development environment
npm run compose:up:dev

# Both production and staging
npm run compose:up:all

# View logs
npm run compose:logs
npm run compose:logs:prod
npm run compose:logs:staging

# Stop services
npm run compose:down
```

#### Docker Compose Profiles

The `docker-compose.yml` supports multiple profiles:

- `production` - Production site (port 8080)
- `staging` - Staging site (port 8081)
- `development` - Development with hot reload (port 3000)
- `proxy` - Traefik reverse proxy with SSL
- `monitoring` - Prometheus + Grafana monitoring

### 3. Self-Hosted Deployment

#### Server Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Nginx (optional, for additional reverse proxy)
- SSL certificates (Let's Encrypt recommended)

#### Deployment Steps
```bash
# On your server
git clone https://github.com/aerosafe-ist/aerosafe-docs.git
cd aerosafe-docs

# Copy and configure environment
cp .env.example .env
nano .env

# Deploy with Docker Compose
docker-compose --profile production up -d

# Or use the npm script
npm run compose:up
```

#### Nginx Configuration (External)
If using external Nginx as a reverse proxy:

```nginx
server {
    server_name docs.aerosafe.it;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SSL configuration (add your SSL setup)
}
```

### 4. GitHub Actions CI/CD

The workflow (`.github/workflows/deploy.yml`) provides:

#### Automated Deployments
- **Production**: Triggered on push to `main`
- **Staging**: Triggered on push to `staging`  
- **Pull Requests**: Creates preview deployments

#### Quality Checks
- TypeScript compilation
- Code formatting validation
- Security audit
- Build testing
- Lighthouse performance audit

#### Multi-Platform Support
- Vercel deployment
- Docker image builds (AMD64 + ARM64)
- Self-hosted server deployment
- Health checks and notifications

## ⚙️ Configuration

### Multi-Environment Configuration

Each environment has its own configuration:

```bash
# Production
DOCUSAURUS_URL=https://docs.aerosafe.it
PROD_PORT=8080

# Staging
DOCUSAURUS_URL=https://staging-docs.aerosafe.it
STAGING_PORT=8081

# Development
DEV_PORT=3000
```

### Security Headers

Configured in `vercel.json` and `nginx.conf`:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Caching Strategy

- **Static assets** (CSS, JS, images): 1 year cache
- **HTML pages**: 1 hour cache with revalidation
- **Sitemap/robots**: 1 day cache
- **API responses**: 5 minutes cache

### SEO Optimization

Built-in SEO features:
- Automatic sitemap generation
- Meta tags and Open Graph
- Structured data markup
- Multi-language support (Italian/English)
- Fast loading with optimized assets

## 📊 Monitoring

### Health Checks

Built-in health check endpoints:
- `/health` - Basic health status
- `/status` - Service status

Test health checks:
```bash
# Local
npm run health:check

# Docker
npm run health:docker

# Remote
curl -f https://docs.aerosafe.it/health
```

### Monitoring Stack (Optional)

Enable monitoring with Docker Compose:
```bash
docker-compose --profile monitoring up -d
```

Includes:
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3001) - Dashboards and visualization

Default Grafana credentials:
- Username: `admin`
- Password: Set in `.env` as `GRAFANA_PASSWORD`

### Lighthouse Performance

Automated performance testing with GitHub Actions:
- Performance score > 90%
- Accessibility score > 90%
- Best practices score > 90%
- SEO score > 90%

Configure thresholds in `.lighthouserc.json`.

## 🛠 Maintenance

### Regular Tasks

```bash
# Update dependencies
npm run update:deps

# Security audit and fix
npm run audit:security
npm run audit:fix

# Clean up Docker resources
npm run clean:docker

# Backup configuration
npm run backup

# Health monitoring
npm run health:check
```

### Log Management

View logs:
```bash
# Docker Compose logs
npm run compose:logs

# Specific service logs
npm run compose:logs:prod
npm run compose:logs:staging

# Docker container logs
docker logs aerosafe-docs-production -f
```

### SSL Certificate Renewal

If using Traefik with Let's Encrypt:
```bash
# Certificates auto-renew, but to force renewal:
docker-compose restart traefik
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

#### Docker Issues
```bash
# Clean Docker resources
npm run clean:docker

# Rebuild images
npm run docker:build:prod
```

#### SSL/Certificate Issues
```bash
# Check certificate status
docker-compose logs traefik

# Restart Traefik
docker-compose restart traefik
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# View detailed logs
npm run compose:logs
```

### Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test health endpoints
4. Contact: admin@aerosafe.it

## 🔗 Related Documentation

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

---

**AeroSafe Documentation Team**  
IST S.r.l.s. | https://www.aerosafe.it