import { create } from 'zustand'
import type { SettingsSlice } from '../settingsSlice'
import { createSettingsSlice } from '../settingsSlice'
import { defaultAppSettings } from '../../../types/settings'

// Mock the entire storage service module to avoid PouchDB initialization
jest.mock('../../../lib/storageService', () => ({
  storageService: {
    saveSettings: jest.fn(),
    getTagColors: jest.fn(() => ({})),
    saveTagColors: jest.fn(),
    loadTagColors: jest.fn(() => Promise.resolve({})),
  },
}))

// Mock documentStore to prevent PouchDB initialization
jest.mock('../../../lib/documentStore', () => ({
  documentStore: {},
}))

// Mock logger
jest.mock('../../../utils/logger', () => ({
  storageLogger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('SettingsSlice - Consolidated Theme Management', () => {
  let store: ReturnType<typeof create<SettingsSlice>>

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)

    store = create<SettingsSlice>()(createSettingsSlice)
  })

  describe('Theme Management', () => {
    it('should initialize with default settings including theme', () => {
      const state = store.getState()
      expect(state.settings.theme).toBe(defaultAppSettings.theme)
    })

    it('should update theme correctly via setTheme', () => {
      const { setTheme } = store.getState()

      setTheme('light')

      const state = store.getState()
      expect(state.settings.theme).toBe('light')
    })

    it('should update theme correctly via updateSettings', () => {
      const { updateSettings } = store.getState()

      updateSettings({ theme: 'dark' })

      const state = store.getState()
      expect(state.settings.theme).toBe('dark')
    })

    it('should persist theme changes through storage service', () => {
      const { storageService } = require('../../../lib/storageService')
      const { setTheme } = store.getState()

      setTheme('solarized')

      expect(storageService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'solarized' })
      )
    })
  })

  describe('Tag Color Management', () => {
    it('should set tag colors correctly', () => {
      const { setTagColor } = store.getState()

      setTagColor('work', 'blue')

      const state = store.getState()
      expect(state.settings.tagColors).toEqual({ work: 'blue' })
    })

    it('should get predefined tag colors', () => {
      const { getTagColor } = store.getState()

      const color = getTagColor('project')

      expect(color).toBe('ocean') // Predefined color for 'project'
    })

    it('should generate consistent hash colors for unknown tags', () => {
      const { getTagColor } = store.getState()

      const color1 = getTagColor('unknown-tag')
      const color2 = getTagColor('unknown-tag')

      expect(color1).toBe(color2) // Should be consistent
      expect(color1).toBeTruthy() // Should return a valid color
    })

    it('should reset tag colors', () => {
      const { setTagColor, resetTagColors } = store.getState()

      // Set some colors first
      setTagColor('tag1', 'red')
      setTagColor('tag2', 'blue')

      // Reset
      resetTagColors()

      const state = store.getState()
      expect(state.settings.tagColors).toEqual({})
    })
  })

  describe('Settings Persistence', () => {
    it('should handle storage failures gracefully in setTheme', () => {
      const { storageService } = require('../../../lib/storageService')
      storageService.saveSettings.mockImplementationOnce(() => {
        throw new Error('Storage failed')
      })

      const { setTheme } = store.getState()

      // Should not throw
      expect(() => setTheme('light')).not.toThrow()

      // Theme should still be updated in state
      const state = store.getState()
      expect(state.settings.theme).toBe('light')

      // Should fallback to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'viny-settings',
        expect.stringContaining('"theme":"light"')
      )
    })

    it('should update multiple settings at once', () => {
      const { updateSettings } = store.getState()

      updateSettings({
        theme: 'dark',
        fontSize: 16,
        wordWrap: false,
      })

      const state = store.getState()
      expect(state.settings.theme).toBe('dark')
      expect(state.settings.fontSize).toBe(16)
      expect(state.settings.wordWrap).toBe(false)
    })
  })
})
