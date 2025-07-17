import { Page } from '@playwright/test';
import { createNoteAndWaitForEditor, waitForSaveSuccess } from '../utils/test-helpers';

/**
 * Test Fixtures and Data Management
 * Provides reusable test data setup and cleanup utilities
 */

export interface TestNote {
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
}

export interface TestNotebook {
  name: string;
  description?: string;
  notes?: TestNote[];
}

/**
 * Common test data sets
 */
export const TestData = {
  notes: {
    simple: {
      title: 'Simple Test Note',
      content: 'This is a simple test note with basic content.',
      tags: ['test', 'simple']
    },
    
    markdown: {
      title: 'Markdown Test Note',
      content: `# Markdown Test Note

## Features to Test
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- \`inline code\`

### Code Block
\`\`\`javascript
function test() {
  return "Hello World";
}
\`\`\`

### Lists
1. First item
2. Second item
3. Third item

- Bullet point
- Another bullet
- Third bullet`,
      tags: ['markdown', 'formatting', 'test']
    },
    
    longContent: {
      title: 'Long Content Test Note',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100),
      tags: ['long-content', 'performance', 'test']
    },
    
    specialChars: {
      title: 'Special Characters 🚀💻📝',
      content: 'Testing special characters: !@#$%^&*()[]{}|;:,.<>? and emojis 🎉✨🔥',
      tags: ['special-chars', 'unicode', 'test']
    }
  },

  workflows: {
    dailyJournal: [
      {
        title: 'Daily Journal - Monday',
        content: `# Monday Journal

## Goals for Today
- [ ] Complete project proposal
- [ ] Review team feedback
- [ ] Plan week activities

## Notes
Morning meeting went well. Need to focus on the proposal.`,
        tags: ['journal', 'daily', 'monday']
      },
      {
        title: 'Daily Journal - Tuesday',
        content: `# Tuesday Journal

## Completed Yesterday
- ✅ Project proposal
- ✅ Team feedback review

## Today's Goals
- [ ] Client presentation
- [ ] Code review`,
        tags: ['journal', 'daily', 'tuesday']
      }
    ],

    research: [
      {
        title: 'Research: AI in Healthcare',
        content: `# AI in Healthcare Research

## Key Areas
1. Diagnostic imaging
2. Drug discovery
3. Patient monitoring
4. Treatment optimization

## Sources to Review
- MIT Technology Review articles
- Nature Medicine papers
- Healthcare AI startups`,
        tags: ['research', 'ai', 'healthcare']
      },
      {
        title: 'Machine Learning Algorithms Study',
        content: `# ML Algorithms

## Supervised Learning
- Linear Regression
- Decision Trees
- Random Forest
- SVM

## Unsupervised Learning
- K-Means Clustering
- PCA
- DBSCAN`,
        tags: ['research', 'machine-learning', 'algorithms']
      }
    ],

    projectManagement: [
      {
        title: 'Project Alpha - Overview',
        content: `# Project Alpha

## Timeline
- Phase 1: Design (4 weeks)
- Phase 2: Development (8 weeks)
- Phase 3: Testing (4 weeks)

## Team
- PM: Sarah
- Dev: John
- Design: Mike`,
        tags: ['project-alpha', 'project-management', 'overview']
      },
      {
        title: 'Sprint 1 Planning',
        content: `# Sprint 1 Planning

## Goals
- User authentication
- Basic CRUD operations
- UI framework setup

## User Stories
- [ ] User can register
- [ ] User can login
- [ ] User can create notes`,
        tags: ['project-alpha', 'sprint-planning', 'development']
      }
    ]
  }
};

/**
 * Creates a single test note
 */
