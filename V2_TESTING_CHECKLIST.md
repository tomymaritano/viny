# 🧪 V2 Testing Checklist

**Date:** January 22, 2025  
**Purpose:** Comprehensive testing of Clean Architecture V2 implementation

## 🚀 Setup Instructions

### 1. Enable All V2 Features

```javascript
// Copy and paste this in browser console:
localStorage.setItem('feature_useCleanArchitecture', 'true')
localStorage.setItem('feature_useQueryForNotesList', 'true')
localStorage.setItem('feature_useQueryForNotebooks', 'true')
localStorage.setItem('feature_useQueryForSettings', 'true')
localStorage.setItem('feature_useQueryForSearch', 'true')
localStorage.setItem('feature_enableOfflinePersistence', 'true')
window.location.reload()
```

### 2. Verify Features Are Enabled

```javascript
// Check in console:
console.log(
  'Clean Architecture:',
  localStorage.getItem('feature_useCleanArchitecture')
)
console.log(
  'Query for Notes:',
  localStorage.getItem('feature_useQueryForNotesList')
)
console.log(
  'Query for Notebooks:',
  localStorage.getItem('feature_useQueryForNotebooks')
)
console.log(
  'Query for Settings:',
  localStorage.getItem('feature_useQueryForSettings')
)
console.log(
  'Query for Search:',
  localStorage.getItem('feature_useQueryForSearch')
)
console.log(
  'Offline Persistence:',
  localStorage.getItem('feature_enableOfflinePersistence')
)
```

## ✅ Testing Checklist

### **1. Search Functionality (SearchModalWithQuery)**

- [ ] Press `Cmd/Ctrl + K` to open search
- [ ] Type a search query
- [ ] Verify results appear without loading spinner (cached)
- [ ] Click on a result to open the note
- [ ] Close and reopen search - verify cache works (instant results)
- [ ] Test keyboard navigation (arrow keys, Enter)

### **2. Global Context Menu (GlobalContextMenuV2)**

_Only in Electron app_

- [ ] Right-click in empty area
- [ ] Verify context menu appears
- [ ] Test "Open Search" option
- [ ] Test "Open Settings" option
- [ ] Test "Create New Notebook" option

### **3. Notebook Management (ManageNotebooksModalV2)**

- [ ] Open Settings → General → Manage Categories
- [ ] **Create Category:**
  - [ ] Click "New Category"
  - [ ] Enter name and select color
  - [ ] Click "Create"
  - [ ] Verify category appears in list
- [ ] **Edit Category:**
  - [ ] Click edit icon on a category
  - [ ] Change name and/or color
  - [ ] Click "Save Changes"
  - [ ] Verify changes are reflected
- [ ] **Delete Empty Category:**
  - [ ] Click trash icon on empty category
  - [ ] Confirm deletion
  - [ ] Verify category is removed
- [ ] **Statistics:**
  - [ ] Verify total categories count
  - [ ] Verify total notes count
  - [ ] Verify empty categories count

### **4. Settings Modal (SettingsModalV2)**

- [ ] Open Settings (gear icon or Cmd/Ctrl + ,)
- [ ] Navigate through different tabs
- [ ] Change a setting (e.g., theme)
- [ ] Verify change is applied immediately
- [ ] Close and reopen - verify settings persist

### **5. Export Dialog (ExportDialogV2)**

- [ ] Open a note
- [ ] Click export button or use menu
- [ ] Select export format (PDF, HTML, Markdown)
- [ ] Toggle "Include Metadata"
- [ ] Enter custom filename (optional)
- [ ] Click Export
- [ ] Verify export works

### **6. Tag Management (TagModalV2)**

- [ ] Open a note
- [ ] Click on tags area or use Cmd/Ctrl + T
- [ ] **Add Tags:**
  - [ ] Type tag name and press Enter
  - [ ] Verify tag is added to note
- [ ] **Create New Tag:**
  - [ ] In global mode, create new tag with color
  - [ ] Verify tag appears in list
- [ ] **Change Tag Color:**
  - [ ] Click color dots to change tag color
  - [ ] Verify color updates
