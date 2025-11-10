# CI/CD Setup Checklist

Use this checklist to set up your complete CI/CD pipeline for Monity.

## Overview

You now have 4 GitHub Actions workflows:
1. **deploy-frontend.yml** - Deploys React app to S3 + CloudFront (already exists)
2. **deploy-backend.yml** - Deploys Node.js API to EC2 (NEW)
3. **quality-checks.yml** - Runs tests on PRs (NEW)
4. **ci-full.yml** - Complete CI/CD pipeline (NEW, optional)

---

## Setup Checklist

### Phase 1: Prepare EC2 (30 minutes)

- [ ] **SSH to your EC2 instance**
  ```bash
  ssh -i your-key.pem ec2-user@your-ec2-ip
  ```

- [ ] **Verify Git is installed**
  ```bash
  git --version
  # If not installed: sudo yum install git -y
  ```

- [ ] **Clone or verify repository on EC2**
  ```bash
  cd ~
  ls -la | grep Monity
  # If not cloned: git clone https://github.com/yourusername/Monity.git
  ```

- [ ] **Set up backend**
  ```bash
  cd ~/Monity/backend
  npm install
  ```

- [ ] **Verify PM2 is running backend**
  ```bash
  pm2 status
  # Should show "monity-backend" (or similar)
  ```

