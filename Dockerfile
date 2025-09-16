# Multi-stage build for AeroSafe Documentation Site
# Stage 1: Build the Docusaurus site
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions for reproducible builds
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build arguments for environment-specific builds
ARG NODE_ENV=production
ARG DOCUSAURUS_URL=https://docs.aerosafe.it
ARG DOCUSAURUS_BASE_URL=/

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV DOCUSAURUS_URL=$DOCUSAURUS_URL
ENV DOCUSAURUS_BASE_URL=$DOCUSAURUS_BASE_URL

# Build the site
RUN npm run build

# Stage 2: Production server
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# Create nginx user and group with specific IDs for security
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Copy built site from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Create directories for nginx
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx /usr/share/nginx/html

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Use nginx-debug for better logging in development
CMD ["nginx", "-g", "daemon off;"]

# Metadata labels
LABEL maintainer="AeroSafe (IST S.r.l.s.) <info@aerosafe.it>" \
      version="1.0.0" \
      description="AeroSafe Documentation Site - Docusaurus with Nginx" \
      org.opencontainers.image.title="AeroSafe Documentation" \
      org.opencontainers.image.description="Official documentation for AeroSafe DryFogS nebulizers and sanitizing solutions" \
      org.opencontainers.image.vendor="IST S.r.l.s." \
      org.opencontainers.image.source="https://github.com/aerosafe-ist/aerosafe-docs"