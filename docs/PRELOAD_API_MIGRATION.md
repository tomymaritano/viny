# Preload API Security Migration Guide

## Overview

As part of our security improvements, we've reduced the surface area of the preload API to minimize potential attack vectors. This document outlines the changes and migration paths.

## 🚫 Removed APIs

The following APIs have been removed from the preload script for security reasons:

### 1. **Backup & Recovery Operations**

- `storage.createBackup()`
- `storage.restoreFromBackup()`

**Why removed**: These operations can potentially access and modify large amounts of data. They should only be triggered from the main process with proper user authentication.

**Migration**:

- Move backup operations to the application menu
- Implement in main process with user confirmation dialogs
- Add progress notifications via IPC

### 2. **Data Migration & Maintenance**

- `storage.migrateFromLocalStorage()`
- `storage.checkDataIntegrity()`
- `storage.repairCorruptedData()`

**Why removed**: These are administrative operations that could be exploited to corrupt or access data inappropriately.

**Migration**:

- Trigger these operations from main process on app startup
- Add menu items for manual maintenance operations
- Implement progress UI using IPC events

### 3. **Bulk Import/Export**

- `storage.exportData()`
- `storage.importData()`

**Why removed**: Bulk data operations could be used to exfiltrate all user data or inject malicious content.

**Migration**:

- Keep individual note export (already implemented)
- Implement bulk operations through menu actions
- Add proper file selection dialogs in main process

### 4. **System Information**

- `storage.getStorageInfo()`
- `storage.getDataDirectory()`

**Why removed**: Exposing file system paths could help attackers understand the system structure.

**Migration**:

- Display storage info in settings UI (without paths)
- Calculate statistics in main process
- Send only necessary info to renderer

### 5. **Window Dragging Methods**

- `startWindowDrag()`
- `continueWindowDrag()`
- `endWindowDrag()`

**Why removed**: These were legacy methods that are no longer needed with modern Electron window handling.

**Migration**:

- Use CSS `-webkit-app-region: drag` for draggable areas
- Native window controls handle this automatically

## ✅ Retained APIs

The following essential APIs remain available:

### Core CRUD Operations

- `storage.saveNote()` - Create/update notes
- `storage.loadNote()` - Load single note
- `storage.loadAllNotes()` - Load all notes
- `storage.deleteNote()` - Delete note

### Organization

- `storage.saveNotebooks()` - Save notebook structure
- `storage.loadNotebooks()` - Load notebooks
- `storage.saveSettings()` - Save user preferences
- `storage.loadSettings()` - Load preferences
- `storage.saveTagColors()` - Save tag colors
- `storage.loadTagColors()` - Load tag colors

### Export (Individual)

- `export.showSaveDialog()` - File save dialog
- `export.exportNoteToFile()` - Export single note
- `export.exportNoteToPDF()` - Export to PDF
- `export.showItemInFolder()` - Show in file manager

### UI Operations

- `openSettings()` - Open settings window
- `windowControls.*` - Window management
- `openNoteInNewWindow()` - Multi-window support
- `showContextMenu()` - Context menus

## 🔧 Implementation Guide

### For Backup Operations

**Before (Insecure)**:

```javascript
// In renderer
await window.electronAPI.storage.createBackup('/path/to/backup')
```

**After (Secure)**:

```javascript
// In main.ts - Add menu item
{
  label: 'Create Backup...',
  click: async () => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `viny-backup-${Date.now()}.zip`,
      filters: [{ name: 'Backup Files', extensions: ['zip'] }]
    })

    if (filePath) {
      // Create backup with progress
      await createBackupWithProgress(filePath)
    }
  }
}

// In renderer - Listen for progress
window.electronAPI.on('backup-progress', (progress) => {
  updateProgressBar(progress)
})
```

### For Data Integrity Checks

**Before (Insecure)**:

```javascript
// In renderer
const result = await window.electronAPI.storage.checkDataIntegrity()
```

**After (Secure)**:

```javascript
// In main.ts - Run on startup
app.on('ready', async () => {
  const integrityCheck = await storageService.checkDataIntegrity()
  if (!integrityCheck.success) {
    // Show dialog to user
    dialog.showMessageBox({
      type: 'warning',
      title: 'Data Integrity Issue',
      message:
        'Some data inconsistencies were found. Would you like to repair them?',
      buttons: ['Repair', 'Ignore'],
    })
  }
})
```

### For Storage Information

**Before (Insecure)**:

```javascript
// In renderer - Exposed paths
const info = await window.electronAPI.storage.getStorageInfo()
console.log(info.dataDirectory) // Security risk!
```

**After (Secure)**:

```javascript
// In main.ts - Send only statistics
ipcMain.handle('get-storage-stats', async () => {
  const notes = await storageService.loadAllNotes()
  return {
    noteCount: notes.length,
    totalSize: calculateTotalSize(notes),
    // Don't include paths
  }
})

// In renderer
const stats = await window.electronAPI.getStorageStats()
```

## 🔐 Security Benefits

1. **Reduced Attack Surface**: Fewer APIs mean fewer potential vulnerabilities
2. **Principle of Least Privilege**: Renderer only has access to what it needs
3. **Better Audit Trail**: Administrative operations go through main process
4. **User Consent**: Dangerous operations require explicit user action
5. **Path Protection**: File system structure remains hidden

## 📝 Checklist for Developers

When updating code:

- [ ] Remove calls to deprecated APIs
- [ ] Implement menu actions for administrative operations
- [ ] Add proper progress feedback for long operations
- [ ] Ensure all file operations use proper dialogs
- [ ] Test that core functionality still works
- [ ] Update any documentation referencing old APIs

## 🚀 Future Improvements

1. **Role-based API Access**: Different API sets for different windows
2. **Operation Limits**: Rate limiting on API calls
3. **Audit Logging**: Track all sensitive operations
4. **Encrypted Storage**: Additional security for sensitive data

---

**Migration Deadline**: Please update all code by February 1, 2025
**Support**: Contact the security team for migration assistance
