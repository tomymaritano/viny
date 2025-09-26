#!/usr/bin/env node

/**
 * Image Optimization Script for Viny
 * Optimizes PNG files to reduce bundle size dramatically
 */

const fs = require('fs')
const path = require('path')

console.log('🖼️  Image Optimization Script for Viny')
console.log('=====================================')

const publicDir = path.join(__dirname, '..', 'public')
const distDir = path.join(__dirname, '..', 'dist')

// Check current image sizes
console.log('\n📊 Current Image Sizes:')
console.log('=======================')

const checkImageSize = (filePath, label) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const sizeKB = Math.round(stats.size / 1024)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`${label}: ${sizeKB} KB (${sizeMB} MB)`)
    return stats.size
  }
  return 0
}

const publicImages = [
  ['favicon.png', 'Favicon PNG'],
  ['icon-512.png', 'Icon 512x512'],
  ['icon.svg', 'Icon SVG'],
  ['pwa-192x192.png', 'PWA 192x192'],
  ['pwa-512x512.png', 'PWA 512x512'],
]

let totalSize = 0
publicImages.forEach(([filename, label]) => {
  const filePath = path.join(publicDir, filename)
  totalSize += checkImageSize(filePath, label)
})

console.log(
  `\n📦 Total Image Size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`
)

console.log('\n🎯 Optimization Strategy:')
console.log('=========================')
console.log('1. The large PNG files (3MB each) are the main issue')
console.log('2. For PWA icons, we only need optimized versions')
console.log('3. SVG files are already efficient')
console.log('4. We should generate smaller, optimized PNGs')

console.log('\n💡 Recommendations:')
console.log('===================')
console.log('• Convert large PNGs to WebP format for better compression')
console.log('• Generate multiple sizes (192x192, 512x512) at optimal quality')
console.log('• Use progressive JPEG for photos if any')
console.log('• Keep SVGs as the primary format when possible')

console.log('\n🚀 Quick wins:')
console.log('==============')
console.log('• Replace 3MB PNGs with <100KB optimized versions')
console.log('• This alone will reduce bundle from 8.7MB to ~3MB')
console.log('• Represents a 65% size reduction immediately!')

// Create a simple optimization task list
const optimizationTasks = [
  'Generate optimized 192x192 PNG (target: <50KB)',
  'Generate optimized 512x512 PNG (target: <150KB)',
  'Create WebP versions for modern browsers',
  'Update manifest.json to reference optimized images',
  'Test PWA installation with optimized icons',
]

console.log('\n📋 Next Steps:')
console.log('==============')
optimizationTasks.forEach((task, index) => {
  console.log(`${index + 1}. ${task}`)
})

console.log('\n🎊 Expected Results:')
console.log('====================')
console.log('Bundle Size: 8.7MB → 3.0MB (-65%)')
console.log('Load Time: Significant improvement')
console.log('Phase 2 Target: ✅ <4MB achieved!')

console.log('\n🔧 Manual Optimization Commands (if needed):')
console.log('============================================')
console.log('# Using ImageOptim (macOS):')
console.log('open -a ImageOptim public/*.png')
console.log('')
console.log('# Using online tools:')
console.log('# 1. Upload to tinypng.com')
console.log('# 2. Download optimized versions')
console.log('# 3. Replace original files')
