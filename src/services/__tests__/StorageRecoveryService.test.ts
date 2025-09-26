/**
 * Comprehensive tests for StorageRecoveryService
 * Tests storage corruption detection, backup creation, and data recovery
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { StorageRecoveryService } from '../StorageRecoveryService'

// Mock file system operations
const mockFS = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
  stat: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
}

// Mock crypto for checksum calculation
const mockCrypto = {
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mockedchecksum123'),
  })),
}

// Setup global mocks
Object.defineProperty(global, 'crypto', {
  value: { subtle: mockCrypto },
  writable: true,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('StorageRecoveryService', () => {
  let service: StorageRecoveryService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new StorageRecoveryService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(service).toBeDefined()
      expect(service.getConfiguration()).toHaveProperty('maxBackups')
      expect(service.getConfiguration()).toHaveProperty('backupInterval')
      expect(service.getConfiguration()).toHaveProperty('compressionEnabled')
    })

    it('should accept custom configuration', () => {
      const customConfig = {
        maxBackups: 10,
        backupInterval: 60000,
        compressionEnabled: true,
        checksumValidation: true,
      }

      const customService = new StorageRecoveryService(customConfig)
      expect(customService.getConfiguration().maxBackups).toBe(10)
      expect(customService.getConfiguration().backupInterval).toBe(60000)
    })
  })

  describe('Corruption Detection', () => {
    it('should detect JSON corruption', async () => {
      const corruptedData = '{"invalid": json data[}'
      mockLocalStorage.getItem.mockReturnValue(corruptedData)

      const isCorrupted = await service.detectStorageCorruption('notes')
      expect(isCorrupted).toBe(true)
    })

    it('should detect valid JSON as not corrupted', async () => {
      const validData = '{"valid": "json data"}'
      mockLocalStorage.getItem.mockReturnValue(validData)

      const isCorrupted = await service.detectStorageCorruption('notes')
      expect(isCorrupted).toBe(false)
    })

    it('should detect missing data as corruption', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const isCorrupted = await service.detectStorageCorruption('notes')
      expect(isCorrupted).toBe(true)
    })

    it('should validate data structure integrity', async () => {
      const dataWithMissingFields = '{"notes": [{"title": "Test"}]}' // Missing required fields
      mockLocalStorage.getItem.mockReturnValue(dataWithMissingFields)

      const isCorrupted = await service.detectStorageCorruption('notes', {
        validateStructure: true,
        requiredFields: ['id', 'title', 'content'],
      })
      expect(isCorrupted).toBe(true)
    })

    it('should validate checksum integrity', async () => {
      const data =
        '{"notes": [{"id": "1", "title": "Test", "content": "Content"}]}'
      const invalidChecksum = 'invalid_checksum'

      mockLocalStorage.getItem.mockReturnValueOnce(data)
      mockLocalStorage.getItem.mockReturnValueOnce(invalidChecksum)

      const isCorrupted = await service.detectStorageCorruption('notes', {
        validateChecksum: true,
      })
      expect(isCorrupted).toBe(true)
    })

    it('should handle storage access errors', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })

      const isCorrupted = await service.detectStorageCorruption('notes')
      expect(isCorrupted).toBe(true)
    })
  })

  describe('Backup Creation', () => {
    it('should create backup of valid data', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)
      mockLocalStorage.setItem.mockImplementation(() => {})

      const backupCreated = await service.createBackup('notes')
      expect(backupCreated).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should generate backup with timestamp', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)
      mockLocalStorage.setItem.mockImplementation(() => {})

      await service.createBackup('notes')

      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      expect(setItemCall[0]).toMatch(/backup_notes_\d{13}/) // Timestamp format
    })

    it('should include checksum in backup', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)
      mockLocalStorage.setItem.mockImplementation(() => {})

      await service.createBackup('notes', { includeChecksum: true })

      const setItemCalls = mockLocalStorage.setItem.mock.calls
      expect(setItemCalls).toHaveLength(2) // Data + checksum
      expect(setItemCalls[1][0]).toMatch(/backup_notes_\d{13}_checksum/)
    })

    it('should compress backup data when enabled', async () => {
      const largeData =
        '{"notes": [' +
        Array(1000)
          .fill(0)
          .map(
            (_, i) =>
              `{"id": "${i}", "title": "Test ${i}", "content": "Content ${i}"}`
          )
          .join(',') +
        ']}'

      mockLocalStorage.getItem.mockReturnValue(largeData)
      mockLocalStorage.setItem.mockImplementation(() => {})

      await service.createBackup('notes', { compress: true })

      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      const backupData = setItemCall[1]

      // Compressed data should be smaller
      expect(backupData.length).toBeLessThan(largeData.length)
    })

    it('should limit number of backups', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)
      mockLocalStorage.setItem.mockImplementation(() => {})

      // Mock existing backups
      const existingBackups = [
        'backup_notes_1000000001',
        'backup_notes_1000000002',
        'backup_notes_1000000003',
        'backup_notes_1000000004',
        'backup_notes_1000000005',
      ]

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(existingBackups)
        }
        return validData
      })

      await service.createBackup('notes')

      // Should clean up old backups
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })

    it('should handle backup creation errors', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const backupCreated = await service.createBackup('notes')
      expect(backupCreated).toBe(false)
    })
  })

  describe('Data Recovery', () => {
    it('should recover data from most recent backup', async () => {
      const backupData = '{"notes": [{"id": "1", "title": "Recovered"}]}'
      const backupKeys = ['backup_notes_1000000001', 'backup_notes_1000000002']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000002') {
          return backupData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      const recovered = await service.recoverFromBackup('notes')
      expect(recovered).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notes', backupData)
    })

    it('should validate backup integrity before recovery', async () => {
      const corruptedBackup = '{"invalid": json}'
      const validBackup = '{"notes": [{"id": "1", "title": "Valid"}]}'
      const backupKeys = ['backup_notes_1000000001', 'backup_notes_1000000002']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000002') {
          return corruptedBackup
        }
        if (key === 'backup_notes_1000000001') {
          return validBackup
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      const recovered = await service.recoverFromBackup('notes')
      expect(recovered).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'notes',
        validBackup
      )
    })

    it('should verify checksum if available', async () => {
      const backupData = '{"notes": [{"id": "1", "title": "Test"}]}'
      const validChecksum = 'mockedchecksum123'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return backupData
        }
        if (key === 'backup_notes_1000000001_checksum') {
          return validChecksum
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      const recovered = await service.recoverFromBackup('notes')
      expect(recovered).toBe(true)
    })

    it('should handle decompression during recovery', async () => {
      const compressedData = 'compressed_backup_data'
      const decompressedData =
        '{"notes": [{"id": "1", "title": "Decompressed"}]}'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return compressedData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      // Mock decompression
      const decompressSpy = vi.spyOn(service, 'decompress' as any)
      decompressSpy.mockReturnValue(decompressedData)

      const recovered = await service.recoverFromBackup('notes', {
        decompress: true,
      })
      expect(recovered).toBe(true)
      expect(decompressSpy).toHaveBeenCalled()
    })

    it('should fail recovery when no valid backups exist', async () => {
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify([])
        }
        return null
      })

      const recovered = await service.recoverFromBackup('notes')
      expect(recovered).toBe(false)
    })

    it('should handle recovery errors gracefully', async () => {
      const backupData = '{"notes": [{"id": "1", "title": "Test"}]}'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return backupData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage write error')
      })

      const recovered = await service.recoverFromBackup('notes')
      expect(recovered).toBe(false)
    })
  })

  describe('Automated Recovery', () => {
    it('should automatically recover from detected corruption', async () => {
      const corruptedData = '{"invalid": json}'
      const backupData = '{"notes": [{"id": "1", "title": "Auto-recovered"}]}'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'notes') {
          return corruptedData
        }
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return backupData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      const recovered = await service.performAutomaticRecovery('notes')
      expect(recovered).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('notes', backupData)
    })

    it('should create backup before recovery', async () => {
      const corruptedData = '{"invalid": json}'
      const backupData = '{"notes": [{"id": "1", "title": "Recovered"}]}'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'notes') {
          return corruptedData
        }
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return backupData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      const recovered = await service.performAutomaticRecovery('notes', {
        createBackupBeforeRecovery: true,
      })
      expect(recovered).toBe(true)

      // Should create backup of corrupted data for investigation
      const setItemCalls = mockLocalStorage.setItem.mock.calls
      expect(
        setItemCalls.some(call => call[0].includes('corrupted_backup'))
      ).toBe(true)
    })

    it('should skip recovery if data is not corrupted', async () => {
      const validData = '{"notes": [{"id": "1", "title": "Valid"}]}'
      mockLocalStorage.getItem.mockReturnValue(validData)

      const recovered = await service.performAutomaticRecovery('notes')
      expect(recovered).toBe(true) // Returns true for no action needed
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Backup Management', () => {
    it('should list available backups', async () => {
      const backupKeys = [
        'backup_notes_1000000001',
        'backup_notes_1000000002',
        'backup_notes_1000000003',
      ]

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        return null
      })

      const backups = await service.listBackups('notes')
      expect(backups).toHaveLength(3)
      expect(backups[0]).toHaveProperty('timestamp')
      expect(backups[0]).toHaveProperty('key')
      expect(backups[0]).toHaveProperty('size')
    })

    it('should clean up old backups', async () => {
      const backupKeys = [
        'backup_notes_1000000001',
        'backup_notes_1000000002',
        'backup_notes_1000000003',
        'backup_notes_1000000004',
        'backup_notes_1000000005',
        'backup_notes_1000000006',
      ]

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        return '{"data": "test"}'
      })

      mockLocalStorage.removeItem.mockImplementation(() => {})

      const cleaned = await service.cleanupOldBackups('notes', 3)
      expect(cleaned).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(6) // 3 old backups + 3 checksums
    })

    it('should calculate backup storage usage', async () => {
      const backupKeys = ['backup_notes_1000000001', 'backup_notes_1000000002']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        return '{"data": "test backup data"}'
      })

      const usage = await service.getBackupStorageUsage('notes')
      expect(usage).toHaveProperty('totalSize')
      expect(usage).toHaveProperty('backupCount')
      expect(usage).toHaveProperty('averageSize')
      expect(usage.backupCount).toBe(2)
    })
  })

  describe('Data Validation', () => {
    it('should validate data structure', () => {
      const validData = {
        notes: [
          {
            id: '1',
            title: 'Test',
            content: 'Content',
            createdAt: '2023-01-01',
          },
        ],
      }

      const isValid = service.validateDataStructure(validData, 'notes', {
        requiredFields: ['id', 'title', 'content'],
        optionalFields: ['createdAt', 'updatedAt'],
      })

      expect(isValid).toBe(true)
    })

    it('should detect missing required fields', () => {
      const invalidData = {
        notes: [
          { id: '1', title: 'Test' }, // Missing content
        ],
      }

      const isValid = service.validateDataStructure(invalidData, 'notes', {
        requiredFields: ['id', 'title', 'content'],
      })

      expect(isValid).toBe(false)
    })

    it('should validate data types', () => {
      const invalidData = {
        notes: [
          { id: 123, title: 'Test', content: 'Content' }, // id should be string
        ],
      }

      const isValid = service.validateDataStructure(invalidData, 'notes', {
        requiredFields: ['id', 'title', 'content'],
        fieldTypes: { id: 'string', title: 'string', content: 'string' },
      })

      expect(isValid).toBe(false)
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = {
        notes: Array(10000)
          .fill(0)
          .map((_, i) => ({
            id: `${i}`,
            title: `Note ${i}`,
            content: `Content for note ${i}`,
            createdAt: new Date().toISOString(),
          })),
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeData))
      mockLocalStorage.setItem.mockImplementation(() => {})

      const startTime = performance.now()
      const backupCreated = await service.createBackup('notes')
      const endTime = performance.now()

      expect(backupCreated).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should handle concurrent backup operations', async () => {
      const data = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(data)
      mockLocalStorage.setItem.mockImplementation(() => {})

      const concurrentBackups = [
        service.createBackup('notes'),
        service.createBackup('settings'),
        service.createBackup('templates'),
      ]

      const results = await Promise.all(concurrentBackups)
      expect(results.every(result => result === true)).toBe(true)
    })

    it('should handle storage quota exceeded errors', async () => {
      const data = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(data)
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const backupCreated = await service.createBackup('notes')
      expect(backupCreated).toBe(false)
    })
  })

  describe('Monitoring and Metrics', () => {
    it('should track recovery metrics', async () => {
      const metrics = service.getRecoveryMetrics()

      expect(metrics).toHaveProperty('totalRecoveries')
      expect(metrics).toHaveProperty('successfulRecoveries')
      expect(metrics).toHaveProperty('failedRecoveries')
      expect(metrics).toHaveProperty('averageRecoveryTime')
      expect(metrics).toHaveProperty('lastRecoveryTime')
    })

    it('should update metrics on successful recovery', async () => {
      const backupData = '{"notes": [{"id": "1", "title": "Recovered"}]}'
      const backupKeys = ['backup_notes_1000000001']

      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'backup_keys_notes') {
          return JSON.stringify(backupKeys)
        }
        if (key === 'backup_notes_1000000001') {
          return backupData
        }
        return null
      })

      mockLocalStorage.setItem.mockImplementation(() => {})

      await service.recoverFromBackup('notes')

      const metrics = service.getRecoveryMetrics()
      expect(metrics.totalRecoveries).toBe(1)
      expect(metrics.successfulRecoveries).toBe(1)
    })

    it('should track backup creation metrics', async () => {
      const data = '{"notes": [{"id": "1", "title": "Test"}]}'
      mockLocalStorage.getItem.mockReturnValue(data)
      mockLocalStorage.setItem.mockImplementation(() => {})

      await service.createBackup('notes')

      const metrics = service.getBackupMetrics()
      expect(metrics.totalBackups).toBe(1)
      expect(metrics.successfulBackups).toBe(1)
    })
  })
})
