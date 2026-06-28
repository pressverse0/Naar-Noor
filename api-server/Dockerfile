# Backend Container - ASP.NET Core 8.0
# Naming Convention: naar-noor-{environment}-api
# Multi-stage build for optimized production image

# Stage 1: Build and publish .NET application
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder

WORKDIR /app

# Copy solution file
COPY api-server/NaarNoor.sln .

# Copy project files
COPY api-server/src ./src
COPY api-server/tests ./tests

# Restore dependencies
RUN dotnet restore NaarNoor.sln

# Build release configuration
RUN dotnet build NaarNoor.sln \
    --configuration Release \
    --no-restore \
    --verbosity minimal

# Publish API project
RUN dotnet publish src/NaarNoor.API/NaarNoor.API.csproj \
    --configuration Release \
    --no-build \
    --output /app/publish

# Stage 2: Runtime container
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine

WORKDIR /app

# Install health check dependencies
RUN apk add --no-cache curl

# Copy published application from builder stage
COPY --from=builder /app/publish .

# Metadata labels for container identification
LABEL \
    service="naar-noor-api" \
    component="backend" \
    description="Naar & Noor Backend - .NET 8.0 ASP.NET Core" \
    version="1.0.0"

# Expose port
EXPOSE 80

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80 \
    ASPNETCORE_ENVIRONMENT=Production

# Health check - verifies API responds to HTTP GET
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "NaarNoor.API.dll"]

