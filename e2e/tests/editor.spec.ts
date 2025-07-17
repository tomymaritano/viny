import { test, expect } from '@playwright/test';

test.describe('Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Create a new note
    await page.click('[data-testid="create-note-button"]');
    await page.waitForSelector('[data-testid="note-editor"]');
  });

  test('should support markdown formatting', async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    
    // Type markdown content
    await editor.click();
    await editor.type('# Heading 1\n\n## Heading 2\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2');
    
    // Switch to preview mode
    await page.click('[data-testid="preview-toggle"]');
    
    // Verify markdown is rendered
    const preview = page.locator('[data-testid="note-preview"]');
    await expect(preview.locator('h1')).toContainText('Heading 1');
    await expect(preview.locator('h2')).toContainText('Heading 2');
    await expect(preview.locator('strong')).toContainText('Bold text');
    await expect(preview.locator('em')).toContainText('italic text');
    await expect(preview.locator('li')).toHaveCount(2);
  });

  test('should support split view', async ({ page }) => {
    // Click split view button
    await page.click('[data-testid="split-view-toggle"]');
    
    // Both editor and preview should be visible
    await expect(page.locator('[data-testid="note-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="note-preview"]')).toBeVisible();
    
    // Type in editor
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    await editor.type('# Live Preview Test');
    
    // Preview should update in real-time
    const preview = page.locator('[data-testid="note-preview"]');
    await expect(preview.locator('h1')).toContainText('Live Preview Test');
  });

  test('should support toolbar actions', async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    
    // Type some text
    await editor.type('This is some text');
    
    // Select all text
    await page.keyboard.press('Meta+A');
    
    // Click bold button
    await page.click('[data-testid="toolbar-bold"]');
    
    // Verify bold markdown is applied
    await expect(editor).toContainText('**This is some text**');
    
    // Click italic button
    await page.click('[data-testid="toolbar-italic"]');
    
    // Verify italic markdown is applied
    await expect(editor).toContainText('***This is some text***');
  });

  test('should support code blocks', async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    
    // Insert code block using toolbar
    await page.click('[data-testid="toolbar-code-block"]');
    
    // Type code
    await editor.type('javascript\nconst hello = "world";\nconsole.log(hello);');
    
    // Switch to preview
    await page.click('[data-testid="preview-toggle"]');
    
    // Verify code block is rendered with syntax highlighting
    const codeBlock = page.locator('[data-testid="note-preview"] pre code');
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('const hello = "world"');
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    const editor = page.locator('[data-testid="note-editor"] .cm-content');
    await editor.click();
    
    // Type text
    await editor.type('Test text');
    
    // Select all
    await page.keyboard.press('Meta+A');
    
    // Bold shortcut (Cmd/Ctrl + B)
    await page.keyboard.press('Meta+B');
    await expect(editor).toContainText('**Test text**');
    
    // Italic shortcut (Cmd/Ctrl + I)
    await page.keyboard.press('Meta+I');
    await expect(editor).toContainText('***Test text***');
    
    // Save shortcut (Cmd/Ctrl + S)
    await page.keyboard.press('Meta+S');
    
    // Should show save indicator
    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible();
  });

  test('should handle line numbers toggle', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="editor-options"]');
    
    // Toggle line numbers
    await page.click('[data-testid="toggle-line-numbers"]');
    
    // Verify line numbers are visible
    await expect(page.locator('.cm-lineNumbers')).toBeVisible();
    
    // Toggle again to hide
    await page.click('[data-testid="toggle-line-numbers"]');
    
    // Verify line numbers are hidden
    await expect(page.locator('.cm-lineNumbers')).not.toBeVisible();
  });
});