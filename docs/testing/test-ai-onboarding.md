# AI Onboarding Test Guide

## Manual Test Steps

1. **Clear AI Settings** (to trigger onboarding)
   - Open browser DevTools console
   - Run: `localStorage.removeItem('viny-settings')`
   - Or modify settings to set `ai.onboardingCompleted: false`

2. **Reload the app**
   - The AI onboarding modal should appear after 2 seconds

3. **Test Flow Options**

   ### Option A: Install AI Assistant
   - Click "Install AI Assistant"
   - If Electron: Auto-download should start
   - If Web: Manual instructions appear
   - Progress bar should show installation status
   - On completion: "Get Started" button appears

   ### Option B: Skip Installation
   - Click "Maybe Later"
   - Modal closes
   - Settings updated with `skipInstallation: true`

4. **Verify Settings Update**
   - Open DevTools console
   - Run: `JSON.parse(localStorage.getItem('viny-settings')).ai`
   - Should show:
     ```json
     {
       "onboardingCompleted": true,
       "enableAIAssistant": true, // if installed
       "skipInstallation": true // if skipped
     }
     ```

5. **Test Search Modal Integration**
   - Press Cmd+K to open search
   - If AI installed: Q&A feature should be available
   - If skipped: Regular search only

## Implementation Summary

1. **Created AI Onboarding System**:
   - `OllamaInstaller.ts` - Handles automatic installation
   - `AIOnboardingModal.tsx` - User-friendly onboarding UI
   - Auto-detection of Electron vs Web environment

2. **Integration Points**:
   - AppContainer checks AI settings on mount
   - Shows modal if not onboarded
   - Updates settings on completion
   - Search modal checks AI availability

3. **User Benefits**:
   - No manual installation required
   - Clear value proposition
   - Privacy-focused messaging
   - Easy skip option for later

## Next Steps

1. **Test the onboarding flow** using the steps above
2. **Add WebLLM integration** for browser-only users
3. **Create AI management UI** in Settings
4. **Add model selection** options
