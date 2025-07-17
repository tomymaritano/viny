import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Create some test notes
    const notes = [
      { title: 'JavaScript Tutorial', content: 'Learn JavaScript basics' },
      { title: 'TypeScript Guide', content: 'TypeScript is a superset of JavaScript' },
      { title: 'React Hooks', content: 'useState and useEffect are essential hooks' },
      { title: 'Testing Best Practices', content: 'Write tests for your JavaScript code' }
    ];
    
    for (const note of notes) {
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill(note.title);
      await page.locator('[data-testid="note-editor"] .cm-content').fill(note.content);
      await page.waitForTimeout(500); // Wait for save
    }
  });

  test('should open search modal with keyboard shortcut', async ({ page }) => {
    // Press Cmd/Ctrl + K
    await page.keyboard.press('Meta+K');
    
    // Verify search modal is visible
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    
    // Verify search input is focused
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
  });

  test('should search notes by title', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+K');
    
    // Type search query
    await page.locator('[data-testid="search-input"]').type('JavaScript');
    
    // Wait for search results
    await page.waitForTimeout(300); // Debounce delay
    
    // Verify results
    const results = page.locator('[data-testid="search-results"]');
    await expect(results).toContainText('JavaScript Tutorial');
    await expect(results).toContainText('TypeScript Guide'); // Contains "JavaScript"
    
    // Should not show unrelated notes
    await expect(results).not.toContainText('React Hooks');
  });

  test('should search notes by content', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+K');
    
    // Search for content
    await page.locator('[data-testid="search-input"]').type('hooks');
    await page.waitForTimeout(300);
    
    // Verify results
    const results = page.locator('[data-testid="search-results"]');
    await expect(results).toContainText('React Hooks');
  });

  test('should navigate search results with keyboard', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+K');
    
    // Type search query
    await page.locator('[data-testid="search-input"]').type('JavaScript');
    await page.waitForTimeout(300);
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    
    // First result should be highlighted
    const firstResult = page.locator('[data-testid="search-result-item"]').first();
    await expect(firstResult).toHaveClass(/selected|active|highlighted/);
    
    // Press Enter to open the note
    await page.keyboard.press('Enter');
    
    // Search modal should close
    await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible();
    
    // Selected note should be open
    await expect(page.locator('[data-testid="note-title"]')).toContainText('JavaScript');
  });

  test('should show no results message', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+K');
    
    // Search for non-existent content
    await page.locator('[data-testid="search-input"]').type('xyz123nonexistent');
    await page.waitForTimeout(300);
    
    // Should show no results message
    await expect(page.locator('[data-testid="search-no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-no-results"]')).toContainText('No notes found');
  });

  test('should close search modal with Escape', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+K');
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible();
  });
});