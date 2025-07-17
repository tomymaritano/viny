import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open settings modal', async ({ page }) => {
    // Click settings button in sidebar
    await page.click('[data-testid="settings-button"]');
    
    // Verify settings modal is visible
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    
    // Check if tabs are present
    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Editor')).toBeVisible();
    await expect(page.locator('text=Themes')).toBeVisible();
  });

  test('should change theme', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="settings-button"]');
    
    // Click on Themes tab
    await page.click('text=Themes');
    
    // Select light theme
    await page.click('[data-testid="theme-light"]');
    
    // Close settings
    await page.click('[data-testid="settings-close"]');
    
    // Verify theme is applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should change font size', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="settings-button"]');
    
    // Click on Editor tab
    await page.click('text=Editor');
    
    // Change font size
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    await fontSizeSlider.fill('16');
    
    // Close settings
    await page.click('[data-testid="settings-close"]');
    
    // Verify font size is applied
    const editor = page.locator('.cm-editor');
    await expect(editor).toHaveCSS('font-size', '16px');
  });

  test('should toggle auto-save', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="settings-button"]');
    
    // Find auto-save toggle
    const autoSaveToggle = page.locator('[data-testid="auto-save-toggle"]');
    
    // Check current state
    const isChecked = await autoSaveToggle.isChecked();
    
    // Toggle it
    await autoSaveToggle.click();
    
    // Verify state changed
    await expect(autoSaveToggle).toHaveProperty('checked', !isChecked);
    
    // Close settings
    await page.click('[data-testid="settings-close"]');
  });

  test('should persist settings after reload', async ({ page }) => {
    // Open settings and change theme
    await page.click('[data-testid="settings-button"]');
    await page.click('text=Themes');
    await page.click('[data-testid="theme-solarized-dark"]');
    await page.click('[data-testid="settings-close"]');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify theme persists
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'solarized-dark');
  });
});