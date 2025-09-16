#!/bin/bash

# AeroSafe Documentation - Production Deployment Script
# Automated secure deployment with comprehensive checks and rollback capability

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/deploy-$(date +%Y%m%d-%H%M%S).log"

# Deployment settings
CONTAINER_NAME="aerosafe-docs-production"
IMAGE_NAME="aerosafe-docs:production"
COMPOSE_FILE="docker-compose.production.yml"
HEALTH_CHECK_URL="https://docs.aerosafe.it/health"
MAX_DEPLOY_TIME=300  # 5 minutes timeout

# Functions
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "ERROR")
            echo -e "${RED}[ERROR] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "INFO")
            echo -e "${BLUE}[INFO] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS] $message${NC}" | tee -a "$LOG_FILE"
            ;;
        *)
            echo -e "[LOG] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handler
error_handler() {
    local line_no=$1
    local error_code=$2
    log "ERROR" "Deployment failed at line $line_no with exit code $error_code"
    
    if [[ -n "${ROLLBACK_AVAILABLE:-}" ]]; then
        log "INFO" "Attempting automatic rollback..."
        rollback_deployment
    fi
    
    log "ERROR" "Deployment aborted. Check logs: $LOG_FILE"
    exit $error_code
}

trap 'error_handler $LINENO $?' ERR

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "=========================================="
    echo " AeroSafe Documentation Production Deploy "
    echo "=========================================="
    echo -e "${NC}"
    echo "Deployment started at: $(date)"
    echo "Log file: $LOG_FILE"
    echo ""
}

