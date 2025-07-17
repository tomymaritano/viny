import { test, expect } from '@playwright/test';
import { 
  waitForAppReady, 
  createNoteAndWaitForEditor, 
  performSearch,
  waitForElement,
  waitForSaveSuccess
} from '../utils/test-helpers';
import { createTestNote, TestData } from '../fixtures/test-fixtures';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test.describe('Main Interface Screenshots', () => {
    test('should match main application layout', async ({ page }) => {
      // Wait for app to be fully loaded
      await waitForElement(page, '[data-testid="app-container"]');
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('main-application-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match sidebar appearance', async ({ page }) => {
      const sidebar = await waitForElement(page, '[data-testid="sidebar"]');
      
      // Take sidebar screenshot
      await expect(sidebar).toHaveScreenshot('sidebar-default.png', {
        animations: 'disabled'
      });
    });

    test('should match empty notes state', async ({ page }) => {
      // Ensure we're in empty state
      const notesList = page.locator('[data-testid="notes-list"]');
      
      // Take screenshot of empty state
      await expect(notesList).toHaveScreenshot('notes-list-empty.png', {
        animations: 'disabled'
      });
    });

    test('should match application header', async ({ page }) => {
      const header = page.locator('[data-testid="app-header"]');
      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot('app-header.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Note Editor Screenshots', () => {
    test('should match empty note editor', async ({ page }) => {
      // Create new note
      await createNoteAndWaitForEditor(page);
      
      const editor = await waitForElement(page, '[data-testid="note-editor"]');
      
      // Take editor screenshot
      await expect(editor).toHaveScreenshot('note-editor-empty.png', {
        animations: 'disabled'
      });
    });

    test('should match note editor with content', async ({ page }) => {
      // Create note with markdown content
      await createTestNote(page, TestData.notes.markdown);
      
      const editor = await waitForElement(page, '[data-testid="note-editor"]');
      
      // Take editor screenshot with content
      await expect(editor).toHaveScreenshot('note-editor-with-content.png', {
        animations: 'disabled'
      });
    });

    test('should match note editor toolbar', async ({ page }) => {
      await createNoteAndWaitForEditor(page);
      
      const toolbar = page.locator('[data-testid="editor-toolbar"]');
      if (await toolbar.isVisible()) {
        await expect(toolbar).toHaveScreenshot('editor-toolbar.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match note metadata section', async ({ page }) => {
      // Create note with metadata
      await createTestNote(page, TestData.notes.simple);
      
      const metadata = page.locator('[data-testid="note-metadata"]');
      if (await metadata.isVisible()) {
        await expect(metadata).toHaveScreenshot('note-metadata.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Notes List Screenshots', () => {
    test('should match notes list with content', async ({ page }) => {
      // Create multiple test notes
      await createTestNote(page, TestData.notes.simple);
      await createTestNote(page, TestData.notes.markdown);
      await createTestNote(page, TestData.notes.specialChars);
      
      const notesList = await waitForElement(page, '[data-testid="notes-list"]');
      
      // Take notes list screenshot
      await expect(notesList).toHaveScreenshot('notes-list-with-content.png', {
        animations: 'disabled'
      });
    });

    test('should match individual note item', async ({ page }) => {
      await createTestNote(page, TestData.notes.simple);
      
      const noteItem = await waitForElement(page, '[data-testid="note-item"]');
      
      // Take note item screenshot
      await expect(noteItem.first()).toHaveScreenshot('note-item.png', {
        animations: 'disabled'
      });
    });

    test('should match pinned note indicator', async ({ page }) => {
      // Create and pin a note
      await createTestNote(page, { ...TestData.notes.simple, pinned: true });
      
      const pinnedNote = await waitForElement(page, '[data-testid="note-item"]');
      
      // Take pinned note screenshot
      await expect(pinnedNote.first()).toHaveScreenshot('note-item-pinned.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Search Interface Screenshots', () => {
    test('should match search modal', async ({ page }) => {
      // Open search
      await page.keyboard.press('Control+k');
      const searchModal = await waitForElement(page, '[data-testid="search-modal"]');
      
      // Take search modal screenshot
      await expect(searchModal).toHaveScreenshot('search-modal-empty.png', {
        animations: 'disabled'
      });
    });

    test('should match search results', async ({ page }) => {
      // Create searchable content
      await createTestNote(page, TestData.notes.simple);
      await createTestNote(page, TestData.notes.markdown);
      
      // Perform search
      await performSearch(page, 'test');
      
      const searchResults = await waitForElement(page, '[data-testid="search-results"]');
      
      // Take search results screenshot
      await expect(searchResults).toHaveScreenshot('search-results.png', {
        animations: 'disabled'
      });
    });

    test('should match no search results state', async ({ page }) => {
      await performSearch(page, 'nonexistentquery');
      
      // Wait a moment for no results state
      await page.waitForTimeout(1000);
      
      const searchModal = page.locator('[data-testid="search-modal"]');
      
      // Take no results screenshot
      await expect(searchModal).toHaveScreenshot('search-no-results.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Modal and Dialog Screenshots', () => {
    test('should match settings modal', async ({ page }) => {
      // Try to open settings
      const settingsButton = page.locator('[data-testid="settings-button"]');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        
        const settingsModal = await waitForElement(page, '[data-testid="settings-modal"]');
        
        // Take settings modal screenshot
        await expect(settingsModal).toHaveScreenshot('settings-modal.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match context menu', async ({ page }) => {
      // Create a note to get context menu
      await createTestNote(page, TestData.notes.simple);
      
      const noteItem = await waitForElement(page, '[data-testid="note-item"]');
      await noteItem.click({ button: 'right' });
      
      const contextMenu = await waitForElement(page, '[data-testid="note-actions-dropdown"]');
      
      // Take context menu screenshot
      await expect(contextMenu).toHaveScreenshot('note-context-menu.png', {
        animations: 'disabled'
      });
    });

    test('should match error state', async ({ page }) => {
      // Try to trigger an error state
      // This is a placeholder - implementation depends on app error handling
      
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveScreenshot('error-message.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Theme and Responsive Screenshots', () => {
    test('should match light theme', async ({ page }) => {
      // Ensure light theme
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await waitForAppReady(page);
      
      // Create some content
      await createTestNote(page, TestData.notes.simple);
      
      // Take full app screenshot in light theme
      await expect(page).toHaveScreenshot('app-light-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dark theme', async ({ page }) => {
      // Switch to dark theme
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await waitForAppReady(page);
      
      // Create some content
      await createTestNote(page, TestData.notes.simple);
      
      // Take full app screenshot in dark theme
      await expect(page).toHaveScreenshot('app-dark-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForAppReady(page);
      
      // Create content
      await createTestNote(page, TestData.notes.simple);
      
      // Take mobile screenshot
      await expect(page).toHaveScreenshot('app-mobile-view.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await waitForAppReady(page);
      
      // Create content
      await createTestNote(page, TestData.notes.simple);
      
      // Take tablet screenshot
      await expect(page).toHaveScreenshot('app-tablet-view.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Content Rendering Screenshots', () => {
    test('should match markdown rendering', async ({ page }) => {
      // Create note with complex markdown
      await createTestNote(page, TestData.notes.markdown);
      
      // Switch to preview mode if available
      const previewToggle = page.locator('[data-testid="preview-toggle"]');
      if (await previewToggle.isVisible()) {
        await previewToggle.click();
        
        const preview = await waitForElement(page, '[data-testid="note-preview"]');
        
        // Take markdown preview screenshot
        await expect(preview).toHaveScreenshot('markdown-preview.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match special characters rendering', async ({ page }) => {
      await createTestNote(page, TestData.notes.specialChars);
      
      const editor = await waitForElement(page, '[data-testid="note-editor"]');
      
      // Take special characters screenshot
      await expect(editor).toHaveScreenshot('special-characters-rendering.png', {
        animations: 'disabled'
      });
    });

    test('should match long content handling', async ({ page }) => {
      await createTestNote(page, TestData.notes.longContent);
      
      const editor = await waitForElement(page, '[data-testid="note-editor"]');
      
      // Take long content screenshot
      await expect(editor).toHaveScreenshot('long-content-handling.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Loading and Save States Screenshots', () => {
    test('should match save indicator states', async ({ page }) => {
      await createNoteAndWaitForEditor(page, 'Save State Test');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Testing save states...');
      
      // Try to capture save indicator
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      if (await saveIndicator.isVisible()) {
        await expect(saveIndicator).toHaveScreenshot('save-indicator.png', {
          animations: 'disabled'
        });
      }
      
      // Wait for save completion
      await waitForSaveSuccess(page);
      
      if (await saveIndicator.isVisible()) {
        await expect(saveIndicator).toHaveScreenshot('save-indicator-success.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match loading spinner', async ({ page }) => {
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should match core UI elements across browsers', async ({ page, browserName }) => {
      // Create consistent test content
      await createTestNote(page, TestData.notes.simple);
      
      const appContainer = await waitForElement(page, '[data-testid="app-container"]');
      
      // Take browser-specific screenshot
      await expect(appContainer).toHaveScreenshot(`app-${browserName}.png`, {
        animations: 'disabled'
      });
    });

    test('should match editor rendering across browsers', async ({ page, browserName }) => {
      await createTestNote(page, TestData.notes.markdown);
      
      const editor = await waitForElement(page, '[data-testid="note-editor"]');
      
      // Take browser-specific editor screenshot
      await expect(editor).toHaveScreenshot(`editor-${browserName}.png`, {
        animations: 'disabled'
      });
    });
  });
});