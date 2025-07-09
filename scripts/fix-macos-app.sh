#!/bin/bash

# Nototo macOS App Fixer
# This script removes all quarantine and security attributes from the app

echo "🔧 Nototo macOS App Fixer"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is only for macOS${NC}"
    exit 1
fi

# Find Nototo.app
APP_PATH=""
if [ -d "/Applications/Nototo.app" ]; then
    APP_PATH="/Applications/Nototo.app"
elif [ -d "./Nototo.app" ]; then
    APP_PATH="./Nototo.app"
elif [ -d "$1" ] && [[ "$1" == *"Nototo.app" ]]; then
    APP_PATH="$1"
else
    echo -e "${RED}❌ Nototo.app not found${NC}"
    echo "Usage: $0 [path-to-Nototo.app]"
    echo "Or install Nototo.app to /Applications first"
    exit 1
fi

echo "📦 Found Nototo at: $APP_PATH"
echo ""

# Ask for confirmation
echo -e "${YELLOW}This script will:${NC}"
echo "1. Remove ALL extended attributes from the app"
echo "2. Clear quarantine flags"
echo "3. Reset permissions"
echo "4. Remove code signature (if any)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🔓 Fixing Nototo.app..."

# Step 1: Remove ALL extended attributes
echo "1️⃣ Removing extended attributes..."
xattr -cr "$APP_PATH" 2>/dev/null || sudo xattr -cr "$APP_PATH"

# Step 2: Remove specific problematic attributes
echo "2️⃣ Removing specific attributes..."
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null || true
xattr -d com.apple.macl "$APP_PATH" 2>/dev/null || true
xattr -d com.apple.metadata:kMDItemWhereFroms "$APP_PATH" 2>/dev/null || true

# Step 3: Clear the code signature
echo "3️⃣ Removing code signature..."
codesign --remove-signature "$APP_PATH" 2>/dev/null || sudo codesign --remove-signature "$APP_PATH"

# Step 4: Fix permissions
echo "4️⃣ Fixing permissions..."
chmod -R 755 "$APP_PATH"

# Step 5: Clear Gatekeeper assessment
echo "5️⃣ Clearing Gatekeeper assessment..."
sudo spctl --master-disable 2>/dev/null || true
sleep 1
sudo spctl --master-enable 2>/dev/null || true

# Step 6: Add to Gatekeeper exceptions
echo "6️⃣ Adding to Gatekeeper exceptions..."
sudo spctl --add "$APP_PATH" 2>/dev/null || true
sudo spctl --enable --label "Nototo" 2>/dev/null || true

# Verify
echo ""
echo "🔍 Verifying..."
if xattr -l "$APP_PATH" 2>/dev/null | grep -q "com.apple.quarantine"; then
    echo -e "${YELLOW}⚠️  Some attributes may still be present${NC}"
else
    echo -e "${GREEN}✅ Attributes successfully removed${NC}"
fi

# Final test
echo ""
echo "🧪 Testing if app can be opened..."
if open -Ra "$APP_PATH" 2>/dev/null; then
    echo -e "${GREEN}✅ App can be opened!${NC}"
    echo ""
    echo "🎉 Success! You can now launch Nototo normally."
else
    echo -e "${YELLOW}⚠️  App might still have issues${NC}"
    echo ""
    echo "Try these additional steps:"
    echo "1. Restart your Mac"
    echo "2. Disable Gatekeeper temporarily:"
    echo "   sudo spctl --master-disable"
    echo "3. Open Nototo"
    echo "4. Re-enable Gatekeeper:"
    echo "   sudo spctl --master-enable"
fi

echo ""
echo "Report issues at: https://github.com/tomymaritano/nototo/issues"