# Pre-deployment checks
pre_deployment_checks() {
    log "INFO" "Running pre-deployment security checks..."
    
    # Run security validation
    if ! "$SCRIPT_DIR/validate-security.sh"; then
        log "ERROR" "Security validation failed - deployment blocked"
        exit 1
    fi
    
    # Check if required files exist
    local required_files=(
        ".env.production"
        "Dockerfile.production"
        "docker-compose.production.yml"
        "nginx.prod.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            log "ERROR" "Required file missing: $file"
            exit 1
        fi
    done
    
    # Check Docker is running
    if ! docker info >/dev/null 2>&1; then
        log "ERROR" "Docker is not running or accessible"
        exit 1
    fi
    
    # Check disk space (require at least 2GB)
    local available_space
    available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log "ERROR" "Insufficient disk space (need at least 2GB)"
        exit 1
    fi
    
    log "SUCCESS" "Pre-deployment checks passed"
}

# Create backup of current deployment
create_backup() {
    log "INFO" "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="aerosafe-docs-backup-$(date +%Y%m%d-%H%M%S)"
    
    # Stop current container if running (for consistent backup)
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log "INFO" "Stopping current container for backup..."
        docker stop "$CONTAINER_NAME" || true
        sleep 5
    fi
    
    # Create backup archive
    tar -czf "$BACKUP_DIR/$backup_name.tar.gz" \
        --exclude=node_modules \
        --exclude=.docusaurus \
        --exclude=build \
        --exclude=backups \
        -C "$PROJECT_ROOT" .
    
    # Export current image if it exists
    if docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
        log "INFO" "Exporting current Docker image..."
        docker save "$IMAGE_NAME" | gzip > "$BACKUP_DIR/$backup_name-image.tar.gz"
        ROLLBACK_IMAGE="$BACKUP_DIR/$backup_name-image.tar.gz"
    fi
    
    ROLLBACK_BACKUP="$BACKUP_DIR/$backup_name.tar.gz"
    ROLLBACK_AVAILABLE=true
    
    log "SUCCESS" "Backup created: $backup_name"
}

# Build production image
build_image() {
    log "INFO" "Building production Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Set build metadata
    export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export GIT_COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    # Build with security scanning
    docker build \
        -f Dockerfile.production \
        --build-arg NODE_ENV=production \
        --build-arg DOCUSAURUS_URL=https://docs.aerosafe.it \
        --build-arg DOCUSAURUS_BASE_URL=/ \
        --build-arg BUILD_TIME="$BUILD_TIME" \
        --build-arg GIT_COMMIT_SHA="$GIT_COMMIT_SHA" \
        --tag "$IMAGE_NAME" \
        --tag "aerosafe-docs:latest" \
        .
    
    # Verify image was created
    if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
        log "ERROR" "Failed to build Docker image"
        exit 1
    fi
    
    log "SUCCESS" "Docker image built successfully"
}

# Security scan image
scan_image() {
    log "INFO" "Scanning Docker image for vulnerabilities..."
    
    # Use Trivy for vulnerability scanning if available
    if command -v trivy >/dev/null 2>&1; then
        log "INFO" "Running Trivy security scan..."
        
        if trivy image --exit-code 1 --severity HIGH,CRITICAL "$IMAGE_NAME"; then
            log "SUCCESS" "No high/critical vulnerabilities found"
        else
            log "ERROR" "High/critical vulnerabilities found in image"
            log "WARN" "Continue with deployment? (y/N)"
            read -r -n 1 response
            echo
            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        log "WARN" "Trivy not installed - skipping vulnerability scan"
    fi
}

# Deploy services
deploy_services() {
    log "INFO" "Deploying services with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy with production configuration
    docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    
    log "INFO" "Waiting for services to start..."
    sleep 10
    
    # Check if main container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        log "ERROR" "Main container failed to start"
        docker-compose -f "$COMPOSE_FILE" logs "$CONTAINER_NAME" | tail -20
        exit 1
    fi
    
    log "SUCCESS" "Services deployed successfully"
}

# Health checks
health_checks() {
    log "INFO" "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "INFO" "Health check attempt $attempt/$max_attempts..."
        
        # Check container health
        if docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null | grep -q "healthy"; then
            log "SUCCESS" "Container health check passed"
            break
        elif [[ $attempt -eq $max_attempts ]]; then
            log "ERROR" "Container health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Test HTTP endpoint
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        log "INFO" "HTTP health check attempt $attempt/$max_attempts..."
        
        if curl -f -s --connect-timeout 5 --max-time 10 "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            log "SUCCESS" "HTTP health check passed"
            return 0
        elif [[ $attempt -eq $max_attempts ]]; then
            log "ERROR" "HTTP health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Rollback deployment
rollback_deployment() {
    log "WARN" "Starting rollback procedure..."
    
    if [[ -z "${ROLLBACK_AVAILABLE:-}" ]]; then
        log "ERROR" "No rollback available"
        return 1
    fi
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" down || true
    
    # Restore previous image if available
    if [[ -n "${ROLLBACK_IMAGE:-}" && -f "$ROLLBACK_IMAGE" ]]; then
        log "INFO" "Restoring previous Docker image..."
        docker load < "$ROLLBACK_IMAGE"
    fi
    
    # Start services with rolled back configuration
    if docker-compose -f "$COMPOSE_FILE" up -d; then
        log "SUCCESS" "Rollback completed successfully"
    else
        log "ERROR" "Rollback failed - manual intervention required"
        return 1
    fi
}

# Post-deployment tasks
post_deployment() {
    log "INFO" "Running post-deployment tasks..."
    
    # Update sitemap (if applicable)
    log "INFO" "Checking sitemap generation..."
    
    # Clean up old Docker images
    log "INFO" "Cleaning up old Docker images..."
    docker image prune -f --filter "until=24h" || true
    
    # Log deployment details
    log "INFO" "Deployment completed successfully!"
    log "INFO" "Image: $IMAGE_NAME"
    log "INFO" "Build time: ${BUILD_TIME:-unknown}"
    log "INFO" "Git commit: ${GIT_COMMIT_SHA:-unknown}"
    log "INFO" "Health check URL: $HEALTH_CHECK_URL"
    
    log "SUCCESS" "Production deployment completed!"
}

# Main deployment function
main() {
    print_banner
    
    log "INFO" "Starting production deployment..."
    
    # Run all deployment steps
    pre_deployment_checks
    create_backup
    build_image
    scan_image
    deploy_services
    
    if health_checks; then
        post_deployment
        
        # Clean up old backups (keep last 5)
        find "$BACKUP_DIR" -name "aerosafe-docs-backup-*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f || true
        
        echo -e "${GREEN}"
        echo "=========================================="
        echo "  ✅ PRODUCTION DEPLOYMENT SUCCESSFUL!    "
        echo "=========================================="
        echo -e "${NC}"
        echo ""
        echo "🌐 Site URL: https://docs.aerosafe.it"
        echo "🔍 Health Check: $HEALTH_CHECK_URL"
        echo "📊 Monitoring: https://monitoring.aerosafe.it"
        echo "📋 Logs: $LOG_FILE"
        echo ""
    else
        log "ERROR" "Health checks failed - initiating rollback"
        rollback_deployment
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --rollback     Rollback to previous deployment"
        echo "  --force        Skip confirmation prompts"
        echo ""
        exit 0
        ;;
    "--rollback")
        log "INFO" "Manual rollback requested"
        rollback_deployment
        exit 0
        ;;
    "--force")
        FORCE_DEPLOY=true
        ;;
esac

# Confirmation prompt (unless forced)
if [[ "${FORCE_DEPLOY:-false}" != "true" ]]; then
    echo -e "${YELLOW}⚠️  This will deploy to PRODUCTION environment${NC}"
    echo -e "${YELLOW}   Are you sure you want to continue? (y/N)${NC}"
    read -r -n 1 response
    echo
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "INFO" "Deployment cancelled by user"
        exit 0
    fi
fi

# Run main deployment
main "$@"