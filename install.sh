#!/bin/bash

# SAS FS - Automated Linux Installation Script
# Supported OS: Ubuntu 22.04+, Debian 11+
# Description: Installs Node.js, Samba, project dependencies and systemd services.

set -e

# --- Configuration ---
INSTALL_DIR="/opt/filesystem-sas"
SAMBA_ROOT="/srv/samba"
NODE_VERSION="20"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SAS FS - Starting Installation ===${NC}"

# 1. Root Check
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (use sudo).${NC}"
   exit 1
fi

# 2. Update System
echo -e "${BLUE}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# 3. Essential Dependencies
echo -e "${BLUE}Installing essential dependencies (curl, git, build-essential, samba, quota)...${NC}"
apt-get install -y curl git build-essential samba quota quotatool

# 4. Install Node.js (Latest LTS)
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}Installing Node.js v${NODE_VERSION}...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js is already installed: $(node -v)${NC}"
fi

# 5. Directory Setup
echo -e "${BLUE}Setting up directories...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$SAMBA_ROOT"
chmod 777 "$SAMBA_ROOT"

# Copy project files if current dir is the repo
if [ -d "./backend" ] && [ -d "./frontend" ]; then
    echo -e "${BLUE}Deploying project files to $INSTALL_DIR...${NC}"
    cp -r ./backend "$INSTALL_DIR/"
    cp -r ./frontend "$INSTALL_DIR/"
    cp ./*.service "$INSTALL_DIR/" 2>/dev/null || true
fi

# 6. Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd "$INSTALL_DIR/backend"
npm install
npm install -g ts-node ts-node-dev typescript

# 7. Frontend Setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd "$INSTALL_DIR/frontend"
npm install

# 8. Systemd Service Creation
echo -e "${BLUE}Configuring Systemd Services...${NC}"

# Backend Service
cat > /etc/systemd/system/fs-sas-backend.service <<EOF
[Unit]
Description=Filesystem SAS Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
cat > /etc/systemd/system/fs-sas-frontend.service <<EOF
[Unit]
Description=Filesystem SAS Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/frontend
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 9. Activation
echo -e "${BLUE}Enabling and starting services...${NC}"
systemctl daemon-reload
systemctl enable fs-sas-backend.service
systemctl enable fs-sas-frontend.service
systemctl restart fs-sas-backend.service
systemctl restart fs-sas-frontend.service

echo -e "${GREEN}=== Installation Completed Successfully! ===${NC}"
echo -e "${BLUE}Backend is running on port 3001${NC}"
echo -e "${BLUE}Frontend is running on port 5173${NC}"
echo -e "${BLUE}Samba Root: $SAMBA_ROOT${NC}"
