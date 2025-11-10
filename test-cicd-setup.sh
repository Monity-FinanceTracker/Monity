#!/bin/bash

# CI/CD Setup Test Script
# This script helps verify your CI/CD setup is correct

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Monity CI/CD Setup Verification Script                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# Check 1: Verify we're in the right directory
echo "1. Checking repository structure..."
if [ -d "frontend" ] && [ -d "backend" ] && [ -d ".github/workflows" ]; then
    print_status 0 "Repository structure looks correct"
else
    print_status 1 "Repository structure incorrect - are you in the Monity root directory?"
    exit 1
fi
echo ""

# Check 2: Verify workflow files exist
echo "2. Checking GitHub Actions workflow files..."

workflows=(
    "deploy-frontend.yml"
    "deploy-backend.yml"
    "quality-checks.yml"
    "ci-full.yml"
)

for workflow in "${workflows[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        print_status 0 "$workflow exists"
    else
        print_status 1 "$workflow missing"
    fi
done
echo ""

# Check 3: Verify Node.js is installed
echo "3. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status 0 "Node.js installed: $NODE_VERSION"

    if [[ "$NODE_VERSION" < "v18" ]]; then
        print_warning "Node.js version is below v18, recommend upgrading"
    fi
else
    print_status 1 "Node.js not installed"
fi
echo ""

# Check 4: Verify npm packages
echo "4. Checking package files..."

if [ -f "frontend/package.json" ]; then
    print_status 0 "Frontend package.json exists"
else
    print_status 1 "Frontend package.json missing"
fi

if [ -f "backend/package.json" ]; then
    print_status 0 "Backend package.json exists"
else
    print_status 1 "Backend package.json missing"
fi
echo ""

# Check 5: Test backend build scripts
echo "5. Checking npm scripts..."

cd backend
if grep -q "\"test\"" package.json; then
    print_status 0 "Backend has test script"
else
    print_warning "Backend missing test script (recommended)"
fi

if grep -q "\"start\"" package.json; then
    print_status 0 "Backend has start script"
else
    print_status 1 "Backend missing start script"
fi
cd ..

cd frontend
if grep -q "\"test\"" package.json; then
    print_status 0 "Frontend has test script"
else
    print_warning "Frontend missing test script"
fi

if grep -q "\"build\"" package.json; then
    print_status 0 "Frontend has build script"
else
    print_status 1 "Frontend missing build script"
fi
cd ..
echo ""

# Check 6: Verify AWS CLI
echo "6. Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | head -n1)
    print_status 0 "AWS CLI installed: $AWS_VERSION"

    # Test AWS credentials
    if aws sts get-caller-identity &> /dev/null; then
        print_status 0 "AWS credentials are valid"
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        print_info "AWS Account: $AWS_ACCOUNT"
    else
        print_warning "AWS credentials not configured or invalid"
        print_info "Run: aws configure"
    fi
else
    print_warning "AWS CLI not installed (optional for local testing)"
fi
echo ""

# Check 7: Check for Git
echo "7. Checking Git configuration..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_status 0 "Git installed: $GIT_VERSION"

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    print_info "Current branch: $CURRENT_BRANCH"

    # Check remote
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        print_status 0 "Git remote configured: $REMOTE_URL"
    else
        print_status 1 "Git remote not configured"
    fi
else
    print_status 1 "Git not installed"
fi
echo ""

# Check 8: Verify environment files
echo "8. Checking environment files..."

if [ -f "frontend/.env" ] || [ -f "frontend/.env.local" ]; then
    print_status 0 "Frontend environment file exists"
else
    print_warning "Frontend .env file not found (create .env.local for local dev)"
fi

if [ -f "backend/.env" ]; then
    print_status 0 "Backend .env file exists"
else
    print_warning "Backend .env file not found (required for deployment)"
fi
echo ""

