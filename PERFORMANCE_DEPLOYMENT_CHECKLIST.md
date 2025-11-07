# Performance Optimization Deployment Checklist

## Pre-Deployment

- [ ] Review all changes in `PERFORMANCE_OPTIMIZATIONS.md`
- [ ] Backup current production database
- [ ] Test changes in development environment
- [ ] Verify git branch: `git status` (should be on `feature/awsServer`)

---

## Frontend Deployment (15 minutes)

### 1. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy to S3
```bash
# Option A: Using deploy script
bash deploy-s3.sh

# Option B: Manual deployment
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 3. Verify Frontend
- [ ] Open your app URL
- [ ] Open DevTools → Network tab
- [ ] Perform a few actions (navigate, add transaction)
- [ ] Verify only 1 auth request per session (not per API call)

---

## Backend Deployment (20 minutes)

### 1. SSH to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Update Code
```bash
cd /path/to/monity-backend

# Pull latest changes
git pull origin feature/awsServer

# Install dependencies
npm install
```

### 3. Restart Application
```bash
# Reload PM2 (zero downtime)
pm2 reload ecosystem.config.js

# Or restart if reload doesn't work
pm2 restart monity-backend

# Check status
pm2 status
pm2 logs monity-backend --lines 50
```

### 4. Verify Backend
- [ ] Check PM2 status: `pm2 status` (should show "online")
- [ ] Check logs: `pm2 logs monity-backend` (no errors)
- [ ] Test API: `curl http://localhost:3001/api/v1/health`

---

## Database Migration (10 minutes)

### 1. Run Index Creation

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy contents of `backend/migrations/add-performance-indexes.sql`
4. Paste and run in SQL Editor
5. Verify success (should see "CREATE INDEX" messages)

### 2. Verify Indexes

Run this query in SQL Editor:
```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('transactions', 'categories', 'savings_goals', 'budgets')
AND schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected:** Should see at least 10 indexes including:
- [ ] `idx_transactions_user_id`
- [ ] `idx_transactions_user_date`
- [ ] `idx_categories_user_id`
- [ ] `idx_savings_goals_user_id`
- [ ] `idx_budgets_user_id`

---

## Post-Deployment Testing (15 minutes)

### 1. Functional Tests

- [ ] **Login:** Should complete in < 3 seconds
- [ ] **Dashboard Load:** Should load in < 3 seconds
- [ ] **Add Transaction:** Should save and update balance instantly
- [ ] **View Transactions:** Should load quickly
- [ ] **Categories:** Should load instantly (after first load)

### 2. Performance Tests

Open DevTools → Network tab:

- [ ] **Balance API:** `/api/v1/balance/all`
  - First call: < 1 second
  - Second call (cached): < 100ms

- [ ] **Categories API:** `/api/v1/categories`
  - First call: < 500ms
  - Second call (cached): < 50ms

- [ ] **Transactions API:** `/api/v1/transactions?limit=3`
  - Should return in < 500ms

### 3. Cache Verification

Check PM2 logs for cache hits:
```bash
pm2 logs monity-backend | grep -i "cache hit"
```

Should see messages like:
```
Cache HIT for balance: balance:123:all
Cache HIT for categories: categories:123
```

---

## Success Criteria

✅ Deployment is successful when:

- [ ] Frontend loads in < 3 seconds
- [ ] Dashboard shows data in < 3 seconds
- [ ] No errors in PM2 logs
- [ ] Cache hits visible in logs
- [ ] Database indexes created
- [ ] All functional tests pass
- [ ] Performance tests show expected improvements

---

## Quick Test Commands

```bash
# Test from local machine
curl -I https://your-api-url.com/api/v1/health

# Check PM2 status on EC2
ssh ubuntu@your-ec2-ip "pm2 status"

# Check cache hits
ssh ubuntu@your-ec2-ip "pm2 logs monity-backend | grep 'Cache HIT' | wc -l"

# Check memory usage
ssh ubuntu@your-ec2-ip "pm2 monit"
```

---

**Completion Date:** _______________
**Performance Improvement:** _______________ %
