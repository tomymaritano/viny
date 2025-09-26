# 📝 Notes CRUD Functionality Verification

**Date:** January 23, 2025  
**Purpose:** Verify all note operations work correctly with V2 architecture

## ✅ Test Checklist

### 1. **Create Note**

- [ ] Click "+" button or use Cmd/Ctrl+N
- [ ] Verify new note appears in list immediately
- [ ] Verify editor opens with empty content
- [ ] Type title and content
- [ ] Verify auto-save works
- [ ] Check note persists after refresh

### 2. **Read/View Note**

- [ ] Click on any note in the list
- [ ] Verify content loads in editor
- [ ] Verify preview shows formatted markdown
- [ ] Check metadata (created date, updated date)
- [ ] Verify notebook assignment is correct
- [ ] Check tags are displayed

### 3. **Update Note**

- [ ] Edit note title
- [ ] Edit note content
- [ ] Change notebook assignment
- [ ] Add/remove tags
- [ ] Change note status
- [ ] Pin/unpin note
- [ ] Verify all changes auto-save
- [ ] Check updated timestamp changes

### 4. **Delete Note**

- [ ] Right-click note → Delete
- [ ] Or use Delete key when note selected
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Check note moves to trash
- [ ] Verify note disappears from active list
- [ ] Check trash shows deleted note

### 5. **Search & Filter**

- [ ] Search for note by title
- [ ] Search for note by content
- [ ] Filter by notebook
- [ ] Filter by tag
- [ ] Filter by status
- [ ] Verify results update in real-time

### 6. **Sorting**

- [ ] Sort by title (A-Z, Z-A)
- [ ] Sort by created date
- [ ] Sort by updated date
- [ ] Sort by notebook
- [ ] Verify pinned notes stay on top

### 7. **Bulk Operations**

- [ ] Select multiple notes
- [ ] Move to different notebook
- [ ] Add tag to multiple notes
- [ ] Delete multiple notes
- [ ] Export selected notes

## 🔍 Edge Cases to Test

### 1. **Empty States**

- [ ] No notes - verify empty state message
- [ ] Empty notebook - verify message
- [ ] No search results - verify message
- [ ] Empty trash - verify message

### 2. **Large Data Sets**

- [ ] Create 100+ notes
- [ ] Verify scrolling performance
- [ ] Check search speed
- [ ] Test sorting with many notes
- [ ] Verify no memory leaks

### 3. **Concurrent Operations**

- [ ] Edit note while it's saving
- [ ] Quick switching between notes
- [ ] Search while creating note
- [ ] Multiple browser tabs

### 4. **Error Handling**

- [ ] Offline mode - create/edit notes
- [ ] Very long note content (10MB+)
- [ ] Special characters in title
- [ ] Network interruption during save

## 🎯 Expected Behavior

### **Performance Targets**

- Note creation: < 100ms
- Note loading: < 50ms (cached)
- Search results: < 200ms
- Auto-save: < 100ms
- List update: Instant (optimistic)

### **Data Integrity**

- No data loss on crash/refresh
- Consistent state across tabs
- Proper conflict resolution
- Accurate timestamps

### **UI/UX**

- Smooth animations
- No flickering
- Proper loading states
- Clear error messages
- Responsive design

## 📊 Test Results Template

```markdown
## Test Run: [Date]

### Environment

- Browser: [Chrome/Firefox/Safari]
- V2 Features: [Enabled/Disabled]
- Data Set: [Number of notes]

### Results

1. Create Note: ✅/❌ [Notes]
2. Read Note: ✅/❌ [Notes]
3. Update Note: ✅/❌ [Notes]
4. Delete Note: ✅/❌ [Notes]
5. Search: ✅/❌ [Notes]
6. Sorting: ✅/❌ [Notes]
7. Bulk Ops: ✅/❌ [Notes]

### Issues Found

- [Issue description]
- [Steps to reproduce]
- [Expected vs Actual]

### Performance Metrics

- Note creation: [X]ms
- Note loading: [X]ms
- Search time: [X]ms
- Memory usage: [X]MB
```

## 🛠️ Debug Commands

```javascript
// Check current notes in store
window.dev?.notes

// Check repository status
const repo = window.__repository
await repo.getAllNotes()

// Force refresh notes
window.location.reload()

// Clear all data (CAREFUL!)
localStorage.clear()
indexedDB.deleteDatabase('notesDB')
```

## 🔧 Common Fixes

### **Notes not updating**

1. Check feature flags are enabled
2. Verify repository is initialized
3. Check browser console for errors
4. Try force refresh (Cmd+Shift+R)

### **Search not working**

1. Check search index is created
2. Verify search cache is not stale
3. Try clearing search cache
4. Check for special characters

### **Performance issues**

1. Check number of notes
2. Monitor memory usage
3. Check for console errors
4. Disable extensions
5. Try incognito mode

---

**Next Steps:** After verification, proceed with comprehensive test suite creation.
