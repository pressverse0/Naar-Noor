# Phase 4: Production Deployment

**Status**: ✅ READY FOR EXECUTION  
**Date**: June 28, 2026  
**Duration**: 1-2 hours  

---

## Phase 4 Overview

Deploy the complete Naar-Noor application to production:
- Backend: Already deployed to RunASP ✅
- Frontend: Deploy to Vercel
- Post-deployment validation
- Monitoring setup

---

## Task 4.1: Verify Backend Deployment (RunASP)

**Status**: ✅ ALREADY DEPLOYED

### Current Backend Status

**URL**: https://naar-noor.runasp.net  
**Status**: ✅ RUNNING  
**Last Deploy**: Latest commit pushed  
**Auto-Deploy**: ✅ ENABLED  

### Verify Backend Health

```bash
# Health check
curl -i https://naar-noor.runasp.net/health

# Expected: 200 OK
# Response: {"status":"Healthy"}
```

### Verify Backend Features

**Rate Limiting**:
```bash
# Send 6 requests (6th should return 429)
for i in {1..6}; do
  curl -X POST https://naar-noor.runasp.net/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!\"}" \
    -w "Status: %{http_code}\n"
done

# Expected: 200, 200, 200, 200, 200, 429 ✅
```

**CORS Headers**:
```bash
curl -i -H "Origin: https://naar-noor.vercel.app" \
  https://naar-noor.runasp.net/api/menu-items

# Expected: Access-Control-Allow-Origin: https://naar-noor.vercel.app
```

**Database Connectivity**:
```bash
curl -i https://naar-noor.runasp.net/api/chefs

# Expected: 200 OK with chef data
```

---

## Task 4.2: Deploy Frontend to Vercel

**Status**: ⏳ READY TO EXECUTE

### Frontend Build Status

**Build**: ✅ SUCCESSFUL  
**Location**: `dist/naar-noor/browser/`  
**Size**: 520.39 kB (8.39 kB over budget - acceptable)  
**Time**: 65.6 seconds  

### Deploy Steps

#### Option A: Deploy via GitHub (Recommended)

1. **Push code to main**:
   ```bash
   git push origin main
   ```

2. **Vercel auto-deploys**:
   - Watch: https://vercel.com/dashboard
   - Expected deploy time: 2-5 minutes
   - Status: Green ✅

3. **Access deployed app**:
   - URL: https://naar-noor.vercel.app
   - Expected: App loads successfully

#### Option B: Manual Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd naar-noor
   vercel --prod
   ```

3. **Verify**:
   - Check Vercel dashboard
   - URL: https://naar-noor.vercel.app

### Environment Variables in Vercel

**Set these in Vercel Dashboard** → Project Settings → Environment Variables:

```
VITE_API_BASE_URL=https://naar-noor.runasp.net/api
VITE_SUPABASE_URL=https://uyzocpvytoljigmcpafn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5em9jcHZ5dG9samlnbWNwYWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1OTc0MzYsImV4cCI6MjA5ODE3MzQzNn0.Atyx6bnxSHNti8OAEim7qHwXbLJftU-1BxaNVXsQc3M
```

---

## Task 4.3: Post-Deployment Validation

**Status**: ⏳ READY TO EXECUTE

### Step 1: Frontend Load Test (5 min)

```bash
# Open in browser
https://naar-noor.vercel.app

# Expected:
# - Page loads without errors
# - No console errors
# - Menu items visible
# - All images load
# - Navigation works
```

### Step 2: Health Check (2 min)

**Both Endpoints**:
```bash
# Backend
curl -i https://naar-noor.runasp.net/health

# Frontend  
curl -i https://naar-noor.vercel.app

# Both should return 200 OK
```

### Step 3: CORS Verification (2 min)

```bash
# Frontend → Backend communication
curl -i -H "Origin: https://naar-noor.vercel.app" \
  https://naar-noor.runasp.net/api/menu-items

# Expected:
# - HTTP/1.1 200 OK
# - Access-Control-Allow-Origin: https://naar-noor.vercel.app
```

### Step 4: Complete User Workflow (10 min)

1. **Register**:
   - Go to https://naar-noor.vercel.app/register
   - Create account
   - Verify email (if required)
   - ✅ Success

2. **Login**:
   - Go to https://naar-noor.vercel.app/login
   - Enter credentials
   - See dashboard
   - ✅ Success

3. **Browse Menu**:
   - Click Menu or Browse
   - View menu items
   - Apply filters
   - See descriptions and prices
   - ✅ Success

4. **Create Order**:
   - Add items to cart
   - Go to checkout
   - Complete order
   - See order confirmation
   - ✅ Success

5. **Make Reservation**:
   - Go to Reservations
   - Select date/time
   - Enter guest count
   - Submit reservation
   - ✅ Success

6. **Submit Review**:
   - Click on menu item
   - Write review
   - Rate (1-5 stars)
   - Submit
   - ✅ Success

### Step 5: Performance Check (5 min)

```bash
# Measure response time
curl -w "@curl-format.txt" -o /dev/null -s https://naar-noor.vercel.app

# Expected:
# Response time < 500ms
# First Byte < 200ms
```

### Step 6: Data Isolation Verification (5 min)

**Verify RLS Working**:

1. Create Account A
2. Login as Account A
3. Create Order from Account A
4. Logout
5. Create Account B
6. Login as Account B
7. Verify Cannot See Account A's Orders ✅

### Step 7: Rate Limiting Verification (2 min)

```bash
# Send 6 auth requests
for i in {1..6}; do
  curl -X POST https://naar-noor.runasp.net/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!\"}" \
    -w "Request $i: %{http_code}\n"
  sleep 1
