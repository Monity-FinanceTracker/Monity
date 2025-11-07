#!/bin/bash

# ===========================================
# Monity Frontend - S3 Deployment Script
# ===========================================
# This script builds and deploys the React frontend to S3

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration - UPDATE THESE VALUES
S3_BUCKET="monity-frontend"  # Your S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"  # Your CloudFront distribution ID
AWS_REGION="us-east-1"  # Your AWS region

echo "=========================================="
echo "Monity Frontend - S3 Deployment"
echo "=========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS credentials not configured. Run: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Checking environment file...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating .env.production from template...${NC}"
    cp .env.production.template .env.production
    echo -e "${RED}Please edit .env.production with your actual values!${NC}"
    read -p "Press Enter after configuring .env.production..."
fi

echo -e "${GREEN}Step 2: Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Step 3: Building production bundle...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed! dist directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 4: Uploading to S3...${NC}"
aws s3 sync dist/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.map"

# Upload index.html separately with no-cache to ensure updates are seen immediately
echo -e "${GREEN}Step 5: Uploading index.html (no cache)...${NC}"
aws s3 cp dist/index.html s3://${S3_BUCKET}/index.html \
  --region ${AWS_REGION} \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo -e "${GREEN}Step 6: Invalidating CloudFront cache...${NC}"
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E1234567890ABC" ]; then
    aws cloudfront create-invalidation \
      --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
      --paths "/*"
    echo -e "${GREEN}Cache invalidation created. It may take a few minutes to propagate.${NC}"
else
    echo -e "${YELLOW}CloudFront distribution ID not configured. Skipping cache invalidation.${NC}"
    echo "Update CLOUDFRONT_DISTRIBUTION_ID in this script after creating your distribution."
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Frontend deployed to: s3://${S3_BUCKET}"
echo "CloudFront URL: https://d111111abcdef8.cloudfront.net (check AWS console)"
echo "Custom Domain: https://app.yourdomain.com (after DNS configuration)"
echo ""
echo -e "${YELLOW}Note: CloudFront cache invalidation may take 5-15 minutes.${NC}"
echo ""

