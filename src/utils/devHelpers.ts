import {
  createSettingsRepository,
  createDocumentRepository,
} from '../lib/repositories/RepositoryFactory'
import { resetToDefaultData } from './defaultDataInitializer'
import { useAppStore } from '../stores/newSimpleStore'

/**
 * Development helper functions
 * These are only available in development mode
 */

declare global {
  interface Window {
    devHelpers?: {
      resetToDefaults: () => void
      clearAllData: () => void
      exportData: () => string
      importData: (data: string) => void
      debugNotebooks: () => void
      notebookDiagnostics: () => void
      fixOrphanedNotebooks: () => Promise<void>
      expandAllNotebooks: () => void
    }
  }
}

export function setupDevHelpers(): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Add dev helpers to window for easy access from console
  window.devHelpers = {
    resetToDefaults: () => {
      console.log('🔄 Resetting to default data...')
      resetToDefaultData()
      console.log('✅ Reset complete! Refresh the page to see changes.')
    },

    clearAllData: async () => {
      console.log('🧹 Clearing all data...')
      try {
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()

        await settingsRepo.resetSettings()
        await docRepo.destroy()

        storageService.removeItem(StorageService.KEYS.INITIALIZED)
        console.log('✅ All data cleared! Refresh the page.')
      } catch (error) {
        console.error('❌ Failed to clear data:', error)
      }
    },

    exportData: async () => {
      try {
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()

        const [settings, documents] = await Promise.all([
          settingsRepo.export(),
          docRepo.exportAll(),
        ])

        const data = JSON.stringify(
          { settings: JSON.parse(settings), documents: JSON.parse(documents) },
          null,
          2
        )
        console.log('📤 Current data:', data)
        return data
      } catch (error) {
        console.error('❌ Failed to export data:', error)
        return '{}'
      }
    },

    importData: async (data: string) => {
      console.log('📥 Importing data...')
      try {
        const parsedData = JSON.parse(data)
        const settingsRepo = createSettingsRepository()
        const docRepo = createDocumentRepository()

        if (parsedData.settings) {
          await settingsRepo.import(JSON.stringify(parsedData.settings))
        }

        if (parsedData.documents) {
          await docRepo.importAll(JSON.stringify(parsedData.documents))
        }

        console.log('✅ Data imported! Refresh the page.')
      } catch (error) {
        console.error('❌ Failed to import data:', error)
      }
    },

    debugNotebooks: () => {
      const state = useAppStore.getState()

      console.log('=== NOTEBOOK DEBUG ===')
      console.log('Notebooks (tree):', state.notebooks)
      console.log('Flat notebooks:', state.flatNotebooks)
      console.log('Loading:', state.loading)
      console.log('Error:', state.error)
      console.log('Initialized:', state.initialized)

      // Try to load notebooks manually
      console.log('Loading notebooks manually...')
      state.loadNotebooks().then(() => {
        const newState = useAppStore.getState()
        console.log('After manual load:')
        console.log('Notebooks (tree):', newState.notebooks)
        console.log('Flat notebooks:', newState.flatNotebooks)
      })
    },

    notebookDiagnostics: () => {
      const state = useAppStore.getState()
      const notebooks = state.flatNotebooks || []
      
      console.log('📊 NOTEBOOK DIAGNOSTICS')
      console.log('=======================')
      console.log(`Total notebooks: ${notebooks.length}`)
      console.log(`Root notebooks: ${notebooks.filter(nb => !nb.parentId).length}`)
      console.log(`Child notebooks: ${notebooks.filter(nb => nb.parentId).length}`)
      
      // Check for orphaned notebooks
      const orphaned = notebooks.filter(nb => {
        if (!nb.parentId) return false
        return !notebooks.find(parent => parent.id === nb.parentId)
      })
      
      if (orphaned.length > 0) {
        console.warn(`⚠️ Found ${orphaned.length} orphaned notebooks:`)
        orphaned.forEach(nb => {
          console.warn(`  - "${nb.name}" (parent: ${nb.parentId})`)
        })
      } else {
        console.log('✅ No orphaned notebooks found')
      }
      
      // Show notebook tree structure
      console.log('\n📁 Notebook Tree Structure:')
      const printTree = (parentId = null, indent = '') => {
        const children = notebooks.filter(nb => nb.parentId === parentId)
        children.forEach((nb, index) => {
          const isLast = index === children.length - 1
          console.log(`${indent}${isLast ? '└── ' : '├── '}${nb.name} (${nb.id})`)
          printTree(nb.id, indent + (isLast ? '    ' : '│   '))
        })
      }
      printTree()
      
      // Check expanded state
      console.log('\n📂 Expanded State:')
      console.log('Expanded notebooks:', Array.from(state.expandedNotebooks || []))
    },

    fixOrphanedNotebooks: async () => {
      const state = useAppStore.getState()
      const notebooks = state.flatNotebooks || []
      
      const orphaned = notebooks.filter(nb => {
        if (!nb.parentId) return false
        return !notebooks.find(parent => parent.id === nb.parentId)
      })
      
      if (orphaned.length === 0) {
        console.log('✅ No orphaned notebooks to fix')
        return
      }
      
      console.log(`🔧 Fixing ${orphaned.length} orphaned notebooks...`)
      
      for (const notebook of orphaned) {
        console.log(`  Converting "${notebook.name}" to root notebook`)
        const updated = { ...notebook, parentId: null }
        await state.updateNotebook(updated)
      }
      
      console.log('✅ Fixed all orphaned notebooks!')
      await state.refreshNotebooks()
    },

    expandAllNotebooks: () => {
      const state = useAppStore.getState()
      const notebooks = state.flatNotebooks || []
      
      console.log(`📂 Expanding all ${notebooks.length} notebooks...`)
      console.log('Note: This feature requires manual expansion in the UI.')
      console.log('Notebooks to expand:')
      notebooks.forEach(nb => {
        if (nb.children && nb.children.length > 0) {
          console.log(`  - ${nb.name} (has ${nb.children.length} children)`)
        }
      })
    },
    
    generateFullReport: () => {
      const state = useAppStore.getState()
      const { flatNotebooks, notebooks: treeNotebooks, notes } = state
      
      console.group('🏥 COMPREHENSIVE NOTEBOOK ECOSYSTEM REPORT')
      
      // 1. Storage Layer
      console.group('📦 1. STORAGE LAYER')
      console.log(`Total notebooks in storage: ${flatNotebooks.length}`)
      console.table(flatNotebooks.map(nb => ({
        id: nb.id,
        name: nb.name,
        parentId: nb.parentId || 'ROOT',
        children: nb.children?.length || 0,
        path: nb.path
      })))
      console.groupEnd()
      
      // 2. Tree Structure
      console.group('🌳 2. TREE STRUCTURE')
      console.log(`Root notebooks: ${treeNotebooks.filter(nb => !nb.parentId).length}`)
      const printTree = (notebooks: any[], indent = '') => {
        notebooks.forEach(nb => {
          console.log(`${indent}${nb.name} (${nb.id})`)
          if (nb.children?.length > 0) {
            const childNotebooks = flatNotebooks.filter(n => 
              nb.children.includes(n.id)
            )
            printTree(childNotebooks, indent + '  ')
          }
        })
      }
      printTree(treeNotebooks.filter(nb => !nb.parentId))
      console.groupEnd()
      
      // 3. Notes Distribution
      console.group('📝 3. NOTES DISTRIBUTION')
      const notesPerNotebook = {}
      notes.forEach(note => {
        const nb = note.notebook || 'None'
        notesPerNotebook[nb] = (notesPerNotebook[nb] || 0) + 1
      })
      console.table(notesPerNotebook)
      console.groupEnd()
      
      // 4. Issues Detected
      console.group('⚠️ 4. ISSUES DETECTED')
      
      // Orphaned notebooks
      const orphaned = flatNotebooks.filter(nb => 
        nb.parentId && !flatNotebooks.find(p => p.id === nb.parentId)
      )
      if (orphaned.length > 0) {
        console.warn(`Found ${orphaned.length} orphaned notebooks:`)
        orphaned.forEach(nb => console.warn(`  - ${nb.name} (parent: ${nb.parentId})`))
      }
      
      // Missing notebook references in notes
      const missingNotebooks = new Set()
      notes.forEach(note => {
        if (note.notebook && !flatNotebooks.find(nb => nb.name === note.notebook)) {
          missingNotebooks.add(note.notebook)
        }
      })
      if (missingNotebooks.size > 0) {
        console.warn(`Found ${missingNotebooks.size} missing notebook references:`)
        missingNotebooks.forEach(nb => console.warn(`  - ${nb}`))
      }
      
      // Circular references
      const hasCircularRef = (nbId: string, visited = new Set()) => {
        if (visited.has(nbId)) return true
        visited.add(nbId)
        const nb = flatNotebooks.find(n => n.id === nbId)
        if (nb?.parentId) {
          return hasCircularRef(nb.parentId, visited)
        }
        return false
      }
      const circular = flatNotebooks.filter(nb => hasCircularRef(nb.id))
      if (circular.length > 0) {
        console.warn(`Found ${circular.length} notebooks with circular references`)
      }
      
      console.groupEnd()
      
      // 5. Recommendations
      console.group('💡 5. RECOMMENDATIONS')
      if (orphaned.length > 0) {
        console.log('Run devHelpers.fixOrphanedNotebooks() to fix orphaned notebooks')
      }
      if (treeNotebooks.filter(nb => !nb.parentId).length === 0) {
        console.log('No root notebooks found! All notebooks might be orphaned.')
      }
      console.groupEnd()
      
      console.groupEnd()
    },
  }

  console.log(`
🛠️  Development helpers available:

• devHelpers.resetToDefaults() - Reset to default notes and notebooks
• devHelpers.clearAllData() - Clear all data completely
• devHelpers.exportData() - Export current data
• devHelpers.importData(data) - Import data
• devHelpers.debugNotebooks() - Debug notebook state

📚 Notebook Diagnostics:
• devHelpers.notebookDiagnostics() - Show detailed notebook analysis
• devHelpers.fixOrphanedNotebooks() - Fix notebooks with missing parents
• devHelpers.expandAllNotebooks() - Expand all notebooks in sidebar
• devHelpers.generateFullReport() - Generate comprehensive ecosystem report

🆕 Quick Commands:
• devHelpers.generateFullReport() - RUN THIS to see complete notebook ecosystem

These are only available in development mode.
  `)
}
