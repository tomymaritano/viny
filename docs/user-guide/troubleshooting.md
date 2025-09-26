# Troubleshooting

## Common Issues

### Notes Not Saving

**Problem**: Notes disappear after refresh

**Solutions**:

1. Check browser localStorage quota
2. Verify auto-save is enabled
3. Clear browser cache and restart
4. Check for JavaScript errors in console

### Performance Issues

**Problem**: App running slowly

**Solutions**:

1. Clear browser cache
2. Reduce number of open notes
3. Check for large images in notes
4. Restart the application

### Search Not Working

**Problem**: Search doesn't find notes

**Solutions**:

1. Verify search index is built
2. Check for special characters in search
3. Try exact phrase search with quotes
4. Restart the application

## Browser-Specific Issues

### Safari

- Enable "Prevent cross-site tracking" exceptions
- Clear website data if issues persist

### Chrome

- Check for browser extensions interfering
- Disable ad blockers temporarily

### Firefox

- Check privacy settings
- Clear site data if needed

## Advanced Troubleshooting

### Debug Console

Open browser console (F12) and run:

```javascript
// Debug notebook persistence
debugNotebooks()

// Check localStorage
localStorage.getItem('viny-notes')

// Performance metrics
performanceMonitor.getCurrentMetrics()
```

### Reset Application

**Warning**: This will delete all local data

```javascript
// Clear all data
localStorage.clear()
// Refresh page
location.reload()
```

## Getting Help

1. Check the [FAQ](../reference/faq.md)
2. Search existing issues on GitHub
3. Create a new issue with:
   - Browser version
   - Operating system
   - Steps to reproduce
   - Console errors (if any)

## Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Any error messages
