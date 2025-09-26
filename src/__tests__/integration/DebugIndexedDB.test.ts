/**
 * Debug test to check IndexedDB availability
 */

import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'

describe('IndexedDB Debug', () => {
  it('should have IndexedDB available', () => {
    console.log('typeof indexedDB:', typeof indexedDB)
    console.log('indexedDB:', indexedDB)
    expect(typeof indexedDB).not.toBe('undefined')
  })
  
  it('should be able to open a database', async () => {
    const request = indexedDB.open('TestDB', 1)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('Database opened successfully')
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('Database open error:', request.error)
        reject(request.error)
      }
      
      request.onupgradeneeded = () => {
        console.log('Database upgrade needed')
        const db = request.result
        if (!db.objectStoreNames.contains('test')) {
          db.createObjectStore('test', { keyPath: 'id' })
        }
      }
    })
  })
})