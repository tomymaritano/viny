import { describe, it, expect } from 'vitest'
import SettingsModal from '../SettingsModal'

describe('SettingsModal - Minimal', () => {
  it('exports a valid component', () => {
    expect(SettingsModal).toBeDefined()
    expect(typeof SettingsModal).toBe('function')
  })
})