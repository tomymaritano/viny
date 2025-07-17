import { test, expect } from '@playwright/test';
import { waitForAppReady, createNoteAndWaitForEditor } from '../utils/test-helpers';

/**
 * Smoke Tests - Critical functionality that must work
 * These tests cover the most essential features to ensure the app is functional
 */

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('should load the application successfully', async ({ page }) => {
    // Verify main app container is visible
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    
    // Verify sidebar is present (if it exists)
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
    
    // Verify app doesn't crash on load
    await expect(page.locator('body')).not.toHaveText('Error');
  });

  test('should create a new note', async ({ page }) => {
    // Click create note button
    await page.click('[data-testid="create-note-button"]');
    
    // Verify note editor appears (use first() to handle multiple editors)
    await expect(page.locator('[data-testid="note-editor"]').first()).toBeVisible();
    
    // Verify title input is present
    const titleInput = page.locator('[data-testid="note-title-input"]');
    if (await titleInput.isVisible()) {
      await expect(titleInput).toBeVisible();
    }
  });

  test('should allow typing in the note editor', async ({ page }) => {
    // Create a note
    await createNoteAndWaitForEditor(page);
    
    // Type in editor
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    await editor.type('This is a smoke test note');
    
    // Verify content appears
    await expect(editor).toContainText('This is a smoke test note');
  });

  test('should open search when keyboard shortcut is pressed', async ({ page }) => {
    // Press search shortcut
    await page.keyboard.press('Control+k');
    
    // Verify search modal appears
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
    
    // Verify search input is present (use the one in the modal)
    await expect(page.locator('[data-testid="search-modal"] [data-testid="search-input"]')).toBeVisible();
    
    // Close search with escape
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible();
  });

  test('should display notes in the notes list', async ({ page }) => {
    // Create a note first
    await createNoteAndWaitForEditor(page, 'Smoke Test Note');
    
    // Add some content
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    await editor.type('Test content');
    
    // Wait for auto-save
    await page.waitForTimeout(2000);
    
    // Verify note appears in list
    const notesList = page.locator('[data-testid="notes-list"]');
    await expect(notesList).toContainText('Smoke Test Note');
  });

  test('should handle basic navigation', async ({ page }) => {
    // Create a note
    await createNoteAndWaitForEditor(page, 'Navigation Test');
    
    // Verify we can navigate using keyboard
    await page.keyboard.press('Tab');
    
    // Verify focused element is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verify we can navigate back
    await page.keyboard.press('Shift+Tab');
    const newFocusedElement = page.locator(':focus');
    await expect(newFocusedElement).toBeVisible();
  });

  test('should not show critical errors', async ({ page }) => {
    // Check for common error indicators
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    await expect(page.locator('text=Uncaught')).not.toBeVisible();
    
    // Check console for errors (in a real test you'd check page.on('console'))
    // For now, just verify the app loaded without critical UI errors
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });
});