done

# Expected: 200, 200, 200, 200, 200, 429
# 6th request should return 429 ✅
```

### Step 8: Logging Verification (2 min)

**Check RunASP Logs**:
1. Go to RunASP Dashboard
2. Select Naar-Noor API project
3. View Logs
4. Verify JSON format

Expected log:
```json
{"@t":"2026-06-28T10:30:45.1234567Z","@m":"User registered","UserId":"123","@l":"Information"}
```

---

## Deployment Checklist

### Before Deployment

- [ ] Backend health check passing
- [ ] Frontend builds successfully (520 kB)
- [ ] Environment variables configured
- [ ] CORS origin correct (https://naar-noor.vercel.app)
- [ ] Database connected
- [ ] RLS policies applied (13)
- [ ] Storage policies applied (8)
- [ ] Rate limiting configured
- [ ] Serilog logging active

### During Deployment

- [ ] Git push to main
- [ ] Vercel auto-deploy starts
- [ ] Deploy shows "Ready" ✅

### After Deployment

- [ ] Frontend loads without errors
- [ ] Backend health check 200 OK
- [ ] Frontend health check 200 OK
- [ ] CORS headers present
- [ ] User registration works
- [ ] User login works
- [ ] Menu browsing works
- [ ] Orders work
- [ ] Reservations work
- [ ] Reviews work
- [ ] Rate limiting returns 429
- [ ] RLS verified (data isolation)
- [ ] Logs in JSON format

---

## Rollback Plan

If deployment fails:

### Quick Rollback

**Frontend Vercel**:
1. Go to Vercel Dashboard
2. Click Project → Deployments
3. Select previous successful deployment
4. Click "Promote to Production"

**Backend RunASP**:
1. Revert last commit: `git revert <hash>`
2. Push: `git push origin main`
3. Auto-deploy triggers rollback

---

## Monitoring Setup

### Backend Monitoring (RunASP)

1. Go to RunASP Dashboard
2. Setup monitoring for:
   - API response times
   - Error rates
   - Database connectivity
   - Memory usage

### Frontend Monitoring (Vercel)

1. Go to Vercel Dashboard
2. Analytics tab shows:
   - Page load times
   - Traffic
   - Performance metrics

### Application Monitoring

**Log Aggregation**:
- RunASP logs in JSON format
- Search for errors: `@l":"Error"`
- Monitor performance: Response times

**Alert Setup**:
- Error rate > 1%
- Response time p95 > 1000ms
- Database connection failure
- API down (3 consecutive failures)

---

## Success Criteria

Production Deployment Complete When:

- [x] Backend responding (200 OK)
- [ ] Frontend deployed (Vercel)
- [ ] Frontend loads (no console errors)
- [ ] User registration works
- [ ] User login works
- [ ] Orders created successfully
- [ ] Reservations created successfully
- [ ] Reviews submitted successfully
- [ ] Rate limiting working (429 on 6th request)
- [ ] CORS headers correct
- [ ] RLS data isolation verified
- [ ] Logs in JSON format
- [ ] No errors in application logs

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Verify Backend | 5 min | ✅ |
| 2 | Deploy Frontend | 5 min | ⏳ Ready |
| 3 | Post-Deployment Tests | 30 min | ⏳ Ready |
| 4 | Monitoring Setup | 10 min | ⏳ Ready |
| 5 | Final Validation | 10 min | ⏳ Ready |
| **Total** | **Phase 4** | **~60 min** | ⏳ Ready |

---

## Deployment Commands

**Quick Reference**:

```bash
# Build frontend
cd naar-noor
npm run build

# Deploy via git (recommended)
git push origin main

# Or manual deploy
vercel --prod

# Verify backend
curl -i https://naar-noor.runasp.net/health

# Verify frontend
curl -i https://naar-noor.vercel.app
```

---

## Post-Deployment Verification

```bash
#!/bin/bash
# Quick verification script

echo "Checking Backend..."
curl -i https://naar-noor.runasp.net/health

echo -e "\nChecking Frontend..."
curl -i https://naar-noor.vercel.app

echo -e "\nChecking CORS..."
curl -i -H "Origin: https://naar-noor.vercel.app" \
  https://naar-noor.runasp.net/api/menu-items

echo -e "\nAll checks complete!"
```

---

## What's Deployed

### Backend (RunASP)

✅ **Already Deployed**:
- Rate Limiting (AspNetCoreRateLimit)
- Serilog Logging (JSON format)
- CORS (Production origin)
- Health Check
- Supabase Integration

### Frontend (Vercel)

⏳ **Ready to Deploy**:
- Angular 18 application
- TailwindCSS styling
- Cypress E2E tests
- Production build (520 kB)

### Database (Supabase)

✅ **Already Deployed**:
- 7 tables (schema)
- 13 RLS policies
- 8 Storage policies
- Indexes for performance

---

## Next: Phase 5 (After Deployment)

Once Phase 4 complete:

1. **Performance Optimization**
   - Analyze slow queries
   - Add caching
   - Optimize payloads

2. **Documentation**
   - API docs (Swagger)
   - Architecture guide
   - Deployment guide

3. **Backup & Recovery**
   - Automated backups
   - Disaster recovery plan
   - Point-in-time recovery

---

**Status**: ✅ Phase 4 READY TO EXECUTE

**Next Action**: Deploy frontend to Vercel or push to main for auto-deploy
