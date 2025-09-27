# Console Cleanup Report

Generated: 2025-07-22T11:56:18.408Z

## Summary

- Total console statements: 128
- Files affected: 60

## Files to Update

### src/main.tsx

Suggested logger: `import { initLogger } from '../utils/logger'`

**Line 77** (log):

```typescript
// Current:
console.log('🚀 MAIN.TSX LOADED - APP STARTING')

// Suggested:
initLogger.info('🚀 MAIN.TSX LOADED - APP STARTING')
```

---

### src/utils/notebookTree.ts

Suggested logger: `import { notebookLogger } from '../utils/logger'`

**Line 98** (warn):

```typescript
// Current:
console.warn(

// Suggested:
notebookLogger.warn(
```

---

### src/utils/markdownRenderer.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 39** (error):

```typescript
// Current:
console.error('Failed to load image from storage:', error)

// Suggested:
editorLogger.error('Failed to load image from storage:', error)
```

---

### src/utils/imageUtils.ts

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 126** (warn):

```typescript
// Current:
//      console.warn('External URL blocked for security')

// Suggested:
//      storageLogger.warn('External URL blocked for security')
```

---

### src/utils/errorUtils.ts

Suggested logger: `import { logger } from '../utils/logger'`

**Line 55** (error):

```typescript
// Current:
console.error(`Error in ${context}:`, error)

// Suggested:
logger.error(`Error in ${context}:`, error)
```

---

### src/utils/codeHighlighting.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 26** (error):

```typescript
// Current:
console.error('Failed to copy code:', err)

// Suggested:
editorLogger.error('Failed to copy code:', err)
```

**Line 34** (error):

```typescript
// Current:
console.error('Error copying code:', error)

// Suggested:
editorLogger.error('Error copying code:', error)
```

**Line 63** (error):

```typescript
// Current:
console.error('Fallback copy failed:', error)

// Suggested:
editorLogger.error('Fallback copy failed:', error)
```

**Line 11** (warn):

```typescript
// Current:
console.warn(`Code element with ID ${codeId} not found`)

// Suggested:
editorLogger.warn(`Code element with ID ${codeId} not found`)
```

---

### src/stores/slices/notebooksSlice.ts

Suggested logger: `import { notebookLogger } from '../utils/logger'`

**Line 179** (log):

```typescript
// Current:
console.log('📚 NotebooksSlice.loadNotebooks called')

// Suggested:
notebookLogger.info('📚 NotebooksSlice.loadNotebooks called')
```

**Line 187** (log):

```typescript
// Current:
console.log('📦 Loaded notebooks from repository:', loadedNotebooks)

// Suggested:
notebookLogger.info('📦 Loaded notebooks from repository:', loadedNotebooks)
```

**Line 197** (log):

```typescript
// Current:
console.log('🌳 Built notebook tree:', treeNotebooks)

// Suggested:
notebookLogger.info('🌳 Built notebook tree:', treeNotebooks)
```

---

### src/stores/slices/authSlice.ts

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 154** (error):

```typescript
// Current:
console.error('Logout error:', error)

// Suggested:
apiLogger.error('Logout error:', error)
```

---

### src/services/i18nService.ts

Suggested logger: `import { logger } from '../utils/logger'`

**Line 140** (warn):

```typescript
// Current:
console.warn(

// Suggested:
logger.warn(
```

---

### src/services/AppInitializationService.ts

Suggested logger: `import { initLogger } from '../utils/logger'`

**Line 124** (warn):

```typescript
// Current:
console.warn('⚠️ loadNotebooks not provided')

// Suggested:
initLogger.warn('⚠️ loadNotebooks not provided')
```

**Line 21** (log):

```typescript
// Current:
*   console.log('App initialized successfully')

// Suggested:
*   initLogger.info('App initialized successfully')
```

**Line 120** (log):

```typescript
// Current:
console.log('🗂️ Loading notebooks...')

// Suggested:
initLogger.info('🗂️ Loading notebooks...')
```

**Line 122** (log):

```typescript
// Current:
console.log('✅ Notebooks loaded')

// Suggested:
initLogger.info('✅ Notebooks loaded')
```

---

### src/lib/markdown.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 141** (error):

```typescript
// Current:
console.error(`Failed to load language ${resolvedLang}:`, error)

// Suggested:
editorLogger.error(`Failed to load language ${resolvedLang}:`, error)
```

**Line 404** (error):

