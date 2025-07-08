#!/bin/bash

# Test Auto-Update System
# This script helps test the auto-update functionality

echo "🔄 Testing Auto-Update System for Nototo"
echo "========================================"

# Check current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: v$CURRENT_VERSION"

# Check if we're on a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Please commit or stash them before testing updates"
    exit 1
fi

echo ""
echo "🎯 Test Options:"
echo "1. Create patch release (v$CURRENT_VERSION -> v$(node -p "require('semver').inc('$CURRENT_VERSION', 'patch')")"
echo "2. Create minor release (v$CURRENT_VERSION -> v$(node -p "require('semver').inc('$CURRENT_VERSION', 'minor')")"
echo "3. Check GitHub Actions status"
echo "4. Download latest release manually"
echo ""

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "🚀 Creating patch release..."
        npm run release
        echo "✅ Patch release created! Check GitHub Actions for build progress."
        ;;
    2)
        echo "🚀 Creating minor release..."
        npm run release:minor
        echo "✅ Minor release created! Check GitHub Actions for build progress."
        ;;
    3)
        echo "🔍 Checking GitHub Actions status..."
        if command -v gh &> /dev/null; then
            gh run list --limit 5
        else
            echo "Install GitHub CLI (gh) to check status, or visit:"
            echo "https://github.com/tomymaritano/markdown/actions"
        fi
        ;;
    4)
        echo "📥 Opening GitHub releases page..."
        if command -v open &> /dev/null; then
            open "https://github.com/tomymaritano/markdown/releases"
        else
            echo "Visit: https://github.com/tomymaritano/markdown/releases"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📋 Next Steps:"
echo "1. Wait for GitHub Actions to complete the build"
echo "2. Check the new release on GitHub"
echo "3. Test auto-update in the running app"
echo "4. Verify the update notification appears"
echo ""
echo "🔗 Useful Links:"
echo "   GitHub Actions: https://github.com/tomymaritano/markdown/actions"
echo "   Releases: https://github.com/tomymaritano/markdown/releases"
echo "   Issues: https://github.com/tomymaritano/markdown/issues"