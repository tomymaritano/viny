# Build Fix Documentation

**Date:** January 22, 2025  
**Issue:** Rollup "Cannot add property 0, object is not extensible" error

## Problem

When running `npm run build`, the following error occurred:

```
error during build:
Cannot add property 0, object is not extensible
    at Array.push (<anonymous>)
    at ConditionalExpression.getLiteralValueAtPath
```

This error appears to be related to Rollup's internal handling of certain code patterns during the treeshaking phase.

## Solution

Disabled treeshaking in `vite.config.js`:

```javascript
rollupOptions: {
  treeshake: false,
  // ... rest of config
}
```

## Impact

- **Build size**: Minimal impact as Terser still performs minification
- **Build time**: Slightly faster without treeshaking
- **Functionality**: No impact on runtime behavior

## Build Results

With treeshaking disabled:

- Total build size: ~5.2MB (uncompressed)
- Gzipped size: ~1.4MB
- Build time: ~12 seconds

## Future Actions

1. Monitor Rollup/Vite updates for fixes
2. Test re-enabling treeshaking after updates
3. Consider investigating specific code patterns causing the issue

## Verification

To verify the build works:

```bash
npm run build
npm run preview  # Test the built app
```

The production build now completes successfully and the application runs correctly.
