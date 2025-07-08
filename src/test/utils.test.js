import { describe, it, expect } from 'vitest'

describe('Basic Setup Test', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to globals', () => {
    expect(vi).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('should mock localStorage', () => {
    expect(localStorage.getItem).toBeDefined()
    expect(localStorage.setItem).toBeDefined()
  })

  it('should handle simple calculations', () => {
    expect(2 + 2).toBe(4)
    expect('hello'.toUpperCase()).toBe('HELLO')
  })
})
