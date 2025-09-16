# AeroSafe Documentation - Production Deployment Security Guide

## 🚨 CRITICAL SECURITY CHECKLIST

Before deploying to production, **ALL** placeholder values in environment files MUST be replaced with secure, production-ready values.

## 📋 Pre-Deployment Security Checklist

### 1. Environment Variables Security

#### Critical Variables That MUST Be Changed:

```bash
# .env.production - REPLACE ALL THESE VALUES BEFORE DEPLOYMENT:

# Admin Authentication - CRITICAL
ADMIN_USERNAME=REPLACE_WITH_SECURE_USERNAME
ADMIN_PASSWORD_HASH=REPLACE_WITH_BCRYPT_HASHED_PASSWORD
ADMIN_JWT_SECRET=REPLACE_WITH_SECURE_JWT_SECRET_64_CHARS_MIN

# Third-party API Keys - REPLACE ALL
ALGOLIA_APP_ID=REPLACE_WITH_PRODUCTION_APP_ID
ALGOLIA_API_KEY=REPLACE_WITH_PRODUCTION_API_KEY
GOOGLE_ANALYTICS_ID=REPLACE_WITH_PRODUCTION_GA_ID
GITHUB_TOKEN=REPLACE_WITH_PRODUCTION_GITHUB_TOKEN

# Cloud Services - REPLACE ALL
AWS_ACCESS_KEY_ID=REPLACE_WITH_PRODUCTION_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=REPLACE_WITH_PRODUCTION_AWS_SECRET_KEY
BACKUP_S3_BUCKET=REPLACE_WITH_PRODUCTION_S3_BUCKET
```

#### Generating Secure Values:

```bash
# Generate secure password hash (replace 'your_secure_password' with actual password):
npx bcrypt-cli your_secure_password 12

# Generate secure JWT secret (64+ characters):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate secure admin username (avoid common names like 'admin', 'administrator'):
# Use a unique identifier like: aerosafe_admin_2024
```

### 2. Security Validation Script

Run the security validation script before deployment:

```bash
# Make script executable
chmod +x scripts/validate-security.sh

# Run security validation
./scripts/validate-security.sh
```

### 3. SSL/TLS Configuration

Ensure SSL certificates are properly configured:

```bash
# Set up Let's Encrypt email
ACME_EMAIL=admin@aerosafe.it

# Verify SSL configuration
openssl s_client -connect docs.aerosafe.it:443 -servername docs.aerosafe.it
```

## 🔧 Production Deployment Commands

### Step 1: Environment Setup

```bash
# 1. Copy and configure production environment
cp .env.example .env.production

# 2. Edit .env.production with secure values
nano .env.production

# 3. Validate all placeholder values are replaced
./scripts/validate-security.sh
```

### Step 2: Build and Deploy

```bash
# 1. Set build metadata
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export GIT_COMMIT_SHA=$(git rev-parse --short HEAD)

# 2. Build production container
docker build -f Dockerfile.production \
  --build-arg NODE_ENV=production \
  --build-arg DOCUSAURUS_URL=https://docs.aerosafe.it \
  --build-arg BUILD_TIME="$BUILD_TIME" \
  --build-arg GIT_COMMIT_SHA="$GIT_COMMIT_SHA" \
  -t aerosafe-docs:production .

# 3. Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d

# 4. Verify deployment
curl -f https://docs.aerosafe.it/health
```

### Step 3: Security Verification

```bash
# 1. Test security headers
curl -I https://docs.aerosafe.it

# 2. Verify SSL configuration
nmap --script ssl-enum-ciphers -p 443 docs.aerosafe.it

# 3. Check for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image aerosafe-docs:production
```

## 🛡️ Security Features Implemented

### 1. Container Security
- **Non-root user execution**: All processes run as `nginx` user (UID 101)
- **Read-only filesystem**: Container runs with read-only root filesystem
- **Minimal attack surface**: Multi-stage build removes build tools
- **Security scanning**: Automatic vulnerability scanning during build
- **Capability dropping**: Removes all unnecessary Linux capabilities

### 2. Network Security
- **Rate limiting**: Protects against DDoS and brute force attacks
- **HTTPS enforcement**: Automatic HTTP to HTTPS redirect
- **Security headers**: Comprehensive security headers implementation
- **CSP policy**: Strict Content Security Policy
- **CORS configuration**: Restricted cross-origin resource sharing

### 3. Application Security
- **Secret management**: Environment-based secret injection
- **Input validation**: Nginx-level request filtering
- **File access restrictions**: Blocked access to sensitive files
- **Vulnerability disclosure**: Security.txt implementation
- **Admin authentication**: Bcrypt-hashed passwords with JWT tokens

### 4. Monitoring and Logging
- **Access logging**: Comprehensive request logging
- **Error monitoring**: Centralized error collection with Grafana
- **Health checks**: Automated health monitoring
- **Performance metrics**: Prometheus metrics collection
- **Security auditing**: Failed login attempt tracking

## 🔒 Security Headers Configuration

The following security headers are automatically applied:

```
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [Strict CSP policy]
Permissions-Policy: [Restricted permissions]
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

## 🚨 Security Incident Response

### In Case of Security Breach:

1. **Immediate Response**:
   ```bash
   # Stop all services
   docker-compose -f docker-compose.production.yml down
   
   # Rotate all secrets immediately
   ./scripts/rotate-secrets.sh
   
   # Check logs for suspicious activity
   docker-compose -f docker-compose.production.yml logs | grep -E "error|warning|failed"
   ```

2. **Investigation**:
   - Check access logs for unusual patterns
   - Verify integrity of static files
   - Review authentication logs
   - Scan for malware in containers

3. **Recovery**:
   - Rebuild containers with latest security updates
   - Update all passwords and API keys
   - Restore from clean backup if necessary
   - Implement additional security measures

### Contact Information:
- **Security Team**: security@aerosafe.it
- **Emergency Contact**: +39-XXX-XXXXXXX
- **Incident Response**: Follow procedures in `/docs/security/incident-response.md`

## 📊 Security Monitoring

### Key Metrics to Monitor:
- Failed login attempts (>5/hour triggers alert)
- Unusual traffic patterns (>10x normal triggers alert)
- SSL certificate expiration (30 days warning)
- Container vulnerabilities (daily scanning)
- Unauthorized file access attempts

### Alerting Configuration:
```yaml
# prometheus/alerts.yml
groups:
  - name: security.rules
    rules:
      - alert: HighFailedLogins
        expr: rate(nginx_http_requests_total{status="401"}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate of failed login attempts detected"
```

## 🔄 Regular Security Maintenance

### Weekly Tasks:
- [ ] Review access logs for anomalies
- [ ] Update Docker images for security patches
- [ ] Verify backup integrity
- [ ] Check SSL certificate status

### Monthly Tasks:
- [ ] Rotate JWT secrets
- [ ] Update all third-party dependencies
- [ ] Security scan all containers
- [ ] Review and update security policies
- [ ] Test incident response procedures

### Quarterly Tasks:
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update access permissions
- [ ] Update emergency contact information
- [ ] Security training for team members

## 📚 Additional Resources

- [OWASP Docker Security Guide](https://owasp.org/www-project-docker-top-10/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Nginx Security Configuration](https://nginx.org/en/docs/http/ngx_http_security_headers_module.html)

---

⚠️ **IMPORTANT**: This deployment handles sensitive documentation and admin access. All security measures must be implemented before production deployment. Regular security audits are mandatory.