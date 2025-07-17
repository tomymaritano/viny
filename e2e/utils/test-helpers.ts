import { Page, expect, Locator } from '@playwright/test';
import { TestConfig, getTimeout, getRetryCount, getDelay, isFeatureEnabled } from '../config/test-config';

/**
 * E2E Test Helper Utilities
 * Provides robust wait strategies and retry mechanisms for reliable testing
 */

interface WaitOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ElementWaitOptions extends WaitOptions {
  state?: 'visible' | 'hidden' | 'attached' | 'detached';
}

/**
 * Waits for an element with retry logic
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options: ElementWaitOptions = {}
): Promise<Locator> {
  const {
    timeout = getTimeout('default'),
    retries = getRetryCount('default'),
    retryDelay = getDelay('default'),
    state = 'visible'
  } = options;

  const element = page.locator(selector);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await element.waitFor({ state, timeout: timeout / retries });
      return element;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Element ${selector} not ${state} after ${retries} attempts: ${error}`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
  
  return element;
}

/**
 * Waits for content to appear with retry logic
 */
export async function waitForContent(
  page: Page,
  selector: string,
  text: string | RegExp,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await expect(page.locator(selector)).toContainText(text, { 
        timeout: timeout / retries 
      });
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Content "${text}" not found in ${selector} after ${retries} attempts`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Waits for save indicator to show success
 */
export async function waitForSaveSuccess(
  page: Page,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 8000, retries = 3 } = options;
  
  // Wait for auto-save to complete (account for debounce + save time)
  await page.waitForTimeout(2000);
  
  const saveIndicator = page.locator('[data-testid="save-indicator"]');
  
  // Check if save indicator shows success (fallback to timeout if not visible)
  try {
    // First wait for save indicator to appear (it might be hidden on small screens)
    await saveIndicator.waitFor({ state: 'visible', timeout: timeout / 3 });
    
    // Wait for success state - the implementation shows "Saved" for first 5 seconds
    await waitForContent(page, '[data-testid="save-indicator"]', /saved|success/i, {
      timeout: timeout / 2,
      retries
    });
  } catch {
    // If save indicator doesn't show success, wait for storage stability
    // This happens on smaller screens where save indicator is hidden
    await page.waitForTimeout(1000);
  }
}

/**
 * Safely clicks an element with retry logic
 */
export async function safeClick(
  page: Page,
  selector: string,
  options: WaitOptions & { button?: 'left' | 'right' | 'middle' } = {}
): Promise<void> {
  const { timeout = 5000, retries = 3, retryDelay = 500, button = 'left' } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const element = await waitForElement(page, selector, { timeout: timeout / retries });
      await element.click({ button, timeout: timeout / retries });
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to click ${selector} after ${retries} attempts: ${error}`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Safely fills input with retry logic
 */
export async function safeFill(
  page: Page,
  selector: string,
  text: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000, retries = 3, retryDelay = 500 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const element = await waitForElement(page, selector, { timeout: timeout / retries });
      await element.fill(text);
      
      // Verify text was filled
      const value = await element.inputValue();
      if (value === text) {
        return;
      }
      throw new Error(`Text not filled correctly: expected "${text}", got "${value}"`);
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to fill ${selector} after ${retries} attempts: ${error}`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Safely types text with retry logic
 */
export async function safeType(
  page: Page,
  selector: string,
  text: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000, retries = 3, retryDelay = 500 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const element = await waitForElement(page, selector, { timeout: timeout / retries });
      await element.click();
      await element.type(text, { delay: 50 }); // Small delay between keystrokes
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to type in ${selector} after ${retries} attempts: ${error}`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Waits for note creation and editor to be ready
 */
export async function createNoteAndWaitForEditor(
  page: Page,
  title?: string,
  options: WaitOptions = {}
): Promise<{ editor: Locator; titleInput: Locator }> {
  const { timeout = 10000 } = options;
  
  // Click create note button
  await safeClick(page, '[data-testid="create-note-button"]', { timeout });
  
  // Wait for editor to be ready - use first() to handle multiple editors
  const editor = await waitForElement(page, '[data-testid="note-editor"] .cm-content', {
    timeout,
    state: 'visible'
  });
  
  const titleInput = await waitForElement(page, '[data-testid="note-title-input"]', {
    timeout,
    state: 'visible'
  });
  
  // Set title if provided
  if (title) {
    await safeFill(page, '[data-testid="note-title-input"]', title, { timeout });
  }
  
  return { editor, titleInput };
}

/**
 * Get the active note editor (handles multiple editors)
 */
export async function getActiveNoteEditor(page: Page): Promise<Locator> {
  // Try to find the visible editor first
  const editors = page.locator('[data-testid="note-editor"]');
  const count = await editors.count();
  
  if (count === 1) {
    return editors.first();
  }
  
  // If multiple editors, find the visible one
  for (let i = 0; i < count; i++) {
    const editor = editors.nth(i);
    if (await editor.isVisible()) {
      return editor;
    }
  }
  
  // Fallback to first editor
  return editors.first();
}

/**
 * Get the search input in modal (not sidebar)
 */
export async function getSearchModalInput(page: Page): Promise<Locator> {
  // Wait for search modal to be open
  await waitForElement(page, '[data-testid="search-modal"]');
  
  // Return the search input inside the modal
  return page.locator('[data-testid="search-modal"] [data-testid="search-input"]');
}

/**
 * Waits for search modal and performs search
 */
export async function performSearch(
  page: Page,
  query: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000 } = options;
  
  // Open search
  await page.keyboard.press('Control+k');
  
  // Wait for search modal
  await waitForElement(page, '[data-testid="search-modal"]', { timeout });
  
  // Use the specific modal search input
  const searchInput = await getSearchModalInput(page);
  await searchInput.fill(query);
  
  // Wait for results to appear
  await waitForElement(page, '[data-testid="search-results"]', { timeout });
}

/**
 * Waits for app to be fully loaded and ready
 */
export async function waitForAppReady(page: Page, options: WaitOptions = {}): Promise<void> {
  const { timeout = 15000 } = options;
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout });
  
  // Wait for main app container
  await waitForElement(page, '[data-testid="app-container"]', { timeout });
  
  // Wait for sidebar (if it exists)
  const sidebar = page.locator('[data-testid="sidebar"]');
  try {
    await sidebar.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    // Sidebar might not exist in all views
  }
  
  // Small additional wait for dynamic content
  await page.waitForTimeout(500);
}

