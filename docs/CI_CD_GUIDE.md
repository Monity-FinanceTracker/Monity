# CI/CD Pipeline Guide for Monity

## Table of Contents
1. [Overview](#overview)
2. [Current Setup](#current-setup)
3. [Architecture](#architecture)
4. [GitHub Actions Workflows](#github-actions-workflows)
5. [Setup Instructions](#setup-instructions)
6. [Secrets Configuration](#secrets-configuration)
7. [Deployment Process](#deployment-process)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains how to set up and use CI/CD (Continuous Integration/Continuous Deployment) pipelines for Monity using GitHub Actions.

### What is CI/CD?

- **Continuous Integration (CI)**: Automatically test and validate code changes
- **Continuous Deployment (CD)**: Automatically deploy validated changes to production

### Benefits
- ✅ Faster deployments (from 30+ min to ~5 min)
- ✅ Fewer errors (automated testing)
- ✅ Consistent deployments (same process every time)
- ✅ Rollback capability (version history)
- ✅ Code quality enforcement

---

## Current Setup

### Frontend Pipeline ✅
**File**: `.github/workflows/deploy-frontend.yml`

**Triggers**:
- Push to `main`, `master`, or `production` branches
- Changes in `frontend/` directory
- Manual trigger (workflow_dispatch)

**Steps**:
1. Install dependencies
2. Create environment variables
3. Build React app (Vite)
4. Deploy to S3
5. Invalidate CloudFront cache

**Deployment Target**: AWS S3 + CloudFront

---

### Backend Pipeline ❌ (Needs Setup)
**File**: `.github/workflows/deploy-backend.yml` (to be created)

**Will Include**:
1. Run tests
2. Build application
3. Deploy to EC2 via SSH
4. Restart PM2 processes
5. Health check verification

**Deployment Target**: AWS EC2

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Developer Workflow                    │
└─────────────────────────────────────────────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │   git push to main   │
          └──────────────────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │   GitHub Actions     │
          │   Detects Changes    │
          └──────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│ Frontend Changes│    │ Backend Changes │
│   Detected?     │    │   Detected?     │
└─────────────────┘    └─────────────────┘
         │                       │
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│  Run Tests      │    │  Run Tests      │
│  Build Vite App │    │  Lint Code      │
│  Deploy to S3   │    │  SSH to EC2     │
│  Invalidate CF  │    │  git pull       │
│                 │    │  pm2 reload     │
└─────────────────┘    └─────────────────┘
         │                       │
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│  CloudFront CDN │    │   EC2 Instance  │
│  app.monity.com │    │  api.monity.com │
└─────────────────┘    └─────────────────┘
```

---

## GitHub Actions Workflows

### Workflow 1: Frontend Deployment (Existing)

**File**: `.github/workflows/deploy-frontend.yml`

**Current Configuration**:
```yaml
name: Deploy Frontend to S3 + CloudFront
on:
  push:
    branches: [main, master, production]
    paths: ['frontend/**']
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Create .env.production
      - Build production bundle
      - Configure AWS credentials
      - Deploy to S3 (with caching strategy)
      - Invalidate CloudFront cache
```

---

### Workflow 2: Backend Deployment (Needs Creation)

**File**: `.github/workflows/deploy-backend.yml` (to be created)

**Proposed Configuration**:
```yaml
name: Deploy Backend to EC2
on:
  push:
    branches: [main, master, production]
    paths: ['backend/**']
  workflow_dispatch:

jobs:
  test:
    - Run linting
    - Run unit tests
    - Security audit

  deploy:
    - SSH to EC2
    - Pull latest code
    - Install dependencies
    - Restart PM2
    - Health check
    - Rollback if failed
```

---

### Workflow 3: Quality Checks (Recommended)

**File**: `.github/workflows/quality-checks.yml` (optional but recommended)

**Purpose**: Run on all PRs before merging
```yaml
name: Quality Checks
on:
  pull_request:
    branches: [main, master, develop]

jobs:
  frontend-tests:
    - Lint frontend code
    - Run frontend tests
    - Build frontend (ensure no errors)

  backend-tests:
    - Lint backend code
    - Run backend tests
    - Security audit (npm audit)
```

---

## Setup Instructions

### Step 1: Prepare Your EC2 Instance

1. **SSH to your EC2 instance**:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

2. **Install Git** (if not already installed):
```bash
sudo yum update -y
sudo yum install git -y
```

3. **Clone your repository**:
```bash
cd /home/ec2-user
git clone https://github.com/yourusername/Monity.git
cd Monity/backend
```

4. **Set up deployment user**:
```bash
# Create deploy user (optional, but recommended for security)
sudo useradd -m -s /bin/bash deploy
sudo su - deploy

# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
# Press Enter for no passphrase (required for automation)

# Display public key
cat ~/.ssh/github_actions.pub
```

5. **Add SSH key to authorized_keys**:
```bash
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

6. **Get private key** (you'll add this to GitHub Secrets):
```bash
cat ~/.ssh/github_actions
# Copy this entire output
```

---

### Step 2: Configure GitHub Secrets

Navigate to: `GitHub Repo → Settings → Secrets and variables → Actions`

#### Frontend Secrets (Already Configured?)
- `AWS_ACCESS_KEY_ID` - Your AWS IAM user access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS IAM user secret key
- `AWS_REGION` - e.g., `us-east-1`
- `S3_BUCKET_NAME` - Your S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID` - Your CloudFront distribution ID
- `VITE_API_URL` - Your backend API URL
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

#### Backend Secrets (To Be Added)
- `EC2_HOST` - Your EC2 public IP or domain (e.g., `api.monity-finance.com`)
- `EC2_USERNAME` - SSH username (e.g., `ec2-user` or `deploy`)
- `EC2_SSH_KEY` - The private key from Step 1 (entire content)
- `BACKEND_ENV_FILE` - Complete .env file content for backend

**Example BACKEND_ENV_FILE**:
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key
JWT_SECRET=your-jwt-secret
# ... all other backend environment variables
```

---

### Step 3: Create Backend Deployment Workflow

This workflow will be created in the next step.

---

### Step 4: Test Your Pipeline

#### Test Frontend Deployment:
```bash
# Make a small change in frontend
echo "// CI/CD test" >> frontend/src/App.jsx

# Commit and push
git add .
git commit -m "test: trigger frontend CI/CD"
git push origin main

# Check GitHub Actions tab to see workflow running
```

#### Test Backend Deployment:
```bash
# Make a small change in backend
echo "// CI/CD test" >> backend/server.js

# Commit and push
git add .
git commit -m "test: trigger backend CI/CD"
git push origin main
```

---

## Secrets Configuration

### How to Get AWS Credentials

1. **Login to AWS Console**
2. **Navigate to IAM**
3. **Create new user** (if needed):
   - User name: `github-actions-deployer`
   - Access type: Programmatic access
4. **Attach policies**:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - Or create custom policy with minimal permissions
5. **Save credentials**:
   - Access Key ID
   - Secret Access Key

### Security Best Practices for Secrets

1. ✅ Never commit secrets to Git
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Rotate credentials every 90 days
4. ✅ Use minimal IAM permissions (principle of least privilege)
5. ✅ Different credentials for staging/production
6. ✅ Enable AWS CloudTrail for audit logs

---

## Deployment Process

### Manual Deployment (Current)

**Frontend**:
```bash
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://your-bucket/ --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```
**Time**: ~10-15 minutes

**Backend**:
```bash
ssh to EC2
cd Monity/backend
git pull
npm install
pm2 reload monity-backend
```
**Time**: ~5-10 minutes

**Total Manual Time**: ~20-25 minutes per deployment

---

### Automated Deployment (With CI/CD)

**Frontend**:
```bash
git push origin main
# GitHub Actions automatically:
# - Runs tests
# - Builds app
# - Deploys to S3
# - Invalidates CloudFront
```
**Time**: ~3-5 minutes (automated)

**Backend**:
```bash
git push origin main
# GitHub Actions automatically:
# - Runs tests
# - SSHs to EC2
# - Pulls latest code
# - Installs dependencies
# - Reloads PM2
```
**Time**: ~2-4 minutes (automated)

**Total Automated Time**: ~5-9 minutes (hands-off)

---

## Best Practices

### 1. Branch Strategy

**Recommended**: Git Flow
```
main/master    → Production (auto-deploy)
develop        → Staging (auto-deploy to staging)
feature/*      → Feature branches (no auto-deploy)
hotfix/*       → Emergency fixes
```

**Implementation**:
```yaml
# Deploy to production
on:
  push:
    branches: [main, master]

# Deploy to staging
on:
  push:
    branches: [develop]
```

---

### 2. Environment Management

**Use Multiple Environments**:
- **Development**: Local machine
- **Staging**: Test server (optional but recommended)
- **Production**: Live AWS deployment

**Workflow Example**:
```
Developer → Push to develop → Auto-deploy to Staging
   ↓
QA/Testing on Staging
   ↓
Merge to main → Auto-deploy to Production
```

---

### 3. Testing Strategy

**Frontend Tests**:
```yaml
- name: Run tests
  run: npm test -- --run
  working-directory: ./frontend
```

**Backend Tests**:
```yaml
- name: Run tests
  run: npm test
  working-directory: ./backend
```

**Current State**:
- Frontend: Has `vitest` configured
- Backend: Has `jest` configured

**Recommendation**: Add test coverage requirements

---

### 4. Rollback Strategy

**CloudFront/S3 Rollback**:
```bash
# S3 has versioning - can rollback via console
# Or redeploy previous commit:
git checkout <previous-commit-hash>
git push origin main --force
```

**EC2 Rollback**:
```bash
# SSH to EC2
cd /path/to/Monity/backend
git log --oneline  # Find previous version
git checkout <previous-commit-hash>
pm2 reload monity-backend
```

**Automated Rollback** (Advanced):
```yaml
- name: Health check
  run: curl -f https://api.monity-finance.com/health || exit 1

- name: Rollback on failure
  if: failure()
  run: |
    ssh user@ec2 "cd Monity/backend && git checkout HEAD~1 && pm2 reload"
```

---

### 5. Monitoring Deployments

**GitHub Actions Notifications**:
- Enable email notifications
- Use Slack/Discord webhooks

**AWS Monitoring**:
- CloudWatch Alarms
- PM2 monitoring
- CloudFront metrics

**Example Slack Notification**:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 6. Security Scanning

**Add to workflows**:
```yaml
- name: Security audit
  run: npm audit --audit-level=high

- name: Dependency check
  run: npm outdated
```

**Recommended GitHub Actions**:
- `snyk/actions` - Vulnerability scanning
- `github/codeql-action` - Code scanning
- `trufflesecurity/trufflehog` - Secret scanning

---

## Troubleshooting

### Common Issues

#### 1. Workflow Not Triggering

**Problem**: Push to main but workflow doesn't run

**Solutions**:
```bash
# Check workflow file syntax
cat .github/workflows/deploy-frontend.yml

# Ensure paths match
on:
  push:
    paths:
      - 'frontend/**'  # Correct
      # NOT: '/frontend/**' or 'frontend/*'

# Check branch name
git branch  # Ensure you're on 'main' not 'master'
```

---

#### 2. SSH Connection Failed

**Problem**: Cannot SSH to EC2 from GitHub Actions

**Solutions**:
```bash
# Verify SSH key is correct
# In GitHub Secrets, ensure EC2_SSH_KEY includes:
-----BEGIN OPENSSH PRIVATE KEY-----
... entire key ...
-----END OPENSSH PRIVATE KEY-----

# Verify EC2 security group allows SSH from GitHub IPs
# Better: Use GitHub's IP ranges or allow all (not recommended)

# Test SSH key locally
ssh -i key.pem ec2-user@your-ec2-ip

# Check EC2_USERNAME is correct (ec2-user, ubuntu, or deploy)
```

---

#### 3. Build Failures

**Problem**: Workflow fails during build step

**Solutions**:
```bash
# Check build locally first
cd frontend
npm install
npm run build

# Check environment variables
# Ensure all VITE_ variables are in GitHub Secrets

# Check Node version match
# GitHub Actions uses Node 20, ensure compatible
```

---

#### 4. CloudFront Invalidation Slow

**Problem**: Changes not visible immediately

**Expected Behavior**:
- CloudFront invalidation takes 1-5 minutes
- Not a problem, just AWS propagation delay

**Verification**:
```bash
# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id YOUR_ID \
  --id INVALIDATION_ID
```

---

#### 5. PM2 Not Restarting

**Problem**: Code deployed but app not updated

**Solutions**:
```bash
# SSH to EC2
ssh ec2-user@your-ec2

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs monity-backend --lines 100

# Manually reload
pm2 reload monity-backend

# Or restart
pm2 restart monity-backend

# Check app name matches
pm2 list  # Get exact app name
```

---

#### 6. Environment Variables Missing

**Problem**: App deployed but crashes due to missing env vars

**Solutions**:
```bash
# Verify .env file on EC2
ssh ec2-user@your-ec2
cat ~/Monity/backend/.env

# Ensure GitHub Secret BACKEND_ENV_FILE contains all variables

# Manually create if missing
cat > ~/Monity/backend/.env << EOF
NODE_ENV=production
PORT=3000
...
EOF
```

---

## Next Steps

### Immediate (Required)
1. ✅ Review existing frontend workflow
2. ⬜ Create backend deployment workflow
3. ⬜ Configure GitHub Secrets
4. ⬜ Test deployments

### Short-term (Recommended)
1. ⬜ Add automated tests to workflows
2. ⬜ Set up staging environment
3. ⬜ Configure Slack/Discord notifications
4. ⬜ Add security scanning

### Long-term (Optional)
1. ⬜ Implement blue-green deployments
2. ⬜ Add automatic rollback
3. ⬜ Set up CloudWatch dashboards
4. ⬜ Implement feature flags
5. ⬜ Add deployment approvals for production

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS CLI Reference](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

### Related Files in This Repo
- `AWS_DEPLOYMENT_COMPLETE.md` - AWS deployment overview
- `docs/EC2_DEPLOYMENT.md` - EC2 setup guide
- `docs/S3_CLOUDFRONT_DEPLOYMENT.md` - Frontend deployment
- `docs/MONITORING_GUIDE.md` - Monitoring and alerting

### GitHub Actions Marketplace
- [AWS Actions](https://github.com/aws-actions)
- [SSH Deploy Action](https://github.com/marketplace/actions/ssh-deploy)
- [Slack Notify](https://github.com/marketplace/actions/slack-notify)

---

## Summary

### What You Currently Have
✅ Frontend deployment to S3 + CloudFront (automated)
✅ AWS infrastructure documentation
✅ Manual backend deployment process

### What This Guide Provides
📚 Complete CI/CD explanation
🔧 Step-by-step setup instructions
🚀 Backend deployment automation
✅ Best practices and troubleshooting
📊 Monitoring and rollback strategies

### Time Investment vs. Savings
- **Setup Time**: 2-3 hours (one-time)
- **Time Saved Per Deployment**: 15-20 minutes
- **Break-even**: After 8-12 deployments
- **Annual Time Saved**: 50+ hours (if deploying weekly)

---

**Ready to automate? Let's create the backend deployment workflow next!**
