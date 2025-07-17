import { test, expect } from '@playwright/test';
import { 
  waitForAppReady, 
  createNoteAndWaitForEditor, 
  safeClick, 
  safeFill,
  safeType,
  waitForElement,
  waitForSaveSuccess,
  retryOperation
} from '../utils/test-helpers';

test.describe('Error States and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test.describe('Storage and Persistence Errors', () => {
    test('should handle localStorage quota exceeded', async ({ page }) => {
      // Fill localStorage to near capacity
      await page.evaluate(() => {
        // Fill localStorage with dummy data
        try {
          const bigString = 'x'.repeat(1024 * 1024); // 1MB string
          for (let i = 0; i < 5; i++) {
            localStorage.setItem(`dummy-data-${i}`, bigString);
          }
        } catch (e) {
          console.log('Storage quota reached during setup');
        }
      });

      // Try to create a large note
      const { editor } = await createNoteAndWaitForEditor(page, 'Large Note Test');
      
      // Generate large content
      const largeContent = 'This is a very long note content. '.repeat(10000);
      await editor.type(largeContent.substring(0, 1000)); // Type portion to avoid timeout
      
      // Wait for auto-save attempt
      await page.waitForTimeout(2000);
      
      // Look for error indicators
      const errorMessage = page.locator('[data-testid="error-message"]');
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      
      // Should show storage error or save failure
      await expect(errorMessage.or(saveIndicator)).toBeVisible();
      
      // Cleanup
      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          localStorage.removeItem(`dummy-data-${i}`);
        }
      });
    });

    test('should handle corrupted localStorage data', async ({ page }) => {
      // Inject corrupted data into localStorage
      await page.evaluate(() => {
        localStorage.setItem('notes', 'invalid-json-data{[}');
        localStorage.setItem('settings', 'corrupted-settings');
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // App should handle corruption gracefully
      // Look for error recovery or data reset
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
      
      // Verify app is functional despite corrupted data
      await page.click('[data-testid="create-note-button"]');
      await expect(page.locator('[data-testid="note-editor"]')).toBeVisible();
      
      // Check if error was reported to user
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      const errorMessage = page.locator('[data-testid="error-message"]');
      
      // App should either recover silently or show helpful error
      if (await errorBoundary.isVisible() || await errorMessage.isVisible()) {
        // Verify error is user-friendly and actionable
        await expect(errorBoundary.or(errorMessage)).toContainText(/corrupted|reset|refresh/i);
      }
    });

    test('should handle auto-save failures gracefully', async ({ page }) => {
      // Create a note
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Test content for save failure');

      // Mock save failure by intercepting storage operations
      await page.evaluate(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new Error('Storage unavailable');
        };
        
        // Restore after a delay
        setTimeout(() => {
          localStorage.setItem = originalSetItem;
        }, 3000);
      });

      // Continue typing to trigger auto-save
      await editor.type(' - more content');
      await page.waitForTimeout(2000);

      // Should show save error indicator
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      await expect(saveIndicator).toBeVisible();
      
      // Error indicator should be informative
      await expect(saveIndicator).toContainText(/error|failed|retry/i);

      // Wait for retry mechanism
      await page.waitForTimeout(4000);
      
      // Should eventually succeed and show success
      await expect(saveIndicator).toContainText(/saved|success/i);
    });
  });

  test.describe('Network and Connectivity Issues', () => {
    test('should handle offline mode', async ({ page }) => {
      // Create initial content while online
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Offline Test Note');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Initial content');
      await page.waitForTimeout(1500);

      // Simulate going offline
      await page.context().setOffline(true);

      // Continue editing
      await editor.type('\n\nAdded while offline');
      
      // Should handle offline state gracefully
      const connectionIndicator = page.locator('[data-testid="connection-status"]');
      if (await connectionIndicator.isVisible()) {
        await expect(connectionIndicator).toContainText(/offline|disconnected/i);
      }

      // Local changes should still work
      await expect(editor).toContainText('Added while offline');

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);

      // Should sync changes
      if (await connectionIndicator.isVisible()) {
        await expect(connectionIndicator).toContainText(/online|connected|synced/i);
      }
    });

    test('should handle slow network connections', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        await route.continue();
      });

      // Try to save large note
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Test content for slow network');

      // Should show loading/saving state
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      await expect(saveIndicator).toContainText(/saving|loading/i);

      // Eventually complete
      await expect(saveIndicator).toContainText(/saved|success/i, { timeout: 10000 });
    });
  });

  test.describe('Input Validation and Limits', () => {
    test('should handle extremely long note titles', async ({ page }) => {
      await page.click('[data-testid="create-note-button"]');
      
      const titleInput = page.locator('[data-testid="note-title-input"]');
      const longTitle = 'Very Long Title '.repeat(50); // ~750 characters
      
      await titleInput.fill(longTitle);
      
      // Should either truncate or show validation message
      const titleValue = await titleInput.inputValue();
      const errorMessage = page.locator('[data-testid="validation-error"]');
      
      if (titleValue.length < longTitle.length) {
        // Title was truncated - this is acceptable
        expect(titleValue.length).toBeLessThan(longTitle.length);
      } else if (await errorMessage.isVisible()) {
        // Validation error shown - also acceptable
        await expect(errorMessage).toContainText(/too long|character limit/i);
      }
    });

    test('should handle special characters in titles and content', async ({ page }) => {
      await page.click('[data-testid="create-note-button"]');
      
      const specialChars = '!@#$%^&*()[]{}|;:,.<>?🚀💻📝';
      const titleInput = page.locator('[data-testid="note-title-input"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      
      await titleInput.fill(`Special Chars Test ${specialChars}`);
      await editor.click();
      await editor.type(`Content with special chars: ${specialChars}`);
      
      await page.waitForTimeout(1500); // Auto-save
      
      // Reload to verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Special characters should be preserved
      await expect(page.locator('[data-testid="notes-list"]')).toContainText(specialChars);
      
      // Open note and verify content
      await page.click('[data-testid="note-item"]');
      await expect(page.locator('[data-testid="note-editor"]')).toContainText(specialChars);
    });

    test('should handle very large note content', async ({ page }) => {
      await page.click('[data-testid="create-note-button"]');
      await page.locator('[data-testid="note-title-input"]').fill('Large Content Test');
      
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      
      // Generate large content (simulate pasting large text)
      const largeContent = 'Lorem ipsum dolor sit amet. '.repeat(1000); // ~27KB
      
      // Paste large content
      await page.evaluate((content) => {
        navigator.clipboard.writeText(content);
      }, largeContent);
      
      await page.keyboard.press('Control+v');
      
      // Should handle large content gracefully
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      
      // Wait for processing
      await page.waitForTimeout(3000);
      
      // Should either save successfully or show appropriate error
      const editorContent = await editor.textContent();
      
      if (editorContent && editorContent.length > 10000) {
        // Content was accepted
        await expect(saveIndicator).toContainText(/saved|success/i);
      } else {
        // Content was rejected or truncated
        const errorMessage = page.locator('[data-testid="error-message"]');
        await expect(errorMessage.or(saveIndicator)).toContainText(/too large|limit|error/i);
      }
    });

    test('should handle invalid markdown syntax', async ({ page }) => {
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      
      // Enter problematic markdown
      const problematicMarkdown = `
        # Unclosed [link
        **Unclosed bold
        \`\`\`
        Unclosed code block
        ![Invalid image](
        [Nested [links] are] weird](url)
      `;
      
      await editor.type(problematicMarkdown);
      
      // Switch to preview to see how it handles invalid syntax
      const previewToggle = page.locator('[data-testid="preview-toggle"]');
      if (await previewToggle.isVisible()) {
        await previewToggle.click();
        
        const preview = page.locator('[data-testid="note-preview"]');
        await expect(preview).toBeVisible();
        
        // Should render without crashing
        // Invalid markdown should be handled gracefully
        await expect(preview).not.toContainText('Error');
        await expect(preview).not.toContainText('undefined');
      }
    });
  });

  test.describe('Browser Compatibility Issues', () => {
    test('should handle clipboard API failures', async ({ page }) => {
      // Mock clipboard API failure
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true
        });
      });

      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Test content for clipboard');
      
      // Try to copy (should fallback gracefully)
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Control+c');
      
      // Should not crash or show error
      await expect(page.locator('[data-testid="note-editor"]')).toBeVisible();
      
      // Try to paste (should handle gracefully)
      await page.keyboard.press('Control+v');
      
      // App should continue functioning
      await expect(editor).toBeVisible();
    });

    test('should handle insufficient browser permissions', async ({ page }) => {
      // Test with restricted permissions context
      const context = await page.context().browser()?.newContext({
        permissions: [] // No permissions granted
      });
      
      if (context) {
        const restrictedPage = await context.newPage();
        await restrictedPage.goto('/');
        await restrictedPage.waitForLoadState('networkidle');
        
        // App should still function with limited permissions
        await expect(restrictedPage.locator('[data-testid="app-container"]')).toBeVisible();
        
        // Basic functionality should work
        await restrictedPage.click('[data-testid="create-note-button"]');
        await expect(restrictedPage.locator('[data-testid="note-editor"]')).toBeVisible();
        
        await context.close();
      }
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle multiple rapid note creations', async ({ page }) => {
      // Rapidly create multiple notes
      const noteCount = 5;
      const creationPromises = [];
      
      for (let i = 0; i < noteCount; i++) {
        creationPromises.push(
          (async () => {
            await page.click('[data-testid="create-note-button"]');
            await page.locator('[data-testid="note-title-input"]').fill(`Rapid Note ${i}`);
            await page.locator('[data-testid="note-editor"] .cm-content').click();
            await page.locator('[data-testid="note-editor"] .cm-content').type(`Content ${i}`);
          })()
        );
      }
      
      // Wait for all creations
      await Promise.all(creationPromises);
      await page.waitForTimeout(3000); // Wait for auto-saves
      
      // Verify all notes were created
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(noteCount);
    });

    test('should handle rapid editing of same note', async ({ page }) => {
      // Create a note
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      
      // Rapid typing and editing
      for (let i = 0; i < 10; i++) {
        await editor.type(`Line ${i} `);
        await page.keyboard.press('Enter');
        
        // Intermittent selections and deletions
        if (i % 3 === 0) {
          await page.keyboard.press('Control+a');
          await page.keyboard.press('Delete');
        }
      }
      
      await page.waitForTimeout(2000);
      
      // Should handle rapid changes without crashing
      await expect(editor).toBeVisible();
      
      // Should eventually reach stable state
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      await expect(saveIndicator).toContainText(/saved|success/i, { timeout: 5000 });
    });
  });

  test.describe('Memory and Performance Edge Cases', () => {
    test('should handle memory pressure scenarios', async ({ page }) => {
      // Create many notes to stress memory
      const manyNotesCount = 50;
      
      for (let i = 0; i < manyNotesCount; i++) {
        await page.click('[data-testid="create-note-button"]');
        await page.locator('[data-testid="note-title-input"]').fill(`Memory Test Note ${i}`);
        
        const editor = page.locator('[data-testid="note-editor"] .cm-content');
        await editor.click();
        await editor.type(`Content for note ${i} with some additional text to use memory.`);
        
        // Only wait periodically to avoid timeout
        if (i % 10 === 0) {
          await page.waitForTimeout(1000);
        }
      }
      
      // App should remain responsive
      await expect(page.locator('[data-testid="notes-list"]')).toBeVisible();
      
      // Search should still work
      await page.keyboard.press('Control+k');
      await page.locator('[data-testid="search-input"]').type('Memory Test');
      
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
      
      // Should find results without crashing
      await expect(searchResults).toContainText('Memory Test Note');
    });

    test('should handle browser tab switching and focus loss', async ({ page }) => {
      // Create and edit a note
      await page.click('[data-testid="create-note-button"]');
      const editor = page.locator('[data-testid="note-editor"] .cm-content');
      await editor.click();
      await editor.type('Content before tab switch');
      
      // Simulate tab switching (lose focus)
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      await page.waitForTimeout(1000);
      
      // Simulate returning to tab (regain focus)
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      // Continue editing
      await editor.click();
      await editor.type('\nContent after tab switch');
      
      // Should save properly
      await page.waitForTimeout(2000);
      const saveIndicator = page.locator('[data-testid="save-indicator"]');
      await expect(saveIndicator).toContainText(/saved|success/i);
    });
  });
});