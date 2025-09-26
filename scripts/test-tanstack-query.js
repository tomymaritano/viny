#!/usr/bin/env node

/**
 * Test script for TanStack Query migration
 *
 * This script helps test the gradual migration to TanStack Query
 * by enabling feature flags and providing test scenarios
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 TanStack Query Migration Test Script\n')

// Create a test HTML file that enables feature flags
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>TanStack Query Test</title>
    <script>
        // Enable all TanStack Query features
        localStorage.setItem('feature_useQueryForNotesList', 'true');
        localStorage.setItem('feature_useQueryForNotebooks', 'true');
        localStorage.setItem('feature_useQueryForSettings', 'true');
        localStorage.setItem('feature_useOptimisticUpdates', 'true');
        localStorage.setItem('feature_showReactQueryDevTools', 'true');
        
        console.log('✅ TanStack Query features enabled!');
        console.log('Feature flags:', {
            useQueryForNotesList: localStorage.getItem('feature_useQueryForNotesList'),
            useQueryForNotebooks: localStorage.getItem('feature_useQueryForNotebooks'),
            useQueryForSettings: localStorage.getItem('feature_useQueryForSettings'),
            useOptimisticUpdates: localStorage.getItem('feature_useOptimisticUpdates'),
            showReactQueryDevTools: localStorage.getItem('feature_showReactQueryDevTools')
        });
        
        // Redirect to main app
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    </script>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; }
        .features {
            text-align: left;
            margin: 2rem 0;
            padding: 1rem;
            background: #f0f0f0;
            border-radius: 4px;
        }
        .features li {
            margin: 0.5rem 0;
            color: #22c55e;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 TanStack Query Test Mode</h1>
        <p>Enabling TanStack Query features...</p>
        <div class="features">
            <strong>Enabled Features:</strong>
            <ul>
                <li>✅ Query-based Notes List</li>
                <li>✅ Query-based Notebooks</li>
                <li>✅ Query-based Settings</li>
                <li>✅ Optimistic Updates</li>
                <li>✅ React Query DevTools</li>
            </ul>
        </div>
        <p>Redirecting to app in 1 second...</p>
    </div>
</body>
</html>
`

// Create .env file for testing
const envContent = `
# TanStack Query Feature Flags
VITE_FEATURE_USEQUERYFORNOTESLIST=true
VITE_FEATURE_USEQUERYFORNOTEBOOKS=true
VITE_FEATURE_USEQUERYSFORSETTINGS=true
VITE_FEATURE_USEOPTIMISTICUPDATES=true
VITE_FEATURE_SHOWREACTQUERYDEVTOOLS=true
`

// Save files
const publicDir = path.join(__dirname, '..', 'public')
const testFilePath = path.join(publicDir, 'test-tanstack.html')
const envPath = path.join(__dirname, '..', '.env.test')

fs.writeFileSync(testFilePath, testHtml)
console.log(`✅ Created test file: ${testFilePath}`)

fs.writeFileSync(envPath, envContent.trim())
console.log(`✅ Created test env: ${envPath}`)

console.log('\n📋 Test Instructions:\n')
console.log('1. Start the dev server: npm run dev')
console.log('2. Open: http://localhost:5173/test-tanstack.html')
console.log('3. The app will load with TanStack Query enabled')
console.log('4. Open React DevTools to see React Query tab')
console.log('\n🧪 Test Scenarios:')
console.log('- Create a new note (should update instantly)')
console.log('- Edit note title (optimistic update)')
console.log('- Delete a note (instant UI feedback)')
console.log('- Create/rename notebooks (no refresh needed)')
console.log('- Check React Query DevTools for cache state')
console.log('\n🔄 To disable features:')
console.log('localStorage.clear(); location.reload();')
