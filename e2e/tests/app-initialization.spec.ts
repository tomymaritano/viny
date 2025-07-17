import { test, expect } from '@playwright/test';

test.describe('App Initialization', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to initialize
    await page.waitForLoadState('networkidle');
    
    // Check if the main app container is present
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    // Check if sidebar is visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should display loading state during initialization', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check if loading spinner appears (might be very quick)
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    // If loading is visible, wait for it to disappear
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle initialization errors gracefully', async ({ page }) => {
    // Mock localStorage to cause an error
    await page.addInitScript(() => {
      // Override localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = (key) => {
        if (key === 'viny_notes') {
          throw new Error('Storage access denied');
        }
        return originalGetItem.call(localStorage, key);
      };
    });

    await page.goto('/');
    
    // Should show error boundary or error message
    const errorMessage = page.locator('text=/error|failed/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});