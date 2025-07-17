# macOS Code Signing Setup Guide

## Prerequisites

1. Apple Developer Account ($99/year)
2. macOS computer with Xcode installed

## Steps to Enable Code Signing

### 1. Create Developer ID Certificate

1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Go to Certificates, Identifiers & Profiles
3. Click on Certificates → Create a New Certificate
4. Select "Developer ID Application"
5. Follow the instructions to create a CSR (Certificate Signing Request)
6. Download the certificate and install it in Keychain Access

### 2. Export Certificate for CI/CD

```bash
# Find your certificate name
security find-identity -v -p codesigning

# Export to p12 file
security export -k ~/Library/Keychains/login.keychain-db -t identities -f pkcs12 -o certificate.p12
```

### 3. Create App-Specific Password

1. Go to [Apple ID](https://appleid.apple.com)
2. Sign in and go to "Sign-In and Security"
3. Under "App-Specific Passwords", click "Generate Password"
4. Name it "Viny Notarization"
5. Save the password (format: xxxx-xxxx-xxxx-xxxx)

### 4. Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `CSC_LINK`: Base64 encoded certificate
  ```bash
  base64 -i certificate.p12 | pbcopy
  ```
- `CSC_KEY_PASSWORD`: Password used when exporting the certificate
- `APPLE_ID`: Your Apple ID email
- `APPLE_ID_PASSWORD`: The app-specific password from step 3
- `APPLE_TEAM_ID`: Found in Apple Developer account (10 characters)

### 5. Local Development Setup

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your credentials:

```env
APPLE_ID=your-email@example.com
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
CSC_NAME=Developer ID Application: Your Name (TEAMID)
```

### 6. Test Signing Locally

```bash
# Build with signing
npm run build:electron

# Verify signature
codesign -dv --verbose=4 dist-electron/mac/Viny.app
spctl -a -t exec -vvv dist-electron/mac/Viny.app
```

## Troubleshooting

### "Certificate not found"

- Make sure the certificate is in your Keychain
- Check that CSC_NAME matches exactly

### "Notarization failed"

- Verify app-specific password is correct
- Check that all entitlements are properly set
- Ensure hardened runtime is enabled

### "App is damaged"

- This means signing failed or is missing
- Check build logs for signing errors

## Notes

- First notarization can take 5-20 minutes
- Subsequent builds are usually faster
- Apple caches notarization, so same build hash is instant