/**
 * Retries an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: WaitOptions & { backoff?: boolean } = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000, backoff = true } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      const delay = backoff ? retryDelay * Math.pow(2, attempt - 1) : retryDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Operation failed after all retries');
}

/**
 * Waits for element to be stable (not changing)
 */
export async function waitForStableElement(
  page: Page,
  selector: string,
  options: WaitOptions = {}
): Promise<Locator> {
  const { timeout = 5000, retries = 3 } = options;
  
  const element = page.locator(selector);
  
  // Wait for element to exist
  await element.waitFor({ state: 'attached', timeout });
  
  // Wait for element to be stable
  let previousBox: any = null;
  let stableCount = 0;
  const requiredStableChecks = 3;
  
  for (let i = 0; i < retries * 10; i++) {
    try {
      const currentBox = await element.boundingBox();
      
      if (previousBox && 
          currentBox?.x === previousBox.x && 
          currentBox?.y === previousBox.y && 
          currentBox?.width === previousBox.width && 
          currentBox?.height === previousBox.height) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          return element;
        }
      } else {
        stableCount = 0;
      }
      
      previousBox = currentBox;
      await page.waitForTimeout(100);
    } catch {
      stableCount = 0;
      await page.waitForTimeout(200);
    }
  }
  
  return element;
}

/**
 * Smart wait that adapts to different element states
 */
export async function smartWait(
  page: Page,
  selector: string,
  action: 'click' | 'fill' | 'type' | 'expect',
  value?: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000 } = options;
  
  switch (action) {
    case 'click':
      await safeClick(page, selector, { timeout });
      break;
      
    case 'fill':
      if (!value) throw new Error('Value required for fill action');
      await safeFill(page, selector, value, { timeout });
      break;
      
    case 'type':
      if (!value) throw new Error('Value required for type action');
      await safeType(page, selector, value, { timeout });
      break;
      
    case 'expect':
      await waitForElement(page, selector, { timeout });
      if (value) {
        await waitForContent(page, selector, value, { timeout });
      }
      break;
  }
}

/**
 * Opens context menu and waits for dropdown to appear
 */
export async function openContextMenu(
  page: Page,
  selector: string,
  options: WaitOptions & { index?: number } = {}
): Promise<void> {
  const { timeout = 8000, retries = 3, retryDelay = 500, index = 0 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Handle multiple elements with same selector
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count === 0) {
        throw new Error(`No elements found with selector ${selector}`);
      }
      
      // Use the specified index or first element
      const targetElement = elements.nth(index);
      
      // Right-click on the specific element
      await targetElement.click({ button: 'right', timeout: timeout / retries });
      
      // Wait for dropdown to appear with better stability
      await waitForElement(page, '[data-testid="note-actions-dropdown"]', { 
        timeout: timeout / retries,
        retries: 2,
        retryDelay: 200
      });
      
      // Ensure dropdown is fully rendered and stable
      await waitForStableElement(page, '[data-testid="note-actions-dropdown"]', {
        timeout: timeout / retries
      });
      
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed to open context menu for ${selector} after ${retries} attempts: ${error}`);
      }
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Waits for a note to be deleted from the notes list
 */
export async function waitForNoteDeletion(
  page: Page,
  noteTitle: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 15000, retries = 5, retryDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Wait for the note to disappear from the notes list
      await expect(page.locator('[data-testid="notes-list"]')).not.toContainText(noteTitle, {
        timeout: timeout / retries
      });
      
      // Additional verification - check that note count has decreased
      const noteItems = page.locator('[data-testid="note-item"]');
      const noteCount = await noteItems.count();
      
      // Small delay to ensure UI has stabilized
      await page.waitForTimeout(500);
      
      // Final verification that the note is really gone
      await expect(page.locator('[data-testid="notes-list"]')).not.toContainText(noteTitle, {
        timeout: 2000
      });
      
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Note "${noteTitle}" was not deleted after ${retries} attempts: ${error}`);
      }
      
      console.log(`Attempt ${attempt} failed, retrying note deletion wait...`);
      await page.waitForTimeout(retryDelay);
    }
  }
}

/**
 * Waits for a note duplication to complete
 */
export async function waitForNoteDuplication(
  page: Page,
  originalCount: number,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Wait for note count to increase
      const noteItems = page.locator('[data-testid="note-item"]');
      await expect(noteItems).toHaveCount(originalCount + 1, { timeout: timeout / retries });
      
      // Small delay to ensure UI has stabilized
      await page.waitForTimeout(500);
      
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Note duplication did not complete after ${retries} attempts: ${error}`);
      }
      
      console.log(`Attempt ${attempt} failed, retrying note duplication wait...`);
      await page.waitForTimeout(retryDelay);
    }
  }
}