```typescript
// Current:
console.error('Markdown rendering error:', error)

// Suggested:
editorLogger.error('Markdown rendering error:', error)
```

**Line 606** (error):

```typescript
// Current:
console.error('Failed to load image from storage:', error)

// Suggested:
editorLogger.error('Failed to load image from storage:', error)
```

**Line 121** (warn):

```typescript
// Current:
console.warn(`Language not supported: ${lang} (resolved: ${resolvedLang})`)

// Suggested:
editorLogger.warn(`Language not supported: ${lang} (resolved: ${resolvedLang})`)
```

**Line 176** (warn):

```typescript
// Current:
console.warn(`Highlighting failed for language ${language}:`, error)

// Suggested:
editorLogger.warn(`Highlighting failed for language ${language}:`, error)
```

**Line 200** (warn):

```typescript
// Current:
console.warn(`Highlighting failed for language ${lang}:`, error)

// Suggested:
editorLogger.warn(`Highlighting failed for language ${lang}:`, error)
```

**Line 337** (warn):

```typescript
// Current:
console.warn('Plugin beforeMarkdown hook failed:', error)

// Suggested:
editorLogger.warn('Plugin beforeMarkdown hook failed:', error)
```

**Line 394** (warn):

```typescript
// Current:
console.warn('Plugin afterHTML hook failed:', error)

// Suggested:
editorLogger.warn('Plugin afterHTML hook failed:', error)
```

**Line 139** (debug):

```typescript
// Current:
console.debug(`Loaded language: ${resolvedLang}`)

// Suggested:
editorLogger.debug(`Loaded language: ${resolvedLang}`)
```

**Line 156** (debug):

```typescript
// Current:
console.debug('Core languages pre-loaded')

// Suggested:
editorLogger.debug('Core languages pre-loaded')
```

---

### src/lib/repositories/RepositoryFactory.ts

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 60** (log):

```typescript
// Current:
console.log(

// Suggested:
storageLogger.info(
```

---

### src/lib/repositories/errors/RepositoryErrorHandler.ts

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 500** (error):

```typescript
// Current:
console.error('Security-related repository error:', logData)

// Suggested:
storageLogger.error('Security-related repository error:', logData)
```

**Line 502** (error):

```typescript
// Current:
console.error('Permanent repository error:', logData)

// Suggested:
storageLogger.error('Permanent repository error:', logData)
```

**Line 149** (warn):

```typescript
// Current:
console.warn(

// Suggested:
storageLogger.warn(
```

**Line 296** (warn):

```typescript
// Current:
console.warn(`Circuit breaker opened after ${this.failures} failures`, {

// Suggested:
storageLogger.warn(`Circuit breaker opened after ${this.failures} failures`, {
```

**Line 504** (warn):

```typescript
// Current:
console.warn('Repository error:', logData)

// Suggested:
storageLogger.warn('Repository error:', logData)
```

**Line 307** (info):

```typescript
// Current:
console.info('Circuit breaker reset - service restored')

// Suggested:
storageLogger.info('Circuit breaker reset - service restored')
```

---

### src/lib/rag/embeddings/embedding.worker.ts

Suggested logger: `import { logger } from '../utils/logger'`

**Line 83** (error):

```typescript
// Current:
console.error(`Failed to embed chunk ${chunk.id}:`, error)

// Suggested:
logger.error(`Failed to embed chunk ${chunk.id}:`, error)
```

---

### src/hooks/useStreamingResponse.ts

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 68** (error):

```typescript
// Current:
console.error('Failed to parse SSE data:', e)

// Suggested:
apiLogger.error('Failed to parse SSE data:', e)
```

**Line 74** (error):

```typescript
// Current:
console.error('Streaming error:', error)

// Suggested:
apiLogger.error('Streaming error:', error)
```

---

### src/hooks/useSettingsErrorHandler.ts

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 58** (error):

```typescript
// Current:
console.error(`Settings error for ${key}:`, error)

// Suggested:
settingsLogger.error(`Settings error for ${key}:`, error)
```

---

### src/hooks/useSettingsEffects.ts

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 38** (error):

```typescript
// Current:
console.error('❌ Failed to apply theme:', error)

// Suggested:
settingsLogger.error('❌ Failed to apply theme:', error)
```

**Line 56** (error):

```typescript
// Current:
console.error('Failed to apply language:', error)

// Suggested:
settingsLogger.error('Failed to apply language:', error)
```

**Line 71** (error):

