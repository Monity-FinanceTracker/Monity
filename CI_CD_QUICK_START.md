# CI/CD Quick Start Guide

## What Just Got Created

I've set up a complete CI/CD pipeline for your Monity project! Here's what you have now:

### 📁 New Files

1. **docs/CI_CD_GUIDE.md** - Complete 15,000+ word guide
2. **.github/workflows/deploy-backend.yml** - Backend deployment workflow
3. **.github/workflows/quality-checks.yml** - PR quality checks
4. **.github/workflows/ci-full.yml** - Full CI/CD pipeline
5. **CI_CD_SETUP_CHECKLIST.md** - Step-by-step checklist
6. **test-cicd-setup.sh** - Automated verification script

---

## What This Does For You

### Before CI/CD (Manual):
```
⏱️  20-30 minutes per deployment
😰 High stress (manual steps)
🐛 Error-prone
📝 Easy to forget steps
```

### After CI/CD (Automated):
```
⏱️  5-9 minutes (hands-off)
😎 No stress (automated)
✅ Reliable
🚀 Consistent every time
```

---

## The Flow

```
You write code → git push origin main
                      ↓
            GitHub Actions runs
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
   Frontend                     Backend
   - Tests                      - Tests
   - Build                      - Lint
   - Deploy to S3               - SSH to EC2
   - Invalidate CF              - git pull
                                - pm2 reload
        ↓                           ↓
   ✅ Live on S3             ✅ Live on EC2
```

---

## 3-Step Quick Setup

### Step 1: Prepare EC2 (15 min)

SSH to your EC2 and generate a deploy key:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Add to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copy private key (for GitHub Secrets)
cat ~/.ssh/github_actions
```

Copy the ENTIRE output (including BEGIN and END lines).

### Step 2: Add GitHub Secrets (10 min)

Go to: **GitHub → Your Repo → Settings → Secrets → Actions**

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `EC2_HOST` | EC2 IP or domain | `api.monity-finance.com` |
| `EC2_USERNAME` | SSH username | `ec2-user` |
| `EC2_SSH_KEY` | Private key from Step 1 | `-----BEGIN OPENSSH...` |

**Already have** (from frontend deployment):
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
- ✅ S3_BUCKET_NAME
- ✅ CLOUDFRONT_DISTRIBUTION_ID
- ✅ VITE_* variables

### Step 3: Test It! (5 min)

**Option A - Manual trigger** (safest):
1. Go to GitHub → Actions tab
2. Select "Deploy Backend to EC2"
3. Click "Run workflow"
4. Watch it run!

**Option B - Push a change**:
```bash
echo "// CI/CD test" >> backend/server.js
git add .
git commit -m "test: CI/CD"
git push origin main

# Watch at: GitHub → Actions
```

---

## What Each Workflow Does

### 1. deploy-frontend.yml ✅ (Existing)

**When**: Push to `main` with frontend changes

**Does**:
- Builds React app
- Uploads to S3
- Invalidates CloudFront

**Result**: Frontend live on CloudFront

---

### 2. deploy-backend.yml 🆕 (NEW)

**When**: Push to `main` with backend changes

**Does**:
- Runs tests
- SSHs to EC2
- Pulls latest code
- Reloads PM2
- Health check
- Rolls back if failed

**Result**: Backend live on EC2

---

### 3. quality-checks.yml 🆕 (NEW)

**When**: Pull Request created

**Does**:
- Lints code
- Runs tests
- Security scan
- Build verification

**Result**: Only quality code gets merged

---

### 4. ci-full.yml 🆕 (NEW)

**When**: Any push or PR

**Does**:
- Detects what changed
- Runs appropriate pipelines
- Parallel execution

**Result**: Fastest, most complete CI/CD

---

## Real Example

You fix a bug:

```bash
# 1. Create branch
git checkout -b fix/bug

# 2. Fix the bug
vim backend/services/transactionService.js

# 3. Push and create PR
git add .
git commit -m "fix: transaction calculation"
git push origin fix/bug

# 4. GitHub automatically runs quality checks
#    Shows ✅ or ❌ on PR

# 5. Merge PR to main

# 6. GitHub automatically:
#    - Tests
#    - Deploys to EC2
#    - Health check
#    - Notifies you

