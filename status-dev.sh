#!/bin/bash
# AeroSafe Documentation Development Environment Status Checker

PROJECT_SLUG="cc-011-aerosafe-docs"
ENV_FILE="../../.env"
COMPOSE_FILE="docker-compose.dev.yml"

echo "📊 AeroSafe Documentation Development Environment Status"
echo "================================================"
echo ""

# Check if container is running
echo "🔍 Container Status:"
docker compose -p "$PROJECT_SLUG" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo ""
echo "🌐 Access Information:"
DEV_PORT=$(grep "^DEV_PORT=" "$ENV_FILE" | cut -d'=' -f2)
echo "   Development Site: http://localhost:${DEV_PORT:-7112}"

echo ""
echo "📋 Quick Commands:"
echo "   View logs: docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" logs -f"
echo "   Restart:   docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" restart"
echo "   Stop:      ./stop-dev.sh"