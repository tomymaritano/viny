import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start with empty toasts', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.toasts).toEqual([])
  })

  it('should add success toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('Success message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      message: 'Success message',
    })
  })

  it('should add error toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.error('Error message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      message: 'Error message',
    })
  })

  it('should add warning toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.warning('Warning message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      message: 'Warning message',
    })
  })

  it('should add info toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.info('Info message')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      message: 'Info message',
    })
  })

  it('should remove toast by id', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('Test message')
    })

    const toastId = result.current.toasts[0].id

    act(() => {
      result.current.removeToast(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should auto-remove toast after timeout', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('Test message')
    })

    expect(result.current.toasts).toHaveLength(1)

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('Message 1')
      result.current.error('Message 2')
      result.current.warning('Message 3')
    })

    expect(result.current.toasts).toHaveLength(3)
  })
})