```typescript
// Current:
console.error('Failed to apply custom CSS:', error)

// Suggested:
settingsLogger.error('Failed to apply custom CSS:', error)
```

**Line 92** (error):

```typescript
// Current:
console.error('Failed to apply typography settings:', error)

// Suggested:
settingsLogger.error('Failed to apply typography settings:', error)
```

**Line 26** (log):

```typescript
// Current:
console.log(

// Suggested:
settingsLogger.info(
```

**Line 36** (log):

```typescript
// Current:
console.log('✅ Theme applied successfully:', theme)

// Suggested:
settingsLogger.info('✅ Theme applied successfully:', theme)
```

---

### src/hooks/useNoteSync.ts

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 16** (log):

```typescript
// Current:
console.log('Received note update from other window:', updatedNote.id)

// Suggested:
noteLogger.info('Received note update from other window:', updatedNote.id)
```

---

### src/hooks/useExport.ts

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 227** (error):

```typescript
// Current:
console.error('PDF export failed:', error)

// Suggested:
noteLogger.error('PDF export failed:', error)
```

---

### src/hooks/useAppHandlers.ts

Suggested logger: `import { logger } from '../utils/logger'`

**Line 35** (error):

```typescript
// Current:
console.error('Note not found:', noteId)

// Suggested:
logger.error('Note not found:', noteId)
```

---

### src/data/defaultNotes.ts

Suggested logger: `import { logger } from '../utils/logger'`

**Line 103** (log):

```typescript
// Current:
console.log('Hello, world!')

// Suggested:
logger.info('Hello, world!')
```

---

### src/contexts/ServiceContext.tsx

Suggested logger: `import { initLogger } from '../utils/logger'`

**Line 41** (error):

```typescript
// Current:
console.error('Failed to initialize repository:', error)

// Suggested:
initLogger.error('Failed to initialize repository:', error)
```

---

### src/config/env.ts

Suggested logger: `import { initLogger } from '../utils/logger'`

**Line 90** (error):

```typescript
// Current:
console.error('Environment validation failed:')

// Suggested:
initLogger.error('Environment validation failed:')
```

**Line 91** (error):

```typescript
// Current:
errors.forEach(error => console.error(`- ${error}`))

// Suggested:
errors.forEach(error => initLogger.error(`- ${error}`))
```

**Line 96** (log):

```typescript
// Current:
console.log('Environment configuration:', env)

// Suggested:
initLogger.info('Environment configuration:', env)
```

---

### src/config/editorSmartPaste.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 168** (log):

```typescript
// Current:
console.log('Smart Paste: Paste event triggered')

// Suggested:
editorLogger.info('Smart Paste: Paste event triggered')
```

**Line 172** (log):

```typescript
// Current:
console.log('Smart Paste: No clipboard data')

// Suggested:
editorLogger.info('Smart Paste: No clipboard data')
```

**Line 177** (log):

```typescript
// Current:
console.log('Smart Paste: Available types:', Array.from(clipboardData.types))

// Suggested:
editorLogger.info(
  'Smart Paste: Available types:',
  Array.from(clipboardData.types)
)
```

**Line 198** (log):

```typescript
// Current:
console.log('Smart Paste: HTML data:', htmlData ? 'Found' : 'Not found')

// Suggested:
editorLogger.info('Smart Paste: HTML data:', htmlData ? 'Found' : 'Not found')
```

**Line 203** (log):

```typescript
// Current:
console.log('Smart Paste: HTML detected', htmlData.substring(0, 200) + '...')

// Suggested:
editorLogger.info(
  'Smart Paste: HTML detected',
  htmlData.substring(0, 200) + '...'
)
```

**Line 208** (log):

```typescript
// Current:
console.log('Smart Paste: Converted to markdown:', markdown)

// Suggested:
editorLogger.info('Smart Paste: Converted to markdown:', markdown)
```

**Line 246** (log):

```typescript
// Current:
console.log('Smart Paste: Fallback to default paste behavior')

// Suggested:
editorLogger.info('Smart Paste: Fallback to default paste behavior')
```

---

### src/config/editorLinkPreview.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 212** (error):

```typescript
// Current:
console.error('Failed to open link:', err)

// Suggested:
editorLogger.error('Failed to open link:', err)
```

---

### src/components/ResizableLayout.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 86** (warn):

```typescript
// Current:
console.warn('Failed to load layout state:', error)

// Suggested:
logger.warn('Failed to load layout state:', error)
```

