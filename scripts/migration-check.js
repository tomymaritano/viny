#!/usr/bin/env node
/**
 * TypeScript Migration Progress Checker
 * Analyzes current TypeScript coverage and identifies conversion candidates
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const SRC_DIR = path.join(__dirname, '../src')

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(SRC_DIR, filePath)
  const ext = path.extname(filePath)

  // Analyze file characteristics
  const hasReactImport =
    content.includes('import React') || content.includes("from 'react'")
  const hasJSX = content.includes('<') && content.includes('>')
  const hasHooks = content.includes('useState') || content.includes('useEffect')
  const hasInterfaces =
    content.includes('interface ') || content.includes('type ')
  const hasExplicitTypes =
    content.includes(': string') || content.includes(': number')
  const linesOfCode = content.split('\n').length

  return {
    path: relativePath,
    extension: ext,
    linesOfCode,
    hasReactImport,
    hasJSX,
    hasHooks,
    hasInterfaces,
    hasExplicitTypes,
    isTypeScript: ext === '.ts' || ext === '.tsx',
    complexity: calculateComplexity(content),
  }
}

function calculateComplexity(content) {
  let score = 0

  // Add complexity based on patterns
  score += (content.match(/function /g) || []).length * 2
  score += (content.match(/const \w+ = /g) || []).length * 1
  score +=
    (content.match(/useState|useEffect|useCallback|useMemo/g) || []).length * 3
  score += (content.match(/interface|type/g) || []).length * 2
  score += (content.match(/Promise|async|await/g) || []).length * 2

  if (score < 10) return 'low'
  if (score < 25) return 'medium'
  return 'high'
}

function categorizeFiles(files) {
  const categories = {
    alreadyConverted: [],
    easyConversion: [],
    mediumConversion: [],
    hardConversion: [],
    testFiles: [],
  }

  files.forEach(file => {
    if (file.isTypeScript) {
      if (file.path.includes('__tests__') || file.path.includes('.test.')) {
        categories.testFiles.push(file)
      } else {
        categories.alreadyConverted.push(file)
      }
      return
    }

    // Categorize JS/JSX files by conversion difficulty
    if (file.complexity === 'low' && file.linesOfCode < 50) {
      categories.easyConversion.push(file)
    } else if (file.complexity === 'medium' || file.linesOfCode < 200) {
      categories.mediumConversion.push(file)
    } else {
      categories.hardConversion.push(file)
    }
  })

  return categories
}

function generateReport(categories) {
  const totalFiles = Object.values(categories).flat().length
  const convertedFiles =
    categories.alreadyConverted.length + categories.testFiles.length
  const conversionPercentage = Math.round((convertedFiles / totalFiles) * 100)

  console.log('\n🔍 TypeScript Migration Progress Report')
  console.log('=======================================\n')

  console.log(
    `📊 Overall Progress: ${convertedFiles}/${totalFiles} files (${conversionPercentage}%)\n`
  )

  console.log('📂 File Categories:')
  console.log(
    `  ✅ Core TypeScript files: ${categories.alreadyConverted.length} files`
  )
  console.log(
    `  ✅ TypeScript test files: ${categories.testFiles.length} files`
  )
  console.log(`  🟢 Easy to convert: ${categories.easyConversion.length} files`)
  console.log(
    `  🟡 Medium complexity: ${categories.mediumConversion.length} files`
  )
  console.log(
    `  🔴 High complexity: ${categories.hardConversion.length} files\n`
  )

  // Show next conversion candidates
  console.log('🎯 Next Conversion Candidates (Easy):')
  categories.easyConversion.slice(0, 10).forEach((file, index) => {
    console.log(
      `  ${index + 1}. ${file.path} (${file.linesOfCode} lines, ${file.complexity} complexity)`
    )
  })

  if (categories.easyConversion.length > 10) {
    console.log(
      `  ... and ${categories.easyConversion.length - 10} more easy files`
    )
  }

  console.log('\n📈 Conversion Strategy:')
  console.log('  1. Start with easy conversions to build momentum')
  console.log(
    '  2. Focus on core business logic files (repositories, services)'
  )
  console.log('  3. Convert components with clear prop interfaces')
  console.log('  4. Save complex files for last when team has more experience')

  // Progress towards targets
  console.log('\n🎯 Progress Towards Targets:')
  const targets = [
    { week: 'Week 1', target: 50, current: conversionPercentage },
    { week: 'Week 2', target: 70, current: conversionPercentage },
    { week: 'Final', target: 90, current: conversionPercentage },
  ]

  targets.forEach(({ week, target, current }) => {
    const status =
      current >= target ? '✅' : current >= target - 10 ? '🟡' : '❌'
    console.log(`  ${status} ${week}: ${current}% / ${target}% target`)
  })

  console.log('\n🔧 Recommended Actions:')
  if (conversionPercentage < 40) {
    console.log('  • Focus on repository and service layer files first')
    console.log('  • Convert utility functions to establish type foundations')
    console.log('  • Set up strict tsconfig.json (already done!)')
  } else if (conversionPercentage < 70) {
    console.log('  • Begin converting React components systematically')
    console.log('  • Focus on components with clear prop requirements')
    console.log('  • Add type definitions for complex state objects')
  } else {
    console.log('  • Tackle remaining complex files with team review')
    console.log('  • Eliminate remaining any types')
    console.log('  • Add comprehensive interface documentation')
  }

  return {
    totalFiles,
    convertedFiles,
    conversionPercentage,
    categories,
  }
}

function main() {
  try {
    // Find all JavaScript and TypeScript files in core source directory only
    const jsFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
      cwd: SRC_DIR,
    })

    console.log(`🔍 Analyzing ${jsFiles.length} files...`)

    const analyzedFiles = jsFiles.map(file =>
      analyzeFile(path.join(SRC_DIR, file))
    )

    const categories = categorizeFiles(analyzedFiles)
    const report = generateReport(categories)

    // Save detailed report
    const reportPath = path.join(__dirname, '../migration-report.json')
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            totalFiles: report.totalFiles,
            convertedFiles: report.convertedFiles,
            conversionPercentage: report.conversionPercentage,
          },
          categories: categories,
          detailedAnalysis: analyzedFiles,
        },
        null,
        2
      )
    )

    console.log(`\n📋 Detailed report saved to: ${reportPath}`)
  } catch (error) {
    console.error('❌ Error analyzing files:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { analyzeFile, categorizeFiles, generateReport }