export async function createTestNote(
  page: Page, 
  noteData: TestNote
): Promise<void> {
  const { editor } = await createNoteAndWaitForEditor(page, noteData.title);
  
  // Add content
  await editor.click();
  await editor.type(noteData.content);
  
  // Add tags if provided
  if (noteData.tags && noteData.tags.length > 0) {
    const tagInput = page.locator('[data-testid="tag-input"]');
    if (await tagInput.isVisible()) {
      for (const tag of noteData.tags) {
        await tagInput.click();
        await tagInput.type(tag);
        await page.keyboard.press('Enter');
      }
    }
  }
  
  // Pin if requested
  if (noteData.pinned) {
    const noteItem = page.locator('[data-testid="note-item"]').first();
    await noteItem.click({ button: 'right' });
    await page.click('[data-testid="pin-note-button"]');
  }
  
  // Wait for save
  await waitForSaveSuccess(page);
}

/**
 * Creates multiple test notes
 */
export async function createTestNotes(
  page: Page, 
  notes: TestNote[]
): Promise<void> {
  for (const note of notes) {
    await createTestNote(page, note);
    await page.waitForTimeout(500); // Small delay between creations
  }
}

/**
 * Creates a complete workflow scenario
 */
export async function createWorkflowScenario(
  page: Page,
  scenario: keyof typeof TestData.workflows
): Promise<void> {
  const notes = TestData.workflows[scenario];
  await createTestNotes(page, notes);
}

/**
 * Cleans up test data
 */
export async function cleanupTestData(page: Page): Promise<void> {
  // This implementation depends on the app's data management
  // For now, we'll use localStorage cleanup
  await page.evaluate(() => {
    // Clear all test-related localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('test') || key.includes('notes') || key.includes('settings')) {
        localStorage.removeItem(key);
      }
    });
  });
  
  // Reload to apply cleanup
  await page.reload();
}

/**
 * Sets up a clean test environment
 */
export async function setupCleanEnvironment(page: Page): Promise<void> {
  await cleanupTestData(page);
  
  // Wait for app to be ready
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
}

/**
 * Verifies note existence
 */
export async function verifyNoteExists(
  page: Page, 
  noteTitle: string
): Promise<boolean> {
  try {
    await page.waitForSelector(`text=${noteTitle}`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets current note count
 */
export async function getNoteCount(page: Page): Promise<number> {
  try {
    const noteItems = page.locator('[data-testid="note-item"]');
    return await noteItems.count();
  } catch {
    return 0;
  }
}

/**
 * Test data generators for edge cases
 */
export const DataGenerators = {
  /**
   * Generate note with very long title
   */
  longTitle: (): TestNote => ({
    title: 'Very Long Title '.repeat(50),
    content: 'Test content with long title',
    tags: ['long-title', 'edge-case']
  }),

  /**
   * Generate note with special characters
   */
  specialCharacters: (): TestNote => ({
    title: '!@#$%^&*()[]{}|;:,.<>?',
    content: 'Content with special characters: quotes and dashes',
    tags: ['special-chars', 'edge-case']
  }),

  /**
   * Generate note with unicode content
   */
  unicode: (): TestNote => ({
    title: '测试笔记 テストノート 📝',
    content: 'Unicode content: 日本語 中文 العربية Русский 🌍🎉',
    tags: ['unicode', 'international', 'test']
  }),

  /**
   * Generate very large note
   */
  largeNote: (): TestNote => ({
    title: 'Large Note Performance Test',
    content: 'This is a very large note. '.repeat(10000),
    tags: ['performance', 'large-content', 'test']
  }),

  /**
   * Generate random note for stress testing
   */
  random: (index: number): TestNote => ({
    title: `Random Test Note ${index}`,
    content: `Random content for note ${index}: ${Math.random().toString(36)}`,
    tags: [`random-${index}`, 'generated', 'test']
  })
};

/**
 * Performance test utilities
 */
export const PerformanceHelpers = {
  /**
   * Creates many notes for performance testing
   */
  async createManyNotes(page: Page, count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      const note = DataGenerators.random(i);
      await createTestNote(page, note);
      
      // Progress logging for large batches
      if (i % 10 === 0) {
        console.log(`Created ${i}/${count} test notes`);
      }
    }
  },

  /**
   * Measures operation time
   */
  async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { result, duration };
  }
};