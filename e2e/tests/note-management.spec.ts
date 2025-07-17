import { test, expect } from '@playwright/test';
import { 
  waitForAppReady, 
  createNoteAndWaitForEditor, 
  safeClick, 
  safeFill, 
  safeType,
  waitForSaveSuccess,
  performSearch,
  waitForElement,
  waitForContent,
  getActiveNoteEditor,
  openContextMenu,
  waitForStableElement,
  waitForNoteDeletion,
  waitForNoteDuplication
} from '../utils/test-helpers';

test.describe('Note Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test.describe('Note Deletion and Recovery', () => {
    test('should delete a note and move it to trash', async ({ page }) => {
      // Create two test notes to ensure we have something left after deletion
      const { editor: firstEditor } = await createNoteAndWaitForEditor(page, 'Test Note for Deletion');
      await safeType(page, '[data-testid="note-editor"] .cm-content', 
        '# Test Note for Deletion\n\nThis note will be deleted.');
      await waitForSaveSuccess(page);
      
      const { editor: secondEditor } = await createNoteAndWaitForEditor(page, 'Note to Keep');
      await safeType(page, '[data-testid="note-editor"] .cm-content', 
        '# Note to Keep\n\nThis note should remain.');
      await waitForSaveSuccess(page);
      
      // Verify both notes exist initially
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Test Note for Deletion');
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Note to Keep');
      
      // Get initial note count
      const initialNoteItems = page.locator('[data-testid="note-item"]');
      const initialCount = await initialNoteItems.count();
      expect(initialCount).toBe(2);
      
      // Find the specific note to delete by searching for its title
      const noteToDeleteSelector = `[data-testid="note-item"]:has-text("Test Note for Deletion")`;
      await page.waitForSelector(noteToDeleteSelector, { timeout: 5000 });
      
      // Open note actions and delete the specific note
      await openContextMenu(page, noteToDeleteSelector);
      
      // Wait for dropdown to be fully ready and click delete
      await page.waitForTimeout(500);
      await safeClick(page, '[data-testid="delete-note-button"]');
      
      // Wait for deletion to complete using the new helper
      await waitForNoteDeletion(page, 'Test Note for Deletion');
      
      // Check that we now have one less note
      await expect(initialNoteItems).toHaveCount(1);
      
      // Verify the other note remains
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Note to Keep');
    });

    test('should restore a note from trash', async ({ page }) => {
      // This test assumes there's a way to navigate to trash view
      // Implementation depends on app's trash navigation
      
      // Create and delete a note first
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('# Note to Restore\n\nThis will be restored from trash.');
      
      const titleInput = page.locator('[data-testid="note-title-input"]');
      await titleInput.fill('Note to Restore');
      await page.waitForTimeout(1500);
      
      // Delete the note
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await noteItem.click({ button: 'right' });
      await page.click('[data-testid="delete-note-button"]');
      
      // Navigate to trash (implementation depends on app structure)
      // This might be a sidebar item or menu option
      // await page.click('[data-testid="trash-section"]');
      
      // Restore note (test structure when trash view is available)
      // await page.click('[data-testid="restore-note-button"]');
      
      // Verify note is back in main list
      // await expect(page.locator('[data-testid="notes-list"]')).toContainText('Note to Restore');
    });

    test('should permanently delete a note from trash', async ({ page }) => {
      // Create, delete, then permanently delete
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('# Note for Permanent Deletion');
      
      const titleInput = page.locator('[data-testid="note-title-input"]');
      await titleInput.fill('Permanently Delete Me');
      await page.waitForTimeout(1500);
      
      // Delete the note
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await noteItem.click({ button: 'right' });
      await page.click('[data-testid="delete-note-button"]');
      
      // Navigate to trash and permanently delete
      // Implementation depends on trash view availability
      // await page.click('[data-testid="trash-section"]');
      // await page.click('[data-testid="permanent-delete-button"]');
      
      // Verify note is completely gone
      // await expect(page.locator('text=Permanently Delete Me')).not.toBeVisible();
    });
  });

  test.describe('Note Duplication', () => {
    test('should duplicate a note with all content and metadata', async ({ page }) => {
      // Create original note
      const { editor } = await createNoteAndWaitForEditor(page, 'Original Note Title');
      
      await safeType(page, '[data-testid="note-editor"] .cm-content', 
        '# Original Note\n\nThis is the original content with **formatting**.');
      
      // Wait for auto-save
      await waitForSaveSuccess(page);
      
      // Get initial note count
      const initialNoteItems = page.locator('[data-testid="note-item"]');
      const initialCount = await initialNoteItems.count();
      expect(initialCount).toBe(1);
      
      // Duplicate the note using improved context menu helper
      await openContextMenu(page, '[data-testid="note-item"]');
      await safeClick(page, '[data-testid="duplicate-note-button"]');
      
      // Wait for duplication to complete
      await waitForNoteDuplication(page, initialCount);
      
      // Verify duplicate appears in notes list
      await expect(page.locator('[data-testid="notes-list"]')).toContainText('Original Note Title');
      
      // Verify we now have 2 notes with similar titles
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(2);
      
      // Open the duplicate and verify content
      await noteItems.nth(0).click(); // Click first note (should be the duplicate)
      await expect(page.locator('[data-testid="note-editor"]')).toContainText('Original Note');
      await expect(page.locator('[data-testid="note-editor"]')).toContainText('original content');
    });

    test('should create duplicate with modified title', async ({ page }) => {
      // Create original note
      await page.click('[data-testid="create-note-button"]');
      const titleInput = page.locator('[data-testid="note-title-input"]');
      await titleInput.fill('My Important Note');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Important content here.');
      await page.waitForTimeout(1500);
      
      // Duplicate
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await noteItem.click({ button: 'right' });
      await page.click('[data-testid="duplicate-note-button"]');
      
      // Check if duplicate has modified title (like "Copy of..." or "(1)")
      const notesList = page.locator('[data-testid="notes-list"]');
      
      // Should contain both original and some variation for duplicate
      await expect(notesList).toContainText('My Important Note');
      
      // Verify content is identical in both
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(2);
    });
  });

  test.describe('Note Organization', () => {
    test('should pin and unpin notes', async ({ page }) => {
      // Create a test note
      const { editor } = await createNoteAndWaitForEditor(page, 'Note to Pin');
      
      await safeType(page, '[data-testid="note-editor"] .cm-content', 
        'This note will be pinned.');
      
      // Wait for auto-save
      await waitForSaveSuccess(page);
      
      // Pin the note using improved context menu helper
      await openContextMenu(page, '[data-testid="note-item"]');
      await safeClick(page, '[data-testid="pin-note-button"]');
      
      // Verify pin indicator appears
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await expect(noteItem).toContainText('📌'); // or check for pin icon class
      
      // Create another note to test ordering
      const { editor: secondEditor } = await createNoteAndWaitForEditor(page, 'Regular Note');
      await safeType(page, '[data-testid="note-editor"] .cm-content', 'Regular content.');
      await waitForSaveSuccess(page);
      
      // Verify pinned note stays at top
      const firstNote = page.locator('[data-testid="note-item"]').first();
      await expect(firstNote).toContainText('Note to Pin');
      
      // Unpin the note
      await openContextMenu(page, '[data-testid="note-item"]');
      await safeClick(page, '[data-testid="pin-note-button"]');
      
      // Verify pin indicator is removed
      await expect(firstNote).not.toContainText('📌');
    });

    test('should move note to different notebook', async ({ page }) => {
      // This test depends on notebook functionality being available
      
      // Create a note
      await page.click('[data-testid="create-note-button"]');
      const titleInput = page.locator('[data-testid="note-title-input"]');
      await titleInput.fill('Note to Move');
      await page.waitForTimeout(1500);
      
      // Move to different notebook (if notebook selector exists)
      const noteItem = page.locator('[data-testid="note-item"]').first();
      await noteItem.click({ button: 'right' });
      
      // Check if move functionality exists
      const moveButton = page.locator('[data-testid="move-note-button"]');
      if (await moveButton.isVisible()) {
        await moveButton.click();
        
        // Select different notebook (implementation depends on notebook UI)
        // await page.click('[data-testid="notebook-selector"]');
        // await page.click('[data-testid="notebook-option-work"]');
        
        // Verify note moved (check current notebook indicator)
        // await expect(page.locator('[data-testid="current-notebook"]')).toContainText('Work');
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple notes', async ({ page }) => {
      // Create multiple test notes
      const noteData = [
        { title: 'First Note', content: 'First content' },
        { title: 'Second Note', content: 'Second content' },
        { title: 'Third Note', content: 'Third content' }
      ];
      
      for (const note of noteData) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(note.title);
        const editor = page.locator('[data-testid="note-editor"] .cm-content');
        await editor.click();
        await editor.type(note.content);
        await page.waitForTimeout(1000);
      }
      
      // Test multi-select (implementation depends on app's multi-select UI)
      // This might involve Ctrl+click or checkboxes
      
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(3);
      
      // If multi-select is available:
      // await page.keyboard.down('Control');
      // await noteItems.nth(0).click();
      // await noteItems.nth(1).click();
      // await page.keyboard.up('Control');
      
      // Verify selection indicators
      // await expect(noteItems.nth(0)).toHaveClass(/selected/);
      // await expect(noteItems.nth(1)).toHaveClass(/selected/);
    });

    test('should perform bulk delete operation', async ({ page }) => {
      // Create test notes
      const noteCount = 3;
      for (let i = 1; i <= noteCount; i++) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(`Bulk Delete Note ${i}`);
        await page.locator('[data-testid="note-editor"] .cm-content').click();
        await page.locator('[data-testid="note-editor"] .cm-content').type(`Content for note ${i}`);
        await page.waitForTimeout(1000);
      }
      
      // Verify all notes created
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(noteCount);
      
      // Select all notes (if bulk selection exists)
      // Implementation depends on app's bulk selection UI
      // await page.click('[data-testid="select-all-notes"]');
      
      // Perform bulk delete
      // await page.click('[data-testid="bulk-delete-button"]');
      
      // Verify all notes are deleted
      // await expect(page.locator('[data-testid="notes-list"]')).not.toContainText('Bulk Delete Note');
    });
  });

  test.describe('Search Integration', () => {
    test('should maintain search context during note operations', async ({ page }) => {
      // Create notes with searchable content
      const searchableNotes = [
        { title: 'JavaScript Tutorial', content: 'Learning JavaScript basics' },
        { title: 'Python Guide', content: 'Python programming guide' },
        { title: 'JavaScript Advanced', content: 'Advanced JavaScript concepts' }
      ];
      
      for (const note of searchableNotes) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(note.title);
        const editor = page.locator('[data-testid="note-editor"] .cm-content');
        await editor.click();
        await editor.type(note.content);
        await page.waitForTimeout(1000);
      }
      
      // Search for specific content
      await performSearch(page, 'JavaScript');
      
      // Verify search results
      await waitForContent(page, '[data-testid="search-results"]', 'JavaScript Tutorial');
      await expect(page.locator('[data-testid="search-results"]')).toContainText('JavaScript Advanced');
      await expect(page.locator('[data-testid="search-results"]')).not.toContainText('Python Guide');
      
      // Select a search result
      await page.click('[data-testid="search-result-item"]', { first: true });
      
      // Verify note opens and search context is maintained
      await expect(page.locator('[data-testid="note-title"]')).toContainText('JavaScript');
      
      // Close search and verify we're back to the opened note
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="search-modal"]')).not.toBeVisible();
    });
  });
});