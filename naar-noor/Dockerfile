# Frontend Container - Angular 18 with Nginx
# Naming Convention: naar-noor-{environment}-web
# Multi-stage build for optimized production image

# Stage 1: Build Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY naar-noor/package*.json ./

# Install dependencies using npm ci (clean install)
RUN npm ci

# Copy source code
COPY naar-noor/ .

# Build production bundle with Angular CLI
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm -rf ./*

# Copy compiled Angular app from builder stage
COPY --from=builder /app/dist/naar-noor/browser .

# Copy custom nginx configuration (references container hostnames)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy health check script
COPY health-check.sh /app/health-check.sh
RUN chmod +x /app/health-check.sh

# Metadata labels for container identification
LABEL \
    service="naar-noor-web" \
    component="frontend" \
    description="Naar & Noor Frontend - Angular 18 + Nginx" \
    version="1.0.0"

# Expose port
EXPOSE 80

# Health check - verifies Nginx is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/health-check.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

