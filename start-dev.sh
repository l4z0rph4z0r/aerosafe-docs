#!/bin/bash
# AeroSafe Documentation Development Environment Starter
# Following the Docker Development pattern from CLAUDE.md

PROJECT_SLUG="cc-011-aerosafe-docs"
ENV_FILE=".env"
COMPOSE_FILE="docker-compose.dev.yml"

echo "🚀 Starting AeroSafe Documentation Development Environment..."
echo "📁 Project: $PROJECT_SLUG"
echo "⚙️ Environment file: $ENV_FILE"
echo "📋 Compose file: $COMPOSE_FILE"

# Check if required files exist
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Environment file $ENV_FILE not found!"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Display port configuration from .env
echo "📋 Port Configuration:"
grep -E "^(BASE_PORT|DEV_PORT|STAGING_PORT|DOCS_PORT)=" "$ENV_FILE" | while IFS= read -r line; do
    echo "   $line"
done

echo ""
echo "🔧 Running: docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" up -d"
echo ""

# Execute the command
docker compose -p "$PROJECT_SLUG" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

# Check the result
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    echo "📱 Documentation site should be available at: http://localhost:7112"
    echo ""
    echo "📊 To check status: docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" ps"
    echo "📝 To view logs: docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" logs -f"
    echo "🛑 To stop: docker compose -p \"$PROJECT_SLUG\" --env-file \"$ENV_FILE\" -f \"$COMPOSE_FILE\" down"
else
    echo ""
    echo "❌ Failed to start container. Check the error messages above."
    exit 1
fi