- [ ] **Remove Tags:**
  - [ ] Click X on tag to remove from note
  - [ ] Verify tag is removed

### **7. Notes List (NotesListV2)**

- [ ] **View Notes:**
  - [ ] Verify notes load without spinner
  - [ ] Scroll through list smoothly
- [ ] **Sorting:**
  - [ ] Click sort dropdown
  - [ ] Try different sort options
  - [ ] Verify sort works instantly
- [ ] **Hover Prefetch:**
  - [ ] Hover over a note for 500ms
  - [ ] Click on it
  - [ ] Verify it opens instantly (prefetched)
- [ ] **Virtual Scrolling:**
  - [ ] With many notes, verify smooth scrolling
  - [ ] Check performance with 1000+ notes

### **8. Sidebar (SidebarV2)**

- [ ] **Navigation:**
  - [ ] Click different sections (All Notes, Notebooks, Tags, etc.)
  - [ ] Verify instant navigation (no loading)
- [ ] **Expand/Collapse:**
  - [ ] Expand/collapse notebooks
  - [ ] Verify state persists on refresh
- [ ] **Context Menus:**
  - [ ] Right-click on notebook
  - [ ] Right-click on tag
  - [ ] Verify context menu options

### **9. Offline Functionality**

- [ ] Create/edit notes while online
- [ ] Go offline (disable network)
- [ ] Continue creating/editing notes
- [ ] Verify all operations work offline
- [ ] Go back online
- [ ] Verify sync happens automatically

### **10. Performance Tests**

- [ ] **Cache Performance:**
  - [ ] Navigate between sections rapidly
  - [ ] Verify no loading states appear
  - [ ] Check DevTools Network tab - minimal requests
- [ ] **Optimistic Updates:**
  - [ ] Create a note - should appear instantly
  - [ ] Edit a note - changes instant
  - [ ] Delete a note - disappears instantly
- [ ] **Memory Usage:**
  - [ ] Open DevTools Performance Monitor
  - [ ] Use app for 5 minutes
  - [ ] Verify memory stays stable

## 🐛 Common Issues to Check

### **1. Feature Flag Issues**

- If components don't update, ensure feature flags are set correctly
- Try clearing cache and reloading: `Cmd/Ctrl + Shift + R`

### **2. Console Errors**

- Open DevTools Console
- Look for any red errors
- Common ones to ignore:
  - "Failed to load resource" for missing favicons
  - Warning about React DevTools

### **3. State Persistence**

- Create some data (notes, notebooks)
- Refresh the page
- Verify all data persists

### **4. Race Conditions**

- Click rapidly between different notes
- Verify correct note always displays
- No content mixing between notes

## 📊 Performance Benchmarks

### **Expected Performance:**

- Note list load: < 100ms (cached)
- Note open: < 50ms (prefetched)
- Search results: < 200ms
- Settings save: Instant (optimistic)
- Notebook create: < 100ms

### **Memory Targets:**

- Initial load: < 50MB
- After 10 min use: < 100MB
- No memory leaks detected

## 🎯 Testing Report Template

```markdown
## V2 Testing Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [Browser/OS]

### Summary

- [ ] All core features working
- [ ] No critical bugs found
- [ ] Performance meets expectations
- [ ] Offline mode functional

### Issues Found

1. [Issue description]
   - Steps to reproduce
   - Expected vs Actual
   - Severity: Low/Medium/High

### Performance Metrics

- Average note load time: [X]ms
- Search response time: [X]ms
- Memory usage after 10min: [X]MB

### Recommendations

- [Any improvements needed]
```

## ✅ Sign-off Criteria

Before marking V2 as production-ready:

1. **Functionality:** All checklist items pass ✅
2. **Performance:** Meets or exceeds benchmarks ✅
3. **Stability:** No crashes in 30min testing ✅
4. **Memory:** No leaks detected ✅
5. **Offline:** Full functionality without internet ✅

---

**Note:** This checklist covers the migrated V2 components. Components not yet migrated (editor internals, AI features) will continue using V1 architecture.