**Line 101** (warn):

```typescript
// Current:
console.warn('Failed to save notes list width:', error)

// Suggested:
logger.warn('Failed to save notes list width:', error)
```

**Line 115** (warn):

```typescript
// Current:
console.warn('Failed to save sidebar width:', error)

// Suggested:
logger.warn('Failed to save sidebar width:', error)
```

**Line 129** (warn):

```typescript
// Current:
console.warn('Failed to save AI chat width:', error)

// Suggested:
logger.warn('Failed to save AI chat width:', error)
```

---

### src/components/MarkdownPreview.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 113** (error):

```typescript
// Current:
console.error('Error parsing markdown:', error)

// Suggested:
editorLogger.error('Error parsing markdown:', error)
```

**Line 250** (error):

```typescript
// Current:
console.error('Failed to open link:', err)

// Suggested:
editorLogger.error('Failed to open link:', err)
```

---

### src/components/MarkdownItEditor.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 147** (error):

```typescript
// Current:
console.error('MarkdownEditor Error:', error, errorInfo)

// Suggested:
editorLogger.error('MarkdownEditor Error:', error, errorInfo)
```

---

### src/components/ui/NoteActionsDropdown.tsx

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 73** (error):

```typescript
// Current:
console.error('Error executing note action:', error)

// Suggested:
noteLogger.error('Error executing note action:', error)
```

---

### src/components/ui/NoteActionsDrawer.tsx

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 77** (error):

```typescript
// Current:
console.error('Error executing note action:', error)

// Suggested:
noteLogger.error('Error executing note action:', error)
```

**Line 90** (error):

```typescript
// Current:
console.error('Error exporting note:', error)

// Suggested:
noteLogger.error('Error exporting note:', error)
```

---

### src/components/ui/CreateNotebookModal.tsx

Suggested logger: `import { notebookLogger } from '../utils/logger'`

**Line 112** (error):

```typescript
// Current:
console.error('Failed to create category:', error)

// Suggested:
notebookLogger.error('Failed to create category:', error)
```

---

### src/components/ui/ContextMenuRadix.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 334** (log):

```typescript
// Current:
onClick: () => console.log('Open', fileName),

// Suggested:
onClick: () => logger.info('Open', fileName),
```

**Line 345** (log):

```typescript
// Current:
onClick: () => console.log('Open with Text Editor'),

// Suggested:
onClick: () => logger.info('Open with Text Editor'),
```

**Line 349** (log):

```typescript
// Current:
onClick: () => console.log('Open with Default App'),

// Suggested:
onClick: () => logger.info('Open with Default App'),
```

**Line 351** (log):

```typescript
// Current:
{ label: 'Choose App...', onClick: () => console.log('Choose App') },

// Suggested:
{ label: 'Choose App...', onClick: () => logger.info('Choose App') },
```

---

### src/components/sidebar/SidebarContent.tsx

Suggested logger: `import { sidebarLogger } from '../utils/logger'`

**Line 115** (error):

```typescript
// Current:
console.error('Failed to create note in notebook:', error)

// Suggested:
sidebarLogger.error('Failed to create note in notebook:', error)
```

**Line 310** (error):

```typescript
// Current:
console.error('Failed to delete notebook:', error)

// Suggested:
sidebarLogger.error('Failed to delete notebook:', error)
```

**Line 404** (error):

```typescript
// Current:
console.error('Failed to rename notebook:', error)

// Suggested:
sidebarLogger.error('Failed to rename notebook:', error)
```

---

### src/components/settings/SettingsPanel.tsx

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 63** (error):

```typescript
// Current:
console.error(

// Suggested:
settingsLogger.error(
```

---

### src/components/settings/LivePreview.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 48** (error):

```typescript
// Current:
console.error('Preview failed:', error)

// Suggested:
editorLogger.error('Preview failed:', error)
```

---

### src/components/settings/DatabaseMigration.tsx

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 60** (error):

```typescript
// Current:
console.error('Failed to check migration status:', error)

// Suggested:
storageLogger.error('Failed to check migration status:', error)
```

**Line 92** (error):

```typescript
// Current:
console.error('Migration failed:', error)

// Suggested:
storageLogger.error('Migration failed:', error)
```

---

### src/components/settings/tabs/StorageSettings.tsx

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 30** (error):

```typescript
// Current:
console.error('Failed to load storage info:', error)

// Suggested:
storageLogger.error('Failed to load storage info:', error)
```