# Check 9: Test SSH (if EC2 info provided)
echo "9. Testing EC2 connection (optional)..."
echo "   To test EC2 SSH connection, set these environment variables:"
echo "   export EC2_HOST='your-ec2-ip'"
echo "   export EC2_USERNAME='ec2-user'"
echo "   export EC2_SSH_KEY_PATH='/path/to/your-key.pem'"
echo ""

if [ -n "$EC2_HOST" ] && [ -n "$EC2_USERNAME" ] && [ -n "$EC2_SSH_KEY_PATH" ]; then
    print_info "Testing SSH connection to $EC2_USERNAME@$EC2_HOST..."

    if ssh -i "$EC2_SSH_KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$EC2_USERNAME@$EC2_HOST" "echo 'SSH connection successful'" &> /dev/null; then
        print_status 0 "SSH connection to EC2 successful"

        # Check if PM2 is installed
        if ssh -i "$EC2_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USERNAME@$EC2_HOST" "command -v pm2" &> /dev/null; then
            print_status 0 "PM2 is installed on EC2"

            # Get PM2 status
            PM2_STATUS=$(ssh -i "$EC2_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USERNAME@$EC2_HOST" "pm2 jlist" 2>/dev/null)
            if [ -n "$PM2_STATUS" ]; then
                print_info "PM2 apps running on EC2:"
                ssh -i "$EC2_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USERNAME@$EC2_HOST" "pm2 list"
            fi
        else
            print_warning "PM2 not installed on EC2"
        fi

        # Check if repository exists on EC2
        if ssh -i "$EC2_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USERNAME@$EC2_HOST" "[ -d ~/Monity ]" &> /dev/null; then
            print_status 0 "Monity repository exists on EC2"
        else
            print_warning "Monity repository not found on EC2 (expected at ~/Monity)"
        fi
    else
        print_status 1 "SSH connection to EC2 failed"
        print_info "Check: EC2 security group allows SSH from your IP"
        print_info "Check: SSH key path is correct"
        print_info "Check: EC2_USERNAME is correct (ec2-user, ubuntu, etc.)"
    fi
else
    print_info "Skipping EC2 connection test (environment variables not set)"
fi
echo ""

# Check 10: GitHub CLI (optional but helpful)
echo "10. Checking GitHub CLI (optional)..."
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n1)
    print_status 0 "GitHub CLI installed: $GH_VERSION"

    if gh auth status &> /dev/null; then
        print_status 0 "Authenticated with GitHub"
    else
        print_warning "Not authenticated with GitHub (run: gh auth login)"
    fi
else
    print_info "GitHub CLI not installed (optional, but helpful)"
    print_info "Install: https://cli.github.com/"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Summary                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "Next steps to complete CI/CD setup:"
echo ""
echo "1. Configure GitHub Secrets (if not done):"
echo "   → Go to: GitHub Repo → Settings → Secrets and variables → Actions"
echo "   → Add required secrets (see CI_CD_SETUP_CHECKLIST.md)"
echo ""
echo "2. Set up EC2 SSH key for GitHub Actions:"
echo "   → SSH to EC2"
echo "   → Generate key: ssh-keygen -t ed25519 -f ~/.ssh/github_actions"
echo "   → Add to authorized_keys"
echo "   → Copy private key to GitHub Secrets as EC2_SSH_KEY"
echo ""
echo "3. Test workflows:"
echo "   → Go to GitHub → Actions → Run workflow manually"
echo "   → Or push a small change to trigger automatic deployment"
echo ""
echo "4. Monitor first deployment:"
echo "   → Watch GitHub Actions logs"
echo "   → Check PM2 on EC2: ssh user@ec2 'pm2 status'"
echo "   → Verify health endpoint: curl https://api.monity-finance.com/health"
echo ""
echo "Documentation:"
echo "  • Complete guide: docs/CI_CD_GUIDE.md"
echo "  • Setup checklist: CI_CD_SETUP_CHECKLIST.md"
echo "  • AWS deployment: AWS_DEPLOYMENT_COMPLETE.md"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 Verification Complete!                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
