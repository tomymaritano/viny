import { Note, Notebook } from '@/types'
#!/usr/bin/env node
/**
 * TypeScript File Conversion Utility
 * Helps convert individual JavaScript files to TypeScript with proper types
 */

const fs = require('fs')
const path = require('path')

function convertFileToTypeScript(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  const ext = path.extname(filePath)
  const baseName = path.basename(filePath, ext)
  const dirName = path.dirname(filePath)
  
  // Determine new extension
  const newExt = ext === '.jsx' ? '.tsx' : '.ts'
  const newFilePath = path.join(dirName, baseName + newExt)
  
  // Create backup
  const backupPath = filePath + '.backup'
  fs.copyFileSync(filePath, backupPath)
  
  console.log(`🔄 Converting ${filePath} to TypeScript...`)
  
  try {
    // Apply basic TypeScript transformations
    let newContent = content
    
    // Add React import for TypeScript if JSX is present
    if (newExt === '.tsx' && !content.includes('import React')) {
      newContent = `import React from 'react'\n${newContent}`
    }
    
    // Add type imports if needed
    if (!content.includes('from \'@/types\'') && !content.includes('from \'../types\'')) {
      const hasNoteUsage = content.includes('note') || content.includes('Note')
      const hasNotebookUsage = content.includes('notebook') || content.includes('Notebook')
      
      if (hasNoteUsage || hasNotebookUsage) {
        const importPath = getRelativeTypesPath(filePath)
        const types = []
        if (hasNoteUsage) types.push('Note')
        if (hasNotebookUsage) types.push('Notebook')
        
        if (types.length > 0) {
          newContent = `import { ${types.join(', ')} } from '${importPath}'\n${newContent}`
        }
      }
    }
    
    // Add basic type annotations for common patterns
    newContent = addBasicTypeAnnotations(newContent)
    
    // Write the new TypeScript file
    fs.writeFileSync(newFilePath, newContent)
    
    // Remove the original file
    fs.unlinkSync(filePath)
    
    console.log(`✅ Successfully converted to ${newFilePath}`)
    console.log(`📝 Backup created at ${backupPath}`)
    
    // Check for TypeScript errors
    console.log('\n🔍 Checking for TypeScript errors...')
    const { exec } = require('child_process')
    
    exec(`npx tsc --noEmit ${newFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ TypeScript errors found:')
        console.log(stderr)
        console.log('\n💡 Manual fixes needed:')
        console.log('  1. Add proper type annotations for function parameters')
        console.log('  2. Define interfaces for component props')
        console.log('  3. Add return types for functions')
        console.log('  4. Handle potential null/undefined values')
      } else {
        console.log('✅ No TypeScript errors detected!')
        
        // Remove backup if successful
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath)
          console.log('🗑️  Backup removed - conversion successful')
        }
      }
    })
    
  } catch (error) {
    // Restore from backup if conversion failed
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath)
      fs.unlinkSync(backupPath)
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath)
      }
    }
    
    throw new Error(`Conversion failed: ${error.message}`)
  }
}

function getRelativeTypesPath(filePath) {
  const srcIndex = filePath.indexOf('/src/')
  if (srcIndex === -1) return '@/types'
  
  const relativePath = filePath.substring(srcIndex + 5) // Remove '/src/'
  const depth = (relativePath.match(/\//g) || []).length
  
  return '../'.repeat(depth) + 'types'
}

function addBasicTypeAnnotations(content) {
  let result = content
  
  // Add type annotations for useState hooks
  result = result.replace(
    /const \[(\w+), set\w+\] = useState\(([^)]+)\)/g,
    (match, stateName, initialValue) => {
      let type = 'unknown'
      
      if (initialValue === 'true' || initialValue === 'false') {
        type = 'boolean'
      } else if (initialValue === 'null') {
        type = 'any | null'
      } else if (initialValue === '\'\'') {
        type = 'string'
      } else if (initialValue === '0') {
        type = 'number'
      } else if (initialValue === '[]') {
        type = 'any[]'
      } else if (initialValue === '{}') {
        type = 'Record<string, any>'
      }
      
      return `const [${stateName}, set${capitalize(stateName)}] = useState<${type}>(${initialValue})`
    }
  )
  
  // Add React.FC for functional components if they have props
  result = result.replace(
    /const (\w+) = \(\{([^}]+)\}\) => \{/g,
    (match, componentName, props) => {
      return `interface ${componentName}Props {\n  ${props.split(',').map(prop => prop.trim() + ': any').join('\n  ')}\n}\n\nconst ${componentName}: React.FC<${componentName}Props> = ({${props}}) => {`
    }
  )
  
  // Add type annotations for event handlers
  result = result.replace(
    /const (\w+) = \((\w+)\) => \{/g,
    (match, handlerName, param) => {
      if (param === 'event' || param === 'e') {
        return `const ${handlerName} = (${param}: React.ChangeEvent<HTMLInputElement>) => {`
      }
      return match
    }
  )
  
  return result
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function printUsage() {
  console.log('TypeScript File Converter')
  console.log('========================')
  console.log('')
  console.log('Usage:')
  console.log('  node scripts/convert-file.js <file-path>')
  console.log('')
  console.log('Examples:')
  console.log('  node scripts/convert-file.js src/components/NoteList.jsx')
  console.log('  node scripts/convert-file.js src/hooks/useNotes.js')
  console.log('')
  console.log('This tool will:')
  console.log('  1. Create a backup of the original file')
  console.log('  2. Convert the file extension (.js → .ts, .jsx → .tsx)')
  console.log('  3. Add basic type annotations')
  console.log('  4. Add necessary imports')
  console.log('  5. Check for TypeScript errors')
  console.log('  6. Remove backup if successful')
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage()
    return
  }
  
  const filePath = args[0]
  
  try {
    convertFileToTypeScript(filePath)
  } catch (error) {
    console.error('❌ Conversion failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { convertFileToTypeScript, addBasicTypeAnnotations }