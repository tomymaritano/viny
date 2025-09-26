# 🔄 V2 Rollback Plan

**Purpose:** Emergency procedures to rollback from V2 to V1 if critical issues are found

## 🚨 When to Rollback

Consider rollback if:

- Data loss or corruption occurs
- Performance degrades significantly
- Critical features stop working
- User complaints exceed threshold

## 📋 Rollback Steps

### 1. **Immediate Rollback (User Level)**

Users can disable V2 features instantly:

```javascript
// In browser console:
localStorage.removeItem('feature_useCleanArchitecture')
localStorage.removeItem('feature_useQueryForNotesList')
localStorage.removeItem('feature_useQueryForNotebooks')
localStorage.removeItem('feature_useQueryForSettings')
localStorage.removeItem('feature_useQueryForSearch')
localStorage.removeItem('feature_enableOfflinePersistence')
window.location.reload()
```

Or use the script:

```bash
node scripts/enable-v2-features.js disable
```

### 2. **Partial Rollback**

Disable specific problematic features:

```javascript
// Example: Only disable TanStack Query for notes
localStorage.removeItem('feature_useQueryForNotesList')
window.location.reload()
```

### 3. **Code-Level Rollback**

If feature flags don't work:

1. **Update all wrappers to force V1:**

```typescript
// Example: GlobalContextMenuWrapper.tsx
export const GlobalContextMenuWrapper = () => {
  // Force V1 regardless of feature flag
  return <GlobalContextMenu />
}
```

2. **Deploy hotfix:**

```bash
git checkout -b hotfix/force-v1
# Update all wrappers
git commit -m "hotfix: force V1 components"
git push origin hotfix/force-v1
```

### 4. **Full Version Rollback**

Revert to v1.5.0:

```bash
# For git deployments
git checkout v1.5.0
git push origin v1.5.0:main --force

# For npm packages
npm install viny@1.5.0
```

## 🔍 Rollback Verification

After rollback, verify:

1. **Feature Flags Cleared:**

```javascript
// Should all return null
console.log(localStorage.getItem('feature_useCleanArchitecture'))
console.log(localStorage.getItem('feature_useQueryForNotesList'))
// etc...
```

2. **V1 Components Active:**

- Check DevTools React Components tab
- Look for component names without "V2" suffix

3. **Data Integrity:**

- All notes visible
- All notebooks present
- Settings preserved
- Tags intact

## 📊 Monitoring During Rollback

Watch for:

- Console errors clearing up
- Performance returning to normal
- User reports stopping

## 🛡️ Data Safety

V2 uses the same data format as V1, so:

- ✅ No data migration needed
- ✅ No data loss on rollback
- ✅ All content preserved

## 📞 Communication Plan

If rollback needed:

1. **Notify users immediately:**
   - In-app notification
   - Status page update
   - Social media post

2. **Message template:**

   ```
   We've temporarily disabled some new features while we
   investigate reported issues. Your data is safe and the
   app remains fully functional. We'll update you soon.
   ```

3. **Follow-up within 24 hours**

## 🔧 Post-Rollback Actions

1. **Analyze root cause**
2. **Fix issues in V2 code**
3. **Test thoroughly**
4. **Plan gradual re-release**
5. **Update feature flags strategy**

## 🎯 Prevention Measures

To avoid future rollbacks:

1. **Gradual rollout:** Enable V2 for small user percentage first
2. **Monitoring:** Watch error rates and performance metrics
3. **User feedback:** Quick response to issues
4. **Testing:** Comprehensive test suite before release

---

**Remember:** The architecture allows feature-by-feature rollback, so full rollback should rarely be needed. Start with disabling specific problematic features first.