**Line 44** (error):

```typescript
// Current:
console.error('Backup failed:', error)

// Suggested:
storageLogger.error('Backup failed:', error)
```

**Line 58** (error):

```typescript
// Current:
console.error('Export failed:', error)

// Suggested:
storageLogger.error('Export failed:', error)
```

**Line 71** (error):

```typescript
// Current:
console.error('Import failed:', error)

// Suggested:
storageLogger.error('Import failed:', error)
```

---

### src/components/settings/tabs/MCPSettings.tsx

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 52** (error):

```typescript
// Current:
console.error('Failed to fetch MCP status:', error)

// Suggested:
settingsLogger.error('Failed to fetch MCP status:', error)
```

---

### src/components/settings/tabs/BackupSettings.tsx

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 43** (error):

```typescript
// Current:
console.error('Failed to select backup location:', error)

// Suggested:
settingsLogger.error('Failed to select backup location:', error)
```

---

### src/components/settings/tabs/AISettings.tsx

Suggested logger: `import { settingsLogger } from '../utils/logger'`

**Line 24** (warn):

```typescript
// Current:
console.warn('WebLLM service not available in settings')

// Suggested:
settingsLogger.warn('WebLLM service not available in settings')
```

---

### src/components/plugins/PluginPanel.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 187** (error):

```typescript
// Current:
console.error('Failed to toggle plugin:', error)

// Suggested:
logger.error('Failed to toggle plugin:', error)
```

---

### src/components/performance/CleanArchPerformanceDashboard.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 111** (log):

```typescript
// Current:
console.log('Query cache cleared')

// Suggested:
logger.info('Query cache cleared')
```

---

### src/components/metadata/NotebookSelectorModal.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 194** (log):

```typescript
// Current:
console.log(

// Suggested:
logger.info(
```

---

### src/components/errors/StorageErrorBoundary.tsx

Suggested logger: `import { storageLogger } from '../utils/logger'`

**Line 54** (error):

```typescript
// Current:
console.error('Storage Error:', error, errorInfo)

// Suggested:
storageLogger.error('Storage Error:', error, errorInfo)
```

**Line 55** (error):

```typescript
// Current:
console.error('Error stack:', error.stack)

// Suggested:
storageLogger.error('Error stack:', error.stack)
```

**Line 56** (error):

```typescript
// Current:
console.error('Component stack:', errorInfo.componentStack)

// Suggested:
storageLogger.error('Component stack:', errorInfo.componentStack)
```

**Line 96** (error):

```typescript
// Current:
console.error('Retry failed:', retryError)

// Suggested:
storageLogger.error('Retry failed:', retryError)
```

**Line 139** (error):

```typescript
// Current:
console.error('Failed to clear storage:', error)

// Suggested:
storageLogger.error('Failed to clear storage:', error)
```

**Line 148** (log):

```typescript
// Current:
console.log('Storage debug function removed')

// Suggested:
storageLogger.info('Storage debug function removed')
```

**Line 171** (log):

```typescript
// Current:
console.log('Storage backup:', backup)

// Suggested:
storageLogger.info('Storage backup:', backup)
```

---

### src/components/errors/SearchErrorBoundary.tsx

Suggested logger: `import { searchLogger } from '../utils/logger'`

**Line 38** (error):

```typescript
// Current:
console.error('Search Error:', error, errorInfo)

// Suggested:
searchLogger.error('Search Error:', error, errorInfo)
```

---

### src/components/errors/ComponentErrorBoundary.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 44** (error):

```typescript
// Current:
console.error(`Error in ${this.props.componentName}:`, error, errorInfo)

// Suggested:
logger.error(`Error in ${this.props.componentName}:`, error, errorInfo)
```

---

### src/components/editor/ZenModeFixed.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 45** (error):

```typescript
// Current:
console.error('Fullscreen toggle failed:', error)

// Suggested:
editorLogger.error('Fullscreen toggle failed:', error)
```

---

### src/components/editor/ZenMode.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 45** (error):

```typescript
// Current:
console.error('Fullscreen toggle failed:', error)

// Suggested:
editorLogger.error('Fullscreen toggle failed:', error)
```

---

### src/components/editor/SplitEditorV2.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 144** (error):

```typescript
// Current:
console.error('Failed to process markdown:', error)

// Suggested:
editorLogger.error('Failed to process markdown:', error)
```

---

### src/components/editor/SplitEditor.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 63** (warn):

