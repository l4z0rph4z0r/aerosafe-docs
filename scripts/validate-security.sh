#!/bin/bash

# AeroSafe Documentation - Security Validation Script
# Validates that all placeholder values are replaced before production deployment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE} AeroSafe Documentation Security Check ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to log errors
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if file exists
check_file_exists() {
    local file="$1"
    local description="$2"
    
    ((CHECKS++))
    if [[ -f "$file" ]]; then
        log_success "$description exists"
        return 0
    else
        log_error "$description not found: $file"
        return 1
    fi
}

# Check for placeholder values in environment files
check_placeholder_values() {
    local env_file="$1"
    local env_name="$2"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "$env_name file not found: $env_file"
        return
    fi
    
    log_info "Checking $env_name for placeholder values..."
    
    # Critical placeholder values that must be replaced
    local critical_placeholders=(
        "REPLACE_WITH_PRODUCTION_APP_ID"
        "REPLACE_WITH_PRODUCTION_API_KEY"
        "REPLACE_WITH_PRODUCTION_GA_ID"
        "REPLACE_WITH_PRODUCTION_GITHUB_TOKEN"
        "REPLACE_WITH_SECURE_USERNAME"
        "REPLACE_WITH_BCRYPT_HASHED_PASSWORD"
        "REPLACE_WITH_SECURE_JWT_SECRET"
        "REPLACE_WITH_PRODUCTION_AWS_ACCESS_KEY"
        "REPLACE_WITH_PRODUCTION_AWS_SECRET_KEY"
        "REPLACE_WITH_PRODUCTION_S3_BUCKET"
        "your_bcrypt_hashed_password_here"
        "your_super_secure_jwt_secret_here"
        "aerosafe_docs_jwt_secret_change_in_production_2024"
    )
    
    local found_placeholders=()
    
    for placeholder in "${critical_placeholders[@]}"; do
        if grep -q "$placeholder" "$env_file" 2>/dev/null; then
            found_placeholders+=("$placeholder")
        fi
    done
    
    if [[ ${#found_placeholders[@]} -gt 0 ]]; then
        log_error "$env_name contains ${#found_placeholders[@]} placeholder value(s):"
        for placeholder in "${found_placeholders[@]}"; do
            echo "    - $placeholder"
        done
    else
        log_success "$env_name has no critical placeholder values"
    fi
}

# Check admin credentials security
check_admin_security() {
    local env_file="$1"
    
    if [[ ! -f "$env_file" ]]; then
        return
    fi
    
    log_info "Checking admin security configuration..."
    
    # Check admin username
    if grep -q "ADMIN_USERNAME=admin$" "$env_file" 2>/dev/null; then
        log_warning "Admin username is set to default 'admin' - consider using a unique username"
    fi
    
    # Check JWT secret length
    local jwt_secret
    jwt_secret=$(grep "ADMIN_JWT_SECRET=" "$env_file" 2>/dev/null | cut -d'=' -f2- | tr -d '"' || echo "")
    if [[ -n "$jwt_secret" ]]; then
        if [[ ${#jwt_secret} -lt 64 ]]; then
            log_warning "JWT secret is less than 64 characters (current: ${#jwt_secret})"
        else
            log_success "JWT secret length is adequate (${#jwt_secret} characters)"
        fi
    fi
    
    # Check if default password hash is being used
    if grep -q "\$2a\$12\$LQv3c1yqBWVHxkd0LQ1TGOKBkgZtMhV" "$env_file" 2>/dev/null; then
        log_error "Default password hash detected - MUST be changed before production"
    fi
}

# Check SSL/TLS configuration
check_ssl_config() {
    local env_file="$1"
    
    if [[ ! -f "$env_file" ]]; then
        return
    fi
    
    log_info "Checking SSL/TLS configuration..."
    
    # Check if HTTPS is enabled
    if grep -q "ENABLE_HTTPS=true" "$env_file" 2>/dev/null; then
        log_success "HTTPS is enabled"
    else
        log_warning "HTTPS is not explicitly enabled"
    fi
    
    # Check ACME email
    local acme_email
    acme_email=$(grep "ACME_EMAIL=" "$env_file" 2>/dev/null | cut -d'=' -f2 || echo "")
    if [[ "$acme_email" == "admin@aerosafe.it" ]]; then
        log_success "ACME email is configured"
    else
        log_warning "ACME email should be set to admin@aerosafe.it"
    fi
}

# Check Docker security configuration
check_docker_security() {
    log_info "Checking Docker security configuration..."
    
    # Check if production Dockerfile exists
    if check_file_exists "$PROJECT_ROOT/Dockerfile.production" "Production Dockerfile"; then
        # Check for security features in Dockerfile
        if grep -q "USER nginx" "$PROJECT_ROOT/Dockerfile.production" 2>/dev/null; then
            log_success "Dockerfile runs as non-root user"
        else
            log_error "Dockerfile does not specify non-root user"
        fi
        
        if grep -q "read_only: true" "$PROJECT_ROOT/docker-compose.production.yml" 2>/dev/null; then
            log_success "Docker Compose configured with read-only filesystem"
        else
            log_warning "Docker Compose should use read-only filesystem for security"
        fi
    fi
}

# Check nginx security configuration
check_nginx_security() {
    log_info "Checking Nginx security configuration..."
    
    if check_file_exists "$PROJECT_ROOT/nginx.prod.conf" "Production Nginx configuration"; then
        local nginx_config="$PROJECT_ROOT/nginx.prod.conf"
        
        # Check for security headers
        local security_headers=(
            "X-Frame-Options"
            "X-XSS-Protection"
            "X-Content-Type-Options"
            "Strict-Transport-Security"
            "Content-Security-Policy"
        )
        
        for header in "${security_headers[@]}"; do
            if grep -q "$header" "$nginx_config" 2>/dev/null; then
                log_success "Security header configured: $header"
            else
                log_warning "Security header missing: $header"
            fi
        done
        
        # Check for rate limiting
        if grep -q "limit_req" "$nginx_config" 2>/dev/null; then
            log_success "Rate limiting is configured"
        else
            log_warning "Rate limiting should be configured"
        fi
    fi
}

# Check package vulnerabilities
check_package_vulnerabilities() {
    log_info "Checking for package vulnerabilities..."
    
    cd "$PROJECT_ROOT"
    
    if command -v npm >/dev/null 2>&1; then
        if npm audit --audit-level high --silent 2>/dev/null; then
            log_success "No high-severity vulnerabilities found in npm packages"
        else
            log_warning "High-severity vulnerabilities found - run 'npm audit' for details"
        fi
    else
        log_warning "npm not found - cannot check package vulnerabilities"
    fi
}

# Check environment file permissions
check_file_permissions() {
    log_info "Checking file permissions..."
    
    local sensitive_files=(
        ".env.production"
        ".env.staging"
        "scripts/validate-security.sh"
    )
    
    for file in "${sensitive_files[@]}"; do
        local full_path="$PROJECT_ROOT/$file"
        if [[ -f "$full_path" ]]; then
            local perms
            perms=$(stat -c "%a" "$full_path" 2>/dev/null || stat -f "%Lp" "$full_path" 2>/dev/null || echo "unknown")
            
            if [[ "$perms" == "600" ]] || [[ "$perms" == "700" ]]; then
                log_success "$file has secure permissions ($perms)"
            elif [[ "$perms" != "unknown" ]]; then
                log_warning "$file has permissive permissions ($perms) - consider restricting to 600"
            fi
        fi
    done
}

# Main execution
main() {
    log_info "Starting security validation..."
    echo ""
    
    # Check production environment file
    check_file_exists "$PROJECT_ROOT/.env.production" "Production environment file"
    check_placeholder_values "$PROJECT_ROOT/.env.production" "Production environment"
    check_admin_security "$PROJECT_ROOT/.env.production"
    check_ssl_config "$PROJECT_ROOT/.env.production"
    echo ""
    
    # Check staging environment file
    check_file_exists "$PROJECT_ROOT/.env.staging" "Staging environment file"
    check_placeholder_values "$PROJECT_ROOT/.env.staging" "Staging environment"
    echo ""
    
    # Check Docker configuration
    check_docker_security
    echo ""
    
    # Check Nginx configuration
    check_nginx_security
    echo ""
    
    # Check package vulnerabilities
    check_package_vulnerabilities
    echo ""
    
    # Check file permissions
    check_file_permissions
    echo ""
    
    # Final summary
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         SECURITY VALIDATION SUMMARY    ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [[ $ERRORS -gt 0 ]]; then
        echo -e "${RED}❌ DEPLOYMENT BLOCKED: $ERRORS critical error(s) found${NC}"
        echo -e "${RED}   Please fix all errors before deploying to production${NC}"
        echo ""
    fi
    
    if [[ $WARNINGS -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
        echo -e "${YELLOW}   Review warnings for security improvements${NC}"
        echo ""
    fi
    
    if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
        echo -e "${GREEN}✅ All security checks passed!${NC}"
        echo -e "${GREEN}   Ready for production deployment${NC}"
        echo ""
    elif [[ $ERRORS -eq 0 ]]; then
        echo -e "${GREEN}✅ No critical errors found${NC}"
        echo -e "${YELLOW}   Consider addressing warnings for optimal security${NC}"
        echo ""
    fi
    
    echo "Checked $CHECKS security configurations"
    echo ""
    
    # Exit with error code if critical errors found
    if [[ $ERRORS -gt 0 ]]; then
        exit 1
    fi
    
    exit 0
}

# Run main function
main "$@"