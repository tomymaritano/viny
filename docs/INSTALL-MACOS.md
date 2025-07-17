# Installing Viny on macOS

## ⚠️ Important: macOS Security Warning

Due to Apple's security requirements, you may see a warning that "Viny is damaged and can't be opened" when trying to run the app for the first time. This is because the app is not yet notarized by Apple.

## 🔧 Solution: Remove Quarantine Attribute

### Method 1: Using Terminal (Recommended)

1. **Download the .dmg file** from the [latest release](https://github.com/tomymaritano/viny/releases/latest)

2. **Open the .dmg file** and drag Viny to your Applications folder

3. **Open Terminal** (found in Applications > Utilities)

4. **Run this command** to remove the quarantine attribute:

   ```bash
   xattr -cr /Applications/Viny.app
   ```

5. **Launch Viny** from your Applications folder

### Method 2: Using System Preferences

1. **Try to open the app** - you'll see the security warning

2. **Open System Preferences** > **Security & Privacy**

3. In the **General** tab, you should see a message about Viny being blocked

4. Click **"Open Anyway"**

5. When prompted again, click **"Open"**

### Method 3: Right-click Method

1. **Right-click** (or Control-click) on the Viny app in Applications

2. Select **"Open"** from the context menu

3. In the dialog that appears, click **"Open"**

## 🔐 Why This Happens

- macOS Gatekeeper blocks apps that aren't signed by identified developers
- We're working on getting an Apple Developer certificate for future releases
- This is a one-time process - after the first launch, the app will open normally

## 🚀 Future Improvements

We're planning to implement proper code signing and notarization in future releases to eliminate this friction. Track our progress in [Issue #10](https://github.com/tomymaritano/viny/issues/10).

## ❓ Still Having Issues?

If you continue to experience problems:

1. Make sure you've downloaded the correct version for your Mac (Intel or Apple Silicon)
2. Check that macOS is up to date
3. Try restarting your Mac after removing the quarantine attribute
4. [Open an issue](https://github.com/tomymaritano/viny/issues/new) if problems persist

---

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