# 7. Live in 5 minutes! ✅
```

---

## Verification

Run the test script:

```bash
./test-cicd-setup.sh
```

This checks:
- ✅ Repository structure
- ✅ Workflow files
- ✅ Node.js installed
- ✅ AWS CLI configured
- ✅ Git setup
- ✅ (Optional) EC2 connection

---

## Troubleshooting

### SSH Connection Failed

```bash
# Test SSH locally
ssh -i ~/.ssh/github_actions ec2-user@your-ec2-ip

# Verify key in GitHub Secrets includes:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

### PM2 App Not Found

```bash
# Check exact PM2 app name
ssh ec2-user@your-ec2-ip "pm2 list"

# Update workflow with correct name
# In .github/workflows/deploy-backend.yml
pm2 reload YOUR_ACTUAL_APP_NAME
```

### Health Check Failed

```bash
# Test endpoint manually
curl https://api.monity-finance.com/api/v1/health

# Check PM2 logs
ssh ec2-user@your-ec2-ip "pm2 logs monity-backend"
```

---

## Next Steps

### Right Now
1. ✅ Review this guide
2. ⬜ Run `./test-cicd-setup.sh`
3. ⬜ Follow 3-step setup
4. ⬜ Test with a small change
5. ⬜ Monitor first deployment

### This Week
1. ⬜ Add Slack notifications
2. ⬜ Set up staging environment
3. ⬜ Add more tests
4. ⬜ Configure deployment approvals

---

## Files to Read

**Start here**:
1. **CI_CD_QUICK_START.md** (this file) - Overview
2. **CI_CD_SETUP_CHECKLIST.md** - Step-by-step

**Deep dive**:
3. **docs/CI_CD_GUIDE.md** - Complete docs

**Reference**:
4. **.github/workflows/** - Workflow files

---

## Summary

### What You Have Now

| Feature | Status |
|---------|--------|
| Frontend auto-deploy | ✅ Ready |
| Backend auto-deploy | 🆕 Ready (needs setup) |
| Quality checks on PRs | 🆕 Ready |
| Automated testing | ✅ Ready |
| Security scanning | 🆕 Ready |
| Rollback on failure | 🆕 Ready |
| Health checks | 🆕 Ready |

### Time Investment

- **Setup**: 30-45 minutes (one-time)
- **Per deployment**: 0 minutes (automated)
- **Savings**: 20+ minutes per deployment

### ROI

**Weekly deployments**: Save ~17 hours/year
**Daily deployments**: Save ~120 hours/year

---

## Architecture Diagram

```
┌────────────────────────────────────────┐
│         Developer (You)                │
│        writes code locally             │
└──────────────┬─────────────────────────┘
               ↓ git push origin main
               │
┌──────────────┴─────────────────────────┐
│         GitHub Repository              │
│  ┌─────────────────────────────────┐   │
│  │   GitHub Actions Workflows      │   │
│  │  ┌─────────┐    ┌─────────┐    │   │
│  │  │ Quality │    │ Deploy  │    │   │
│  │  │ Checks  │    │ to Prod │    │   │
│  │  └─────────┘    └─────────┘    │   │
│  └─────────────────────────────────┘   │
└──────────────┬─────────────────────────┘
               │
     ┌─────────┴─────────┐
     ↓                   ↓
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │  Backend    │
│  Deploy S3  │    │  Deploy EC2 │
└──────┬──────┘    └──────┬──────┘
       ↓                  ↓
┌─────────────┐    ┌─────────────┐
│ CloudFront  │    │ EC2 + PM2   │
│ + S3 Bucket │    │ Node.js API │
└─────────────┘    └─────────────┘
       │                  │
       └──────────┬───────┘
                  ↓
      ┌───────────────────────┐
      │   Production (AWS)    │
      │   Live Application    │
      └───────────────────────┘
```

---

## Ready to Deploy!

1. Open **CI_CD_SETUP_CHECKLIST.md**
2. Follow the checklist
3. Run `./test-cicd-setup.sh`
4. Push a change and watch it deploy!

---

## Need Help?

- 📖 Complete guide: `docs/CI_CD_GUIDE.md`
- ✅ Checklist: `CI_CD_SETUP_CHECKLIST.md`
- 🔍 Troubleshooting: `docs/CI_CD_GUIDE.md#troubleshooting`

---

**You're all set! Let's automate those deployments! 🚀**
