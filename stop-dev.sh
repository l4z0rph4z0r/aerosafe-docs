#!/bin/bash
# AeroSafe Documentation Development Environment Stopper

PROJECT_SLUG="cc-011-aerosafe-docs"
ENV_FILE=".env"
COMPOSE_FILE="docker-compose.dev.yml"

echo "🛑 Stopping AeroSafe Documentation Development Environment..."
echo "📁 Project: $PROJECT_SLUG"

# Stop and remove containers
docker compose -p "$PROJECT_SLUG" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down

# Check the result
if [ $? -eq 0 ]; then
    echo "✅ Container stopped successfully!"
else
    echo "❌ Failed to stop container. Check the error messages above."
    exit 1
fi