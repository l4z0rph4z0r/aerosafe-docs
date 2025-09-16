# AeroSafe Documentation Portal - Docker Development Setup

This setup follows the Docker Development pattern from CLAUDE.md with proper port configuration and project isolation.

## Quick Start

```bash
# Start development environment
./start-dev.sh

# Stop development environment
./stop-dev.sh
```

## Manual Commands

Following the CLAUDE.md pattern:

```bash
# Start (following CLAUDE.md pattern)
PROJECT_SLUG="cc-011-aerosafe-docs"
docker compose -p "$PROJECT_SLUG" --env-file ../../.env -f docker-compose.dev.yml up -d

# Check status
docker compose -p "$PROJECT_SLUG" --env-file ../../.env -f docker-compose.dev.yml ps

# View logs
docker compose -p "$PROJECT_SLUG" --env-file ../../.env -f docker-compose.dev.yml logs -f

# Stop
docker compose -p "$PROJECT_SLUG" --env-file ../../.env -f docker-compose.dev.yml down
```

## Port Configuration

- **BASE_PORT**: 7110 (registered in `/mnt/c/Claude_Code/08-operations/ports.json`)
- **DEV_PORT**: 7112 (development server)
- **STAGING_PORT**: 7111 (staging environment)
- **PROD_PORT**: 7110 (production environment)

Access the development site at: **http://localhost:7112**

## Project Structure

```
CC-011-aerosafe-redesign/
├── .env                     # Environment variables (BASE_PORT=7110)
└── DOCS/aerosafe-docs/
    ├── Dockerfile           # Production container
    ├── Dockerfile.dev       # Development container
    ├── docker-compose.yml   # Full production/staging setup
    ├── docker-compose.dev.yml  # Development environment
    ├── start-dev.sh         # Development starter script
    ├── stop-dev.sh          # Development stopper script
    └── DOCKER_README.md     # This file
```

## Docker Services

### Development Service (`aerosafe-docs-dev`)
- **Container**: `aerosafe-docs-dev`
- **Port**: `7112:3000`
- **Image**: Built from `Dockerfile.dev`
- **Features**:
  - Hot reload with `CHOKIDAR_USEPOLLING=true`
  - Volume mounts for live code updates
  - Non-root user for security

### Network
- **Name**: `aerosafe-docs-dev-network`
- **Driver**: `bridge`

## Troubleshooting

### Port Conflicts
If port 7112 is in use:
1. Check what's using it: `lsof -i :7112`
2. Stop competing services
3. Or update `DEV_PORT` in `../../.env`

### Build Issues
```bash
# Clean rebuild
docker compose -p "cc-011-aerosafe-docs" --env-file ../../.env -f docker-compose.dev.yml down --volumes
docker compose -p "cc-011-aerosafe-docs" --env-file ../../.env -f docker-compose.dev.yml build --no-cache
```

### Volume Issues
```bash
# Reset volumes
docker compose -p "cc-011-aerosafe-docs" --env-file ../../.env -f docker-compose.dev.yml down --volumes --remove-orphans
```

### Log Debugging
```bash
# Real-time logs
docker compose -p "cc-011-aerosafe-docs" --env-file ../../.env -f docker-compose.dev.yml logs -f aerosafe-docs-dev
```

## Environment Variables

From `../../.env`:
- `PROJECT_SLUG=cc-011-aerosafe-docs`
- `BASE_PORT=7110`
- `DEV_PORT=7112`
- `NODE_ENV=development`
- `SITE_URL=https://docs.aerosafe.it`
- `BASE_URL=/`

## Standards Compliance

✅ **CLAUDE.md Docker Pattern**: Uses the exact command format from CLAUDE.md  
✅ **Port Registration**: Registered in `08-operations/ports.json`  
✅ **Project Isolation**: Unique PROJECT_SLUG for container namespacing  
✅ **Environment Configuration**: Proper `.env` file structure  
✅ **Development Features**: Hot reload, volume mounts, non-root user  

## Related Files

- **Port Registry**: `/mnt/c/Claude_Code/08-operations/ports.json`
- **Project Standards**: `/mnt/c/Claude_Code/CLAUDE.md` (Docker Development section)
- **Environment Config**: `CC-011-aerosafe-redesign/.env`