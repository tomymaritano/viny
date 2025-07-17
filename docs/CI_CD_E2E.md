# CI/CD for E2E Testing

This document explains the continuous integration and deployment setup for end-to-end testing in the Viny project.

## Overview

We use GitHub Actions to run E2E tests automatically on:

- Every push to main/develop branches
- Every pull request
- Daily scheduled runs
- Manual workflow triggers

## Workflows

### 1. E2E Tests (`e2e.yml`)

Runs on every push and pull request to ensure code quality.

**Features:**

- Matrix testing across 3 browsers (Chromium, Firefox, WebKit)
- Parallel execution for faster feedback
- Artifact uploads for test results and videos
- Automatic retry on flaky tests

**Usage:**

```yaml
# Triggered automatically on:
- push to main/develop
- pull requests
```

### 2. Scheduled E2E Tests (`e2e-schedule.yml`)

Comprehensive testing across multiple operating systems.

**Features:**

- Runs daily at 2 AM UTC
- Tests on Ubuntu, Windows, and macOS
- Creates GitHub issues on failure
- Extended test retention (30 days)

**Manual trigger:**

```bash
# Via GitHub UI: Actions > Scheduled E2E Tests > Run workflow
```

### 3. PR Checks (`pr-checks.yml`)

Fast feedback for pull requests.

**Checks:**

- ESLint and TypeScript validation
- Unit tests with coverage
- E2E smoke tests (critical paths only)
- Bundle size analysis

**Smoke tests:**
Tests marked with `@smoke` tag run on every PR:

```typescript
test('should load app @smoke', async ({ page }) => {
  // Critical path test
})
```

## Local Development

### Running E2E Tests Locally

```bash
# Install Playwright browsers (first time)
npm run test:e2e:install

# Run all tests
npm run test:e2e

# Run in UI mode (recommended for development)
npm run test:e2e:ui

# Run specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run smoke tests only
npm run test:e2e:smoke

# Debug failing tests
npm run test:e2e:debug
```

### Writing E2E Tests

1. **Add data-testid attributes** to components:

```tsx
<button data-testid="create-note-button">Create Note</button>
```

2. **Use page objects** for reusability:

```typescript
class NotePage {
  constructor(private page: Page) {}

  async createNote() {
    await this.page.click('[data-testid="create-note-button"]')
  }
}
```

3. **Tag tests** appropriately:

```typescript
test('critical feature @smoke', async ({ page }) => {
  // Test that must pass on every PR
})

test('edge case @skip', async ({ page }) => {
  // Test that can be skipped in CI
})
```

## CI/CD Configuration

### Environment Variables

Set in GitHub repository settings:

- `CODECOV_TOKEN` - For coverage reports
- `SLACK_WEBHOOK` - For notifications (optional)

### Branch Protection

Recommended settings for `main` branch:

- Require PR checks to pass
- Require up-to-date branches
- Require code review approval
- Include administrators

### Performance Optimization

1. **Parallel execution**: Tests run in parallel across multiple workers
2. **Smart retries**: Flaky tests are automatically retried
3. **Selective testing**: Only affected tests run on PRs
4. **Browser caching**: Playwright browsers are cached in CI

## Monitoring and Debugging

### Test Reports

Access test reports:

1. Go to Actions tab in GitHub
2. Click on the workflow run
3. Download artifacts:
   - `playwright-report-*` - HTML reports
   - `test-videos-*` - Failure recordings

### Debugging CI Failures

1. **Check screenshots**: Automatically captured on failure
2. **Watch videos**: Full test execution recordings
3. **Run locally**: Reproduce with same browser/OS
4. **Use artifacts**: Download and inspect locally

### Common Issues

**Tests pass locally but fail in CI:**

- Check for timing issues (add explicit waits)
- Verify environment variables
- Check for OS-specific behavior
- Review viewport/resolution differences

**Flaky tests:**

- Add `test.retry(2)` for unstable tests
- Use `waitForLoadState('networkidle')`
- Avoid arbitrary timeouts
- Check for race conditions

## Best Practices

1. **Keep tests independent**: Each test should be able to run in isolation
2. **Use meaningful selectors**: Prefer data-testid over CSS selectors
3. **Avoid hard-coded waits**: Use Playwright's built-in waiting mechanisms
4. **Clean up after tests**: Reset application state between tests
5. **Group related tests**: Use `describe` blocks for organization

## Maintenance

### Updating Playwright

```bash
# Update to latest version
npm update @playwright/test

# Update browsers
npm run test:e2e:install
```

### Reviewing Test Performance

Monitor test execution times in CI:

- Tests taking >30s should be optimized
- Consider splitting large test files
- Use parallel execution within tests

### Cost Optimization

GitHub Actions usage:

- Free for public repositories
- 2,000 minutes/month for private repos
- Optimize by:
  - Running full suite only on main branch
  - Using smoke tests for PRs
  - Scheduling comprehensive tests overnight
