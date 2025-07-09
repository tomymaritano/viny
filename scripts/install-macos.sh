#!/bin/bash

# Nototo macOS Installer Script
# This script automates the installation process for unsigned apps

echo "🚀 Nototo macOS Installer"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is only for macOS${NC}"
    exit 1
fi

# Find Nototo.app in current directory or mounted DMG
NOTOTO_APP=""
if [ -d "Nototo.app" ]; then
    NOTOTO_APP="Nototo.app"
elif [ -d "/Volumes/Nototo*/Nototo.app" ]; then
    NOTOTO_APP="/Volumes/Nototo*/Nototo.app"
else
    echo -e "${RED}❌ Nototo.app not found${NC}"
    echo "Please run this script from the directory containing Nototo.app"
    echo "or from the mounted DMG"
    exit 1
fi

echo "📦 Found Nototo.app: $NOTOTO_APP"
echo ""

# Ask for confirmation
echo -e "${YELLOW}This script will:${NC}"
echo "1. Copy Nototo.app to /Applications"
echo "2. Remove quarantine attributes (fixes 'damaged app' error)"
echo "3. Set proper permissions"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled"
    exit 0
fi

echo ""
echo "🔧 Installing Nototo..."

# Check if Nototo already exists in Applications
if [ -d "/Applications/Nototo.app" ]; then
    echo -e "${YELLOW}⚠️  Nototo.app already exists in /Applications${NC}"
    read -p "Replace existing installation? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing installation..."
        rm -rf "/Applications/Nototo.app"
    else
        echo "Installation cancelled"
        exit 0
    fi
fi

# Copy to Applications
echo "📋 Copying to Applications folder..."
if cp -R "$NOTOTO_APP" "/Applications/"; then
    echo -e "${GREEN}✅ Successfully copied to /Applications${NC}"
else
    echo -e "${RED}❌ Failed to copy. You may need to run with sudo:${NC}"
    echo "   sudo bash install-macos.sh"
    exit 1
fi

# Remove quarantine attribute and fix the app
echo "🔓 Removing quarantine attributes and fixing app..."

# Try multiple methods to ensure the app works
echo "   → Removing extended attributes..."
xattr -cr "/Applications/Nototo.app" 2>/dev/null || sudo xattr -cr "/Applications/Nototo.app"

echo "   → Removing quarantine flag..."
xattr -d com.apple.quarantine "/Applications/Nototo.app" 2>/dev/null || true

echo "   → Clearing code signature..."
codesign --remove-signature "/Applications/Nototo.app" 2>/dev/null || true

echo "   → Adding to Gatekeeper exceptions..."
sudo spctl --add "/Applications/Nototo.app" 2>/dev/null || true

echo -e "${GREEN}✅ App fixed and ready to use${NC}"

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 "/Applications/Nototo.app"

# Verify installation
if [ -d "/Applications/Nototo.app" ]; then
    echo ""
    echo -e "${GREEN}🎉 Installation complete!${NC}"
    echo ""
    echo "You can now:"
    echo "1. Launch Nototo from your Applications folder"
    echo "2. Or run: open /Applications/Nototo.app"
    echo ""
    
    # Ask if user wants to launch now
    read -p "Launch Nototo now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Launching Nototo..."
        open "/Applications/Nototo.app"
    fi
else
    echo -e "${RED}❌ Installation verification failed${NC}"
    exit 1
fi

echo ""
echo "Thank you for using Nototo! 💙"
echo "Report issues at: https://github.com/tomymaritano/nototo/issues"