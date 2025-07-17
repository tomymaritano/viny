# Security Setup Guide

## Environment Variables Security

This guide explains how to securely configure sensitive environment variables for the Viny/Viny application.

### ⚠️ Security Best Practices

1. **Never commit credentials** to version control
2. **Use different credentials** for development and production
3. **Store secrets securely** using appropriate tools
4. **Rotate credentials regularly**
5. **Use least privilege principle** - only grant necessary permissions

### 🔐 Secure Storage Options

#### Local Development

- Create a `.env.local` file (gitignored)
- Use OS keychain/credential manager
- Use tools like `direnv` for directory-specific environments

#### CI/CD

- GitHub Actions: Use repository secrets
- Store in CI/CD platform's secret management
- Never log or echo secret values

#### Production

- Use environment-specific configuration
- Cloud provider secret managers (AWS Secrets Manager, etc.)
- Kubernetes secrets for containerized deployments

### 📝 Required Credentials

#### Apple Developer (macOS builds)

```bash
# Required for notarization and signing
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASSWORD=app-specific-password  # Generate at appleid.apple.com
APPLE_TEAM_ID=XXXXXXXXXX               # From Apple Developer account
CSC_NAME="Developer ID Application: Your Name (TEAM_ID)"
CSC_KEY_PASSWORD=certificate-password   # Only for .p12 files
```

#### GitHub Token (Auto-updates)

```bash
# For private repository auto-updates
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
# Required scopes: repo (full control of private repositories)
```

### 🛠️ Setup Instructions

1. **Copy example file**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in credentials**
   - Add your actual values to `.env.local`
   - Leave `.env.example` with empty values

3. **Verify gitignore**

   ```bash
   # Ensure .env.local is ignored
   grep -E "\.env\.local|\.env\*" .gitignore
   ```

4. **Test configuration**
   ```bash
   # Test without exposing secrets
   npm run build:test
   ```

### 🚨 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No real credentials in `.env.example`
- [ ] Passwords are app-specific (not main account password)
- [ ] Tokens have minimal required permissions
- [ ] CI/CD uses secret variables, not hardcoded values
- [ ] Production uses secure secret management
- [ ] Regular credential rotation schedule in place

### 📚 Additional Resources

- [Apple Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Environment Variables Best Practices](https://12factor.net/config)
