#!/bin/bash

echo "🚀 Building Nototo v1.1.0 with Auto-Updater"
echo "============================================"

# Step 1: Clean previous builds and dependencies
echo "🧹 Cleaning previous builds and node_modules..."
rm -rf dist/
rm -rf dist-electron/
rm -rf node_modules/
rm -f package-lock.json

# Step 2: Fresh install of dependencies
echo "📦 Installing fresh dependencies..."
npm install

# Step 3: Verify electron-updater installation
echo "🔍 Verifying electron-updater installation..."
npm list electron-updater

# Step 4: Build frontend optimized for Electron
echo "⚛️ Building optimized frontend..."
TARGET=electron npm run build

# Step 5: Build Electron app with auto-updater
echo "🖥️ Building Electron app with auto-updater..."
npm run build:electron

# Step 6: Verify build output
echo "✅ Build completed! Checking output..."
ls -la dist-electron/

echo ""
echo "🎉 Build Results:"
echo "================"

if [ -f "dist-electron/Nototo-1.1.0.dmg" ]; then
    echo "✅ Universal DMG: $(ls -lh dist-electron/Nototo-1.1.0.dmg | awk '{print $5}')"
fi

if [ -f "dist-electron/Nototo-1.1.0-arm64.dmg" ]; then
    echo "✅ ARM64 DMG: $(ls -lh dist-electron/Nototo-1.1.0-arm64.dmg | awk '{print $5}')"
fi

if [ -f "dist-electron/latest-mac.yml" ]; then
    echo "✅ Auto-updater metadata: latest-mac.yml"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Install the new DMG to replace your current v1.0.0"
echo "2. Test the auto-updater functionality"
echo "3. Create v1.1.1 release to test auto-updates"
echo ""
echo "🔗 DMG Location: $(pwd)/dist-electron/"