```typescript
// Current:
console.warn('Failed to load split ratio:', error)

// Suggested:
editorLogger.warn('Failed to load split ratio:', error)
```

**Line 159** (warn):

```typescript
// Current:
console.warn('Failed to save split ratio:', error)

// Suggested:
editorLogger.warn('Failed to save split ratio:', error)
```

**Line 299** (warn):

```typescript
// Current:
console.warn(

// Suggested:
editorLogger.warn(
```

**Line 383** (warn):

```typescript
// Current:
console.warn(

// Suggested:
editorLogger.warn(
```

---

### src/components/editor/toolbar/EditorToolbar.tsx

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 146** (error):

```typescript
// Current:
console.error('Failed to store image:', error)

// Suggested:
editorLogger.error('Failed to store image:', error)
```

**Line 153** (error):

```typescript
// Current:
console.error('Error processing image:', error)

// Suggested:
editorLogger.error('Error processing image:', error)
```

---

### src/components/editor/tags/TagModal.tsx

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 69** (error):

```typescript
// Current:
console.error('Error parsing temp tag action:', error)

// Suggested:
noteLogger.error('Error parsing temp tag action:', error)
```

**Line 130** (error):

```typescript
// Current:
console.error('Failed to delete tag:', error)

// Suggested:
noteLogger.error('Failed to delete tag:', error)
```

---

### src/components/editor/metadata/TagManager.tsx

Suggested logger: `import { noteLogger } from '../utils/logger'`

**Line 46** (error):

```typescript
// Current:
console.error('Failed to add tag:', error)

// Suggested:
noteLogger.error('Failed to add tag:', error)
```

**Line 54** (error):

```typescript
// Current:
console.error('Failed to remove tag:', error)

// Suggested:
noteLogger.error('Failed to remove tag:', error)
```

---

### src/components/editor/hooks/useEditorState.ts

Suggested logger: `import { editorLogger } from '../utils/logger'`

**Line 87** (error):

```typescript
// Current:
console.error('Error duplicating note:', error)

// Suggested:
editorLogger.error('Error duplicating note:', error)
```

**Line 107** (error):

```typescript
// Current:
console.error('Error deleting note:', error)

// Suggested:
editorLogger.error('Error deleting note:', error)
```

**Line 125** (error):

```typescript
// Current:
console.error('Error toggling pin:', error)

// Suggested:
editorLogger.error('Error toggling pin:', error)
```

---

### src/components/auth/VantaFog.tsx

Suggested logger: `import { logger } from '../utils/logger'`

**Line 70** (error):

```typescript
// Current:
console.error('Error loading Vanta FOG effect:', error)

// Suggested:
logger.error('Error loading Vanta FOG effect:', error)
```

---

### src/components/auth/UserProfile.tsx

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 122** (error):

```typescript
// Current:
console.error('Profile update error:', error)

// Suggested:
apiLogger.error('Profile update error:', error)
```

**Line 144** (error):

```typescript
// Current:
console.error('Password change error:', error)

// Suggested:
apiLogger.error('Password change error:', error)
```

**Line 154** (error):

```typescript
// Current:
console.error('Logout error:', error)

// Suggested:
apiLogger.error('Logout error:', error)
```

---

### src/components/auth/OptionalAuthGuard.tsx

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 66** (error):

```typescript
// Current:
console.error('Auth check error:', error)

// Suggested:
apiLogger.error('Auth check error:', error)
```

**Line 48** (log):

```typescript
// Current:
console.log('Auth server not available, continuing in offline mode')

// Suggested:
apiLogger.info('Auth server not available, continuing in offline mode')
```

---

### src/components/auth/LoginPage.tsx

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 197** (log):

```typescript
// Current:
onClick={() => console.log('Forgot password')}

// Suggested:
onClick={() => apiLogger.info('Forgot password')}
```

---

### src/components/auth/AuthGuard.tsx

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 37** (error):

```typescript
// Current:
console.error('Auth initialization error:', error)

// Suggested:
apiLogger.error('Auth initialization error:', error)
```

---

### src/components/ai/ChatPanel.tsx

Suggested logger: `import { apiLogger } from '../utils/logger'`

**Line 73** (error):

```typescript
// Current:
console.error('Failed to check services:', error)

// Suggested:
apiLogger.error('Failed to check services:', error)
```

**Line 146** (error):

```typescript
// Current:
console.error('Chat error:', error)

// Suggested:
apiLogger.error('Chat error:', error)
```

---