- [ ] **Note your PM2 app name** (you'll need this)
  ```
  App name: ___________________ (e.g., "monity-backend")
  ```

- [ ] **Generate SSH key for GitHub Actions**
  ```bash
  ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
  # Press Enter twice (no passphrase)
  ```

- [ ] **Add SSH key to authorized_keys**
  ```bash
  cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```

- [ ] **Copy private key** (you'll add to GitHub Secrets)
  ```bash
  cat ~/.ssh/github_actions
  # Copy the ENTIRE output including:
  # -----BEGIN OPENSSH PRIVATE KEY-----
  # ... all the key content ...
  # -----END OPENSSH PRIVATE KEY-----
  ```

- [ ] **Note EC2 connection details**
  ```
  EC2 Host/IP: ___________________ (e.g., "3.14.159.265" or "api.monity-finance.com")
  EC2 Username: ___________________ (usually "ec2-user" or "ubuntu")
  ```

---

### Phase 2: Configure GitHub Secrets (20 minutes)

Navigate to: `GitHub → Your Repo → Settings → Secrets and variables → Actions`

#### Existing Secrets (verify these exist)

- [ ] `AWS_ACCESS_KEY_ID` - Your AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- [ ] `AWS_REGION` - e.g., `us-east-1`
- [ ] `S3_BUCKET_NAME` - Your S3 bucket for frontend
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` - Your CloudFront distribution ID
- [ ] `VITE_API_URL` - Your backend API URL (e.g., `https://api.monity-finance.com`)
- [ ] `VITE_SUPABASE_URL` - Your Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

#### New Secrets (add these for backend deployment)

- [ ] `EC2_HOST` - Your EC2 public IP or domain
  ```
  Example: api.monity-finance.com
  OR: 3.14.159.265
  ```

- [ ] `EC2_USERNAME` - SSH username for EC2
  ```
  Example: ec2-user (Amazon Linux)
  OR: ubuntu (Ubuntu)
  ```

- [ ] `EC2_SSH_KEY` - Private SSH key from Phase 1
  ```
  Copy entire output from: cat ~/.ssh/github_actions
  Must include -----BEGIN and -----END lines
  ```

- [ ] `BACKEND_API_URL` (optional) - Full API URL for health checks
  ```
  Example: https://api.monity-finance.com
  ```

- [ ] `BACKEND_ENV_FILE` (optional but recommended)
  ```
  Complete .env file content for backend
  Example:
  NODE_ENV=production
  PORT=3000
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_KEY=your-key
  JWT_SECRET=your-secret
  # ... all other env vars
  ```

---

### Phase 3: Test Workflows (30 minutes)

#### Test 1: Verify workflow files exist

- [ ] Check frontend workflow
  ```bash
  cat .github/workflows/deploy-frontend.yml
  ```

- [ ] Check backend workflow
  ```bash
  cat .github/workflows/deploy-backend.yml
  ```

- [ ] Check quality checks workflow
  ```bash
  cat .github/workflows/quality-checks.yml
  ```

#### Test 2: Manual trigger (safest first test)

- [ ] Go to GitHub → Actions tab
- [ ] Select "Deploy Backend to EC2"
- [ ] Click "Run workflow" dropdown
- [ ] Select branch (main/master)
- [ ] Click green "Run workflow" button
- [ ] Watch the workflow run
- [ ] Verify all steps pass ✅

#### Test 3: Trigger with commit

- [ ] Make a small change to test backend deployment
  ```bash
  cd backend
  echo "// CI/CD test $(date)" >> server.js
  git add server.js
  git commit -m "test: trigger backend CI/CD"
  git push origin main
  ```

- [ ] Watch GitHub Actions run
- [ ] Verify deployment succeeds
- [ ] Check your EC2
  ```bash
  ssh ec2-user@your-ec2-ip
  pm2 logs monity-backend --lines 20
  ```

- [ ] Remove test comment from server.js
  ```bash
  git checkout backend/server.js
  git commit -am "chore: remove test comment"
  git push origin main
  ```

#### Test 4: Test frontend deployment

- [ ] Make a small change
  ```bash
  cd frontend
  echo "// CI/CD test $(date)" >> src/App.jsx
  git add .
  git commit -m "test: trigger frontend CI/CD"
  git push origin main
  ```

- [ ] Watch GitHub Actions
- [ ] Verify deployment to S3
- [ ] Check your website loads

#### Test 5: Test quality checks on PR

- [ ] Create a test branch
  ```bash
  git checkout -b test/ci-cd-quality-checks
  echo "// quality check test" >> backend/server.js
  git add .
  git commit -m "test: quality checks"
  git push origin test/ci-cd-quality-checks
  ```

- [ ] Create Pull Request on GitHub
- [ ] Watch quality checks run
- [ ] Verify checks pass
- [ ] Close/delete the PR (don't merge)

---

### Phase 4: Configure PM2 on EC2 (if needed)

- [ ] Verify PM2 app name matches workflow
  ```bash
  ssh ec2-user@your-ec2-ip
  pm2 list
  # Note the exact name (e.g., "monity-backend")
  ```

- [ ] If PM2 app name is different, update workflow
  ```yaml
  # In .github/workflows/deploy-backend.yml
  # Change "monity-backend" to your actual app name
  pm2 reload YOUR_ACTUAL_APP_NAME
  ```

- [ ] Verify PM2 ecosystem config (if using)
  ```bash
  cat ~/Monity/backend/ecosystem.config.js
  ```

---

### Phase 5: Verify End-to-End (20 minutes)

#### Backend Health Check

- [ ] Visit your API health endpoint
  ```
  https://api.monity-finance.com/api/v1/health
  Should return: 200 OK
  ```

- [ ] Check PM2 on EC2
  ```bash
  ssh ec2-user@your-ec2-ip
  pm2 status
  pm2 logs monity-backend --lines 50
  ```

#### Frontend Check

- [ ] Visit your frontend
  ```
  https://app.monity-finance.com
  Should load without errors
  ```

- [ ] Check browser console
  - No errors
  - API calls work

#### Deployment Verification

- [ ] Check recent GitHub Actions
  - All workflows show green ✅
  - No failed deployments

- [ ] Check CloudFront
  - AWS Console → CloudFront → Your distribution
  - Should show recent invalidation

- [ ] Check S3
  - AWS Console → S3 → Your bucket
  - Should show recent uploads

---

## Common Issues & Solutions

### Issue 1: SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
```bash
# Verify SSH key is in GitHub Secrets
# Ensure it includes -----BEGIN and -----END lines
# Check EC2_USERNAME is correct (ec2-user vs ubuntu)
# Test SSH locally:
ssh -i ~/.ssh/github_actions ec2-user@your-ec2-ip
```

---

### Issue 2: PM2 App Not Found

**Error**: `[PM2] App [monity-backend] not found`

**Solution**:
```bash
# SSH to EC2
pm2 list
# Note the actual app name
# Update workflow file with correct name
```

---

### Issue 3: Health Check Failed

**Error**: `Health check failed after 5 attempts`

**Solution**:
```bash
# Check if backend is actually running
ssh ec2-user@your-ec2-ip "pm2 status"

# Check backend logs
ssh ec2-user@your-ec2-ip "pm2 logs monity-backend"

# Verify health endpoint works manually
curl https://api.monity-finance.com/api/v1/health

# Check if BACKEND_API_URL secret is correct
```

---

### Issue 4: Build Failures

**Error**: Various build errors

**Solution**:
```bash
# Test build locally first
cd frontend
npm install
npm run build

cd ../backend
npm install
npm test

# Ensure all environment variables are in GitHub Secrets
```

---

### Issue 5: AWS Credentials Error

**Error**: `Unable to locate credentials`

**Solution**:
```bash
# Verify AWS secrets in GitHub
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_REGION

# Test AWS CLI locally
aws s3 ls s3://your-bucket-name
```

---

## Success Criteria

Your CI/CD is fully operational when:

- [x] ✅ Push to `main` automatically deploys backend to EC2
- [x] ✅ Push to `main` automatically deploys frontend to S3
- [x] ✅ Pull requests trigger quality checks
- [x] ✅ All GitHub Actions show green checkmarks
- [x] ✅ Health checks pass after deployment
- [x] ✅ Website loads correctly after deployment
- [x] ✅ No manual SSH required for deployments

---

## Next Steps

### Immediate
1. Monitor first few deployments closely
2. Check logs after each deployment
3. Test rollback if deployment fails

### Short-term
1. Add Slack/Discord notifications
2. Set up staging environment
3. Add more comprehensive tests
4. Configure automated backups

### Long-term
1. Implement blue-green deployments
2. Add automatic rollback on failure
3. Set up performance monitoring
4. Add deployment approvals for production

---

## Quick Reference

### Manual Deployment Commands

**Frontend**:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

**Backend**:
```bash
ssh ec2-user@your-ec2-ip
cd ~/Monity/backend
git pull origin main
npm install --production
pm2 reload monity-backend
```

### Useful Commands

**Check workflow status**:
```bash
# View on GitHub
https://github.com/yourusername/Monity/actions

# Or use GitHub CLI
gh run list
gh run view <run-id>
```

**Check PM2 on EC2**:
```bash
ssh ec2-user@your-ec2-ip "pm2 status"
ssh ec2-user@your-ec2-ip "pm2 logs monity-backend --lines 100"
```

**Test health endpoint**:
```bash
curl -I https://api.monity-finance.com/api/v1/health
```

**Invalidate CloudFront manually**:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## Resources

- [CI/CD Guide](docs/CI_CD_GUIDE.md) - Complete documentation
- [AWS Deployment](AWS_DEPLOYMENT_COMPLETE.md) - AWS setup
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## Support

If you encounter issues:

1. Check [Troubleshooting](docs/CI_CD_GUIDE.md#troubleshooting) section
2. Review GitHub Actions logs
3. Check PM2 logs on EC2
4. Verify all secrets are configured correctly

---

**Total Setup Time**: ~1.5-2 hours (one-time setup)

**Time Saved Per Deployment**: ~15-20 minutes

**Break-even**: After 6-8 deployments

---

Good luck! 🚀
