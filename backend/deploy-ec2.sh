#!/bin/bash

# ===========================================
# Monity Backend - EC2 Deployment Script
# ===========================================
# This script sets up the backend on a fresh EC2 instance
# Run this script as ubuntu user: bash deploy-ec2.sh

set -e  # Exit on any error

echo "=========================================="
echo "Monity Backend - EC2 Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as ubuntu user.${NC}"
   exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo -e "${GREEN}Step 2: Installing Node.js 20.x...${NC}"
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo -e "${GREEN}Step 3: Installing PM2 globally...${NC}"
sudo npm install -g pm2

echo -e "${GREEN}Step 4: Installing nginx (reverse proxy)...${NC}"
sudo apt-get install -y nginx

echo -e "${GREEN}Step 5: Installing git...${NC}"
sudo apt-get install -y git

echo -e "${GREEN}Step 6: Creating application directory...${NC}"
mkdir -p ~/Monity/backend
cd ~/Monity/backend

echo -e "${YELLOW}Step 7: Clone your repository or upload code...${NC}"
echo "Options:"
echo "  a) Clone from git: git clone <your-repo-url> ~/Monity"
echo "  b) Upload code via SCP/SFTP"
echo "  c) Code already present"
echo ""
read -p "Have you uploaded/cloned your code to ~/Monity/backend? (y/n): " code_ready

if [ "$code_ready" != "y" ]; then
    echo -e "${YELLOW}Please clone your repository or upload your code, then run this script again.${NC}"
    echo "Example: git clone https://github.com/yourusername/monity.git ~/Monity"
    exit 0
fi

echo -e "${GREEN}Step 8: Installing dependencies...${NC}"
cd ~/Monity/backend
npm install --production

echo -e "${GREEN}Step 9: Creating logs directory...${NC}"
mkdir -p logs

echo -e "${YELLOW}Step 10: Environment variables setup...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.production.template .env
    echo -e "${RED}IMPORTANT: Edit ~/Monity/backend/.env with your actual values!${NC}"
    echo "Use: nano ~/Monity/backend/.env"
    read -p "Press Enter after you've configured .env file..."
else
    echo ".env file already exists"
fi

echo -e "${GREEN}Step 11: Setting up PM2...${NC}"
pm2 delete monity-backend 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "${GREEN}Step 12: Configuring nginx reverse proxy...${NC}"
sudo tee /etc/nginx/sites-available/monity-backend > /dev/null <<EOF
server {
    listen 80;
    server_name api.yourdomain.com;  # Change this to your actual domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/monity-backend-access.log;
    error_log /var/log/nginx/monity-backend-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

echo -e "${GREEN}Step 13: Enabling nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/monity-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}Step 14: Configuring firewall...${NC}"
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

echo -e "${GREEN}Step 15: Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/monity-backend > /dev/null <<EOF
/home/ubuntu/Monity/backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
}
EOF

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Backend is now running on port 3000"
echo "Nginx is proxying requests on port 80"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check PM2 status"
echo "  pm2 logs monity-backend - View logs"
echo "  pm2 restart monity-backend - Restart app"
echo "  pm2 monit               - Monitor resources"
echo "  sudo systemctl status nginx - Check nginx"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure SSL certificate (see DOMAIN_SSL_GUIDE.md)"
echo "2. Update nginx config with your actual domain"
echo "3. Test your API: curl http://your-ec2-ip/api/v1/health"
echo "4. Configure AWS Security Group to allow HTTP/HTTPS"
echo ""

