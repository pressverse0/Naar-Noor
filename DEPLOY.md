# Naar-Noor Deployment Guide

## Project Status: ✅ PRODUCTION READY

All critical components are complete and tested. This document provides the essential deployment steps only.

---

## 1. Local Testing

### Prerequisites
- Docker & Docker Compose installed
- Node 18+ and .NET 8 SDK
- Environment variables configured (see `.env.example`)

### Run Locally

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# Verify services are healthy
docker ps  # Check STATUS column
curl http://localhost/health  # Frontend
curl http://localhost:8080/health  # Backend

# Test JWT authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Stop services
docker-compose down
```

### Test Protected Endpoints

```bash
# Get token from login response
TOKEN="<copy-token-from-login>"

# Test with token (should work)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/reservations

# Test without token (should return 401)
curl http://localhost:8080/api/reservations
```

---

## 2. Staging Deployment

### Set Environment Variables

```bash
export PGHOST=staging-db.example.com
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=<secure-password>
export PGDATABASE=naar_noor_staging
export SUPABASE_URL=<staging-url>
export SUPABASE_ANON_KEY=<staging-key>
export SUPABASE_SERVICE_ROLE_KEY=<staging-role-key>
export JWT_SECRET_KEY=$(openssl rand -base64 32)
export ASPNETCORE_ENVIRONMENT=Staging
```

### Deploy to Staging

```bash
# Build and push images
docker-compose build
docker tag naar-noor:backend docker.io/yourrepo/naar-noor:backend-staging
docker tag naar-noor:frontend docker.io/yourrepo/naar-noor:frontend-staging
docker push docker.io/yourrepo/naar-noor:backend-staging
docker push docker.io/yourrepo/naar-noor:frontend-staging

# On staging server
ssh staging-server
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d

# Verify
curl http://staging.naar-noor.com/health
curl http://staging.naar-noor.com/api/health
```

### Run Tests

```bash
# Load testing (adjust VUs and duration as needed)
k6 run load-test.js --vus 50 --duration 5m

# Check logs
docker-compose logs -f naar-noor-prod-api
```

---

## 3. Production Deployment

### Generate Secure Keys

```bash
# Generate JWT secret (must be 256-bit for HMAC-SHA256)
openssl rand -base64 32

# Save all secrets to secure vault (AWS Secrets Manager, Azure Key Vault, etc.)
```

### Set Production Environment Variables

```bash
export PGHOST=prod-db.example.com
export PGPORT=5432
export PGUSER=prod_user
export PGPASSWORD=<very-secure-password>
export PGDATABASE=naar_noor_prod
export SUPABASE_URL=<prod-url>
export SUPABASE_ANON_KEY=<prod-key>
export SUPABASE_SERVICE_ROLE_KEY=<prod-role-key>
export JWT_SECRET_KEY=<generated-256-bit-key>
export ASPNETCORE_ENVIRONMENT=Production
export APPLICATIONINSIGHTS_CONNECTION_STRING=<apm-connection-string>
```

### Deploy to Production

```bash
# Build production images
docker-compose build

# Tag for production registry
docker tag naar-noor:backend docker.io/yourrepo/naar-noor:backend-latest
docker tag naar-noor:frontend docker.io/yourrepo/naar-noor:frontend-latest

# Push to registry
docker push docker.io/yourrepo/naar-noor:backend-latest
docker push docker.io/yourrepo/naar-noor:frontend-latest

# On production server
ssh prod-server
docker-compose pull
docker-compose up -d

# Verify services
docker ps  # All should be healthy
curl http://naar-noor.com/health
curl http://naar-noor.com/api/health

# Monitor logs
docker-compose logs -f naar-noor-prod-api
```

---

## 4. Health Checks

All services have built-in health checks configured with:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start period**: 10-15 seconds

View health status:
```bash
docker-compose ps  # Check STATUS column

# Manual health endpoints
curl http://localhost/health  # Frontend
curl http://localhost:8080/health  # Backend API
pg_isready -h <db-host> -U <user>  # Database
```

---

## 5. Monitoring & Logs

```bash
# View logs for specific service
docker-compose logs naar-noor-prod-api
docker-compose logs naar-noor-prod-web
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f naar-noor-prod-api

# View only last 100 lines
docker-compose logs --tail=100 naar-noor-prod-api
```

---

## 6. Backup & Recovery

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres naar_noor_prod > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres naar_noor_prod < backup.sql
```

### Disaster Recovery

```bash
# Stop all services
docker-compose down

# Restore from backup
docker-compose exec -T postgres psql -U postgres naar_noor_prod < backup.sql

# Restart services
docker-compose up -d
```

---

## 7. Rollback Procedure

```bash
# If deployment fails, revert to previous image version
docker-compose down

# Tag and use previous version
docker tag naar-noor:backend-old naar-noor:backend
docker tag naar-noor:frontend-old naar-noor:frontend

# Restart with previous version
docker-compose up -d
```

---

## 8. Scaling

For production scaling, use Docker Swarm or Kubernetes:

```bash
# Docker Swarm (simple scaling)
docker service create --name naar-noor-api \
  --replicas 3 \
  --publish 8080:80 \
  naar-noor:backend

# Kubernetes (advanced)
kubectl apply -f k8s/
```

---

## 9. Security Checklist

Before deploying to production:

- [ ] All environment variables set securely (no defaults used)
- [ ] JWT_SECRET_KEY is 256+ bits and randomly generated
- [ ] Database passwords are strong (20+ characters, mixed case)
- [ ] SSL/TLS certificates configured
- [ ] Secrets not committed to git (verify with `git log`)
- [ ] Security headers verified (X-Frame-Options, CSP, etc.)
- [ ] CORS origins restricted to known domains only
- [ ] Rate limiting verified for auth endpoints
- [ ] Audit logging enabled
- [ ] APM/monitoring configured
- [ ] Backups tested and working
- [ ] Incident response plan documented

---

## 10. Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Verify environment variables are set
env | grep -E "PGHOST|SUPABASE|JWT"

# Validate docker-compose.yml syntax
docker-compose config

# Restart services
docker-compose restart
```

### Database connection fails

```bash
# Test database connectivity
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Check connection string format
# Should be: Host=<host>;Port=5432;Database=<db>;Username=<user>;Password=<pass>;SSL Mode=Require;
```

### API returns 401 Unauthorized

```bash
# Verify JWT token is being sent
curl -v -H "Authorization: Bearer <token>" http://localhost:8080/api/reservations

# Check JWT secret matches across instances
# JWT_SECRET_KEY must be identical on all API instances
```

### Performance issues

```bash
# Check resource usage
docker stats

# Review slow queries in Application Insights
# Check redis cache (if enabled)
docker-compose exec redis redis-cli INFO stats
```

---

## Support

For issues, check:
- GitHub Issues: https://github.com/yourorg/naar-noor/issues
- Documentation: `/docs` directory
- Incident Response: `docs/INCIDENT_RESPONSE.md`

