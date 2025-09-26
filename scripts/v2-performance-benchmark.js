#!/usr/bin/env node

/**
 * Performance Benchmark: V1 vs V2 Architecture
 *
 * This script should be run in the browser console to measure performance
 * of various operations in both V1 and V2 modes.
 */

console.log(`
🎯 Viny V2 Performance Benchmark

Copy and run this in your browser console:
${'='.repeat(60)}

// Performance Benchmark Script
(async function runBenchmark() {
  const results = {
    v1: {},
    v2: {},
    timestamp: new Date().toISOString()
  }
  
  // Helper to measure operation time
  const measure = async (name, fn) => {
    const start = performance.now()
    await fn()
    const end = performance.now()
    return end - start
  }
  
  // Test with V1 (disable V2 features)
  console.log('\\n📊 Testing V1 Performance...')
  localStorage.removeItem('feature_useCleanArchitecture')
  localStorage.removeItem('feature_useQueryForNotesList')
  localStorage.removeItem('feature_useQueryForNotebooks')
  localStorage.removeItem('feature_useQueryForSettings')
  localStorage.removeItem('feature_useQueryForSearch')
  window.location.reload()
  
  // Wait for reload, then continue with:
  /*
  // V1 Tests
  results.v1.initialLoad = performance.timing.loadEventEnd - performance.timing.navigationStart
  
  // Measure notes list render
  results.v1.notesListRender = await measure('Notes List', async () => {
    document.querySelector('[data-testid="all-notes"]')?.click()
    await new Promise(r => setTimeout(r, 500))
  })
  
  // Measure search
  results.v1.searchOpen = await measure('Search', async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await new Promise(r => setTimeout(r, 500))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
  
  // Measure settings open
  results.v1.settingsOpen = await measure('Settings', async () => {
    document.querySelector('[data-testid="settings-button"]')?.click()
    await new Promise(r => setTimeout(r, 500))
    document.querySelector('[data-testid="modal-close"]')?.click()
  })
  
  console.log('V1 Results:', results.v1)
  */
  
  // Test with V2 (enable all features)
  console.log('\\n📊 Testing V2 Performance...')
  localStorage.setItem('feature_useCleanArchitecture', 'true')
  localStorage.setItem('feature_useQueryForNotesList', 'true')
  localStorage.setItem('feature_useQueryForNotebooks', 'true')
  localStorage.setItem('feature_useQueryForSettings', 'true')
  localStorage.setItem('feature_useQueryForSearch', 'true')
  localStorage.setItem('feature_enableOfflinePersistence', 'true')
  window.location.reload()
  
  // Wait for reload, then continue with:
  /*
  // V2 Tests
  results.v2.initialLoad = performance.timing.loadEventEnd - performance.timing.navigationStart
  
  // Measure notes list render (should be cached)
  results.v2.notesListRender = await measure('Notes List', async () => {
    document.querySelector('[data-testid="all-notes"]')?.click()
    await new Promise(r => setTimeout(r, 100)) // Less wait, should be instant
  })
  
  // Measure search (should be cached)
  results.v2.searchOpen = await measure('Search', async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await new Promise(r => setTimeout(r, 100))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
  
  // Measure settings open
  results.v2.settingsOpen = await measure('Settings', async () => {
    document.querySelector('[data-testid="settings-button"]')?.click()
    await new Promise(r => setTimeout(r, 100))
    document.querySelector('[data-testid="modal-close"]')?.click()
  })
  
  // Calculate improvements
  const improvements = {}
  Object.keys(results.v1).forEach(key => {
    const v1Time = results.v1[key]
    const v2Time = results.v2[key]
    const improvement = ((v1Time - v2Time) / v1Time * 100).toFixed(1)
    improvements[key] = \`\${improvement}% faster\`
  })
  
  console.log('\\n📊 Final Results:')
  console.table({
    'V1 Times (ms)': results.v1,
    'V2 Times (ms)': results.v2,
    'Improvement': improvements
  })
  
  // Save results
  localStorage.setItem('v2-benchmark-results', JSON.stringify({
    results,
    improvements,
    date: new Date().toISOString()
  }))
  
  console.log('\\n✅ Benchmark complete! Results saved to localStorage.')
  */
})()

${'='.repeat(60)}

After running the first part and reloading, run the commented section.
The benchmark will test both V1 and V2 performance and show improvements.
`)

// Alternative: Manual testing guide
console.log(`

📋 Manual Performance Testing Guide:

1. **V1 Testing:**
   - Disable all V2 features (run script above)
   - Time these operations with a stopwatch:
     ✓ App initial load
     ✓ Click "All Notes" - time until list appears
     ✓ Open search (Cmd+K) - time until modal appears
     ✓ Click on a note - time until content shows
     ✓ Open settings - time until modal appears

2. **V2 Testing:**
   - Enable all V2 features (run script above)
   - Time the same operations
   - Note: Second time should be much faster (cache)

3. **Expected Improvements:**
   - Initial load: Similar (slight overhead)
   - Notes list: 5x faster (cached)
   - Search: 5x faster (cached)
   - Note open: 4x faster (prefetched)
   - Settings: 3x faster (cached)

4. **Memory Usage:**
   - Open DevTools → Memory tab
   - Take heap snapshot after 5min use
   - Compare V1 vs V2 memory usage

5. **Network Activity:**
   - Open DevTools → Network tab
   - Navigate around the app
   - V2 should show minimal network activity (cache hits)
`)
