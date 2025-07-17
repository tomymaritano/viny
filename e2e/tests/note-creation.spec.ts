import { test, expect } from '@playwright/test';

test.describe('Note Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new note', async ({ page }) => {
    // Click create note button
    await page.click('[data-testid="create-note-button"]');
    
    // Wait for the editor to appear
    await expect(page.locator('[data-testid="note-editor"]')).toBeVisible();
    
    // Check if a new untitled note is created
    await expect(page.locator('[data-testid="note-title"]')).toContainText('Untitled');
  });

  test('should save note content', async ({ page }) => {
    // Create a new note
    await page.click('[data-testid="create-note-button"]');
    
    // Type in the editor
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    await editor.type('# Test Note\n\nThis is a test note content.');
    
    // Wait for auto-save (debounced)
    await page.waitForTimeout(2000);
    
    // Verify the content is saved by refreshing
    await page.reload();
    
    // Check if content persists
    await expect(editor).toContainText('Test Note');
    await expect(editor).toContainText('This is a test note content.');
  });

  test('should update note title', async ({ page }) => {
    // Create a new note
    await page.click('[data-testid="create-note-button"]');
    
    // Click on title to edit
    const titleInput = page.locator('[data-testid="note-title-input"]');
    await titleInput.click();
    await titleInput.clear();
    await titleInput.type('My Important Note');
    await titleInput.press('Enter');
    
    // Verify title is updated
    await expect(page.locator('[data-testid="note-title"]')).toContainText('My Important Note');
    
    // Check if it appears in the notes list
    await expect(page.locator('[data-testid="notes-list"]')).toContainText('My Important Note');
  });

  test('should handle multiple notes', async ({ page }) => {
    // Create first note
    await page.click('[data-testid="create-note-button"]');
    await page.locator('[data-testid="note-title-input"]').fill('Note 1');
    
    // Create second note
    await page.click('[data-testid="create-note-button"]');
    await page.locator('[data-testid="note-title-input"]').fill('Note 2');
    
    // Create third note
    await page.click('[data-testid="create-note-button"]');
    await page.locator('[data-testid="note-title-input"]').fill('Note 3');
    
    // Verify all notes appear in the list
    const notesList = page.locator('[data-testid="notes-list"]');
    await expect(notesList).toContainText('Note 1');
    await expect(notesList).toContainText('Note 2');
    await expect(notesList).toContainText('Note 3');
  });
});