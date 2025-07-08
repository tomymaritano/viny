#!/bin/bash

echo "🔄 Creating Test Update v1.1.1"
echo "=============================="

# Show current version
echo "📦 Current version: $(node -p "require('./package.json').version")"

# Quick build for testing
echo "🚀 Building test version v1.1.1..."

# Clean previous build
rm -rf dist/ dist-electron/

# Build frontend
echo "⚛️ Building frontend..."
TARGET=electron npm run build

# Build Electron
echo "🖥️ Building Electron app..."
npm run build:electron

# Show results
echo ""
echo "✅ Build completed for v1.1.1!"
echo "=============================="

if [ -f "dist-electron/Nototo-1.1.1.dmg" ]; then
    echo "✅ Universal DMG: $(ls -lh dist-electron/Nototo-1.1.1.dmg | awk '{print $5}')"
fi

if [ -f "dist-electron/Nototo-1.1.1-arm64.dmg" ]; then
    echo "✅ ARM64 DMG: $(ls -lh dist-electron/Nototo-1.1.1-arm64.dmg | awk '{print $5}')"
fi

if [ -f "dist-electron/latest-mac.yml" ]; then
    echo "✅ Auto-updater metadata: latest-mac.yml"
    echo ""
    echo "📋 Update metadata:"
    cat dist-electron/latest-mac.yml
fi

echo ""
echo "🧪 Testing Instructions:"
echo "1. Install the v1.1.0 DMG first (if not already installed)"
echo "2. Run the app - it should show 'Nototo - Note Taking App'"
echo "3. Push this v1.1.1 to GitHub as a release"
echo "4. The app should detect the update and show notification"
echo "5. After update, title should show 'Nototo v1.1.1 - Note Taking App'"
echo "6. Check Settings → Updates to see v1.1.1 version"
echo ""
echo "🔗 DMG Location: $(pwd)/dist-electron/"