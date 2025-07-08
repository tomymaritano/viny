import { renderHook, act } from '@testing-library/react'
import { useNotebooks } from '../useNotebooks'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useNotebooks Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should return default notebooks', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    expect(result.current.notebooks).toEqual([
      { id: 1, name: 'Personal', color: 'blue' },
      { id: 2, name: 'Work', color: 'green' },
      { id: 3, name: 'Ideas', color: 'purple' },
    ])
  })

  it('should load notebooks from localStorage', () => {
    const savedNotebooks = [
      { id: 1, name: 'Custom', color: 'red' },
      { id: 2, name: 'Project', color: 'yellow' },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedNotebooks))

    const { result } = renderHook(() => useNotebooks())

    expect(result.current.notebooks).toEqual(savedNotebooks)
  })

  it('should add a new notebook', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    act(() => {
      result.current.addNotebook('New Notebook', 'red')
    })

    expect(result.current.notebooks).toHaveLength(4)
    expect(result.current.notebooks[3]).toMatchObject({
      name: 'New Notebook',
      color: 'red',
    })
  })

  it('should update a notebook', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    act(() => {
      result.current.updateNotebook(1, 'Updated Personal', 'orange')
    })

    const updatedNotebook = result.current.notebooks.find(n => n.id === 1)
    expect(updatedNotebook.name).toBe('Updated Personal')
    expect(updatedNotebook.color).toBe('orange')
  })

  it('should delete a notebook', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    act(() => {
      result.current.deleteNotebook(1)
    })

    expect(result.current.notebooks).toHaveLength(2)
    expect(result.current.notebooks.find(n => n.id === 1)).toBeUndefined()
  })

  it('should get color class for notebook', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    expect(result.current.getColorClass('blue')).toBe('text-blue-500')
    expect(result.current.getColorClass('red')).toBe('text-red-500')
    expect(result.current.getColorClass('unknown')).toBe('text-gray-500')
  })

  it('should handle invalid localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')

    const { result } = renderHook(() => useNotebooks())

    expect(result.current.notebooks).toHaveLength(3) // Should use defaults
  })

  it('should save notebooks to localStorage when modified', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useNotebooks())

    act(() => {
      result.current.addNotebook('Test', 'blue')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'nototo-notebooks',
      expect.stringContaining('Test')
    )
  })
})
