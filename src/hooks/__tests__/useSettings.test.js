import { renderHook, act } from '@testing-library/react'
import { useSettings } from '../useSettings'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSettings Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should return default settings', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useSettings())

    expect(result.current.settings).toEqual({
      theme: 'solarized-dark',
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      showLineNumbers: true,
      wordWrap: true,
      vimMode: false,
      autoSave: true,
      autoSaveDelay: 2000,
    })
  })

  it('should load settings from localStorage', () => {
    const savedSettings = {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'Monaco',
      showLineNumbers: false,
      wordWrap: false,
      vimMode: true,
      autoSave: false,
      autoSaveDelay: 1000,
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings))

    const { result } = renderHook(() => useSettings())

    expect(result.current.settings).toEqual(savedSettings)
  })

  it('should update settings', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useSettings())

    act(() => {
      result.current.updateSettings({ fontSize: 18 })
    })

    expect(result.current.settings.fontSize).toBe(18)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'nototo-settings',
      expect.stringContaining('"fontSize":18')
    )
  })

  it('should handle invalid localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')

    const { result } = renderHook(() => useSettings())

    expect(result.current.settings.theme).toBe('solarized-dark')
  })

  it('should reset settings to defaults', () => {
    const { result } = renderHook(() => useSettings())

    act(() => {
      result.current.updateSettings({ fontSize: 20, theme: 'light' })
    })

    act(() => {
      result.current.resetSettings()
    })

    expect(result.current.settings.fontSize).toBe(14)
    expect(result.current.settings.theme).toBe('solarized-dark')
  })
})
