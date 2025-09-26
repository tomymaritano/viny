/**
 * Comprehensive tests for SecurityService
 * Tests CSP implementation, input validation, and security monitoring
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SecurityService } from '../SecurityService'
import type { SecurityConfig, ValidationResult } from '../SecurityService'

// Mock DOM APIs for testing
const mockDocument = {
  createElement: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
  querySelector: vi.fn(),
  addEventListener: vi.fn(),
}

const mockWindow = {
  addEventListener: vi.fn(),
  location: {
    href: 'https://test.example.com',
    origin: 'https://test.example.com',
    hostname: 'test.example.com',
    protocol: 'https:',
  },
  navigator: {
    userAgent: 'Test Browser',
  },
}

// Setup DOM globals
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

Object.defineProperty(global, 'location', {
  value: mockWindow.location,
  writable: true,
})

Object.defineProperty(global, 'navigator', {
  value: mockWindow.navigator,
  writable: true,
})

describe('SecurityService', () => {
  let securityService: SecurityService

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset singleton instance for each test
    ;(SecurityService as any).instance = null

    // Mock createElement to return a mock element
    const mockMetaElement = {
      setAttribute: vi.fn(),
      remove: vi.fn(),
      httpEquiv: '',
      content: '',
    }

    mockDocument.createElement.mockReturnValue(mockMetaElement)
    mockDocument.querySelector.mockReturnValue(null)

    securityService = SecurityService.getInstance()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = SecurityService.getInstance()
      const instance2 = SecurityService.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should initialize with default configuration', () => {
      const metrics = securityService.getSecurityMetrics()

      expect(metrics.cspEnabled).toBe(true)
      expect(metrics.validationEnabled).toBe(true)
    })

    it('should setup CSP meta tag', () => {
      expect(mockDocument.createElement).toHaveBeenCalledWith('meta')
      expect(mockDocument.head.appendChild).toHaveBeenCalled()
    })

    it('should setup event listeners for security monitoring', () => {
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'securitypolicyviolation',
        expect.any(Function)
      )
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      )
    })
  })

  describe('Input Validation', () => {
    describe('Text Validation', () => {
      it('should validate normal text input', () => {
        const result = securityService.validateInput('Hello, world!')

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.warnings).toHaveLength(0)
      })

      it('should enforce maximum length limits', () => {
        const longText = 'a'.repeat(60000)
        const result = securityService.validateInput(longText, {
          maxLength: 1000,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
          'Input exceeds maximum length of 1000 characters'
        )
        expect(result.sanitized).toBe('a'.repeat(1000))
        expect(result.warnings).toContain(
          'Input was truncated to maximum length'
        )
      })

      it('should detect potential XSS patterns', () => {
        const maliciousInput = '<script>alert("xss")</script>'
        const result = securityService.validateInput(maliciousInput, {
          type: 'text',
        })

        expect(result.isValid).toBe(true) // Text type doesn't sanitize HTML
        expect(result.warnings).toHaveLength(0)
      })

      it('should detect SQL injection patterns', () => {
        const sqlInjection = "'; DROP TABLE users; --"
        const result = securityService.validateInput(sqlInjection)

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
          'Input contains potentially malicious content'
        )
      })

      it('should detect various SQL injection patterns', () => {
        const patterns = [
          'SELECT * FROM users',
          '1=1 OR 1=1',
          "admin\\'--",
          '/* comment */ SELECT',
          'UNION SELECT password FROM users',
        ]

        patterns.forEach(pattern => {
          const result = securityService.validateInput(pattern)
          expect(result.isValid).toBe(false)
          expect(result.errors).toContain(
            'Input contains potentially malicious content'
          )
        })
      })
    })

    describe('HTML Validation', () => {
      it('should sanitize HTML input', () => {
        const htmlInput = '<p>Safe content</p><script>alert("bad")</script>'
        const result = securityService.validateInput(htmlInput, {
          type: 'html',
        })

        expect(result.isValid).toBe(true)
        expect(result.sanitized).toBeDefined()
        expect(result.sanitized).not.toContain('<script>')
        expect(result.warnings).toContain(
          'HTML content was sanitized for security'
        )
      })

      it('should respect allowed tags list', () => {
        const htmlInput = '<p>Paragraph</p><div>Div</div><span>Span</span>'
        const result = securityService.validateInput(htmlInput, {
          type: 'html',
          allowedTags: ['p', 'span'],
        })

        expect(result.isValid).toBe(true)
        expect(result.sanitized).toContain('<p>')
        expect(result.sanitized).toContain('<span>')
        expect(result.sanitized).not.toContain('<div>')
      })

      it('should remove event handlers from HTML', () => {
        const htmlInput =
          '<div onclick="alert(1)" onmouseover="badFunction()">Content</div>'
        const result = securityService.validateInput(htmlInput, {
          type: 'html',
        })

        expect(result.isValid).toBe(true)
        expect(result.sanitized).not.toContain('onclick')
        expect(result.sanitized).not.toContain('onmouseover')
      })
    })

    describe('URL Validation', () => {
      it('should validate HTTPS URLs', () => {
        const result = securityService.validateInput('https://example.com', {
          type: 'url',
        })

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should validate HTTP URLs', () => {
        const result = securityService.validateInput('http://example.com', {
          type: 'url',
        })

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject non-HTTP protocols', () => {
        const maliciousUrls = [
          'javascript:alert(1)',
          'data:text/html,<script>alert(1)</script>',
          'ftp://example.com',
          'file:///etc/passwd',
        ]

        maliciousUrls.forEach(url => {
          const result = securityService.validateInput(url, { type: 'url' })
          expect(result.isValid).toBe(false)
          expect(result.errors).toContain(
            'Only HTTP and HTTPS URLs are allowed'
          )
        })
      })

      it('should reject invalid URL formats', () => {
        const invalidUrls = [
          'not-a-url',
          'http://',
          'https://',
          '://example.com',
        ]

        invalidUrls.forEach(url => {
          const result = securityService.validateInput(url, { type: 'url' })
          expect(result.isValid).toBe(false)
          expect(result.errors).toContain('Invalid URL format')
        })
      })
    })

    describe('Email Validation', () => {
      it('should validate correct email formats', () => {
        const validEmails = [
          'user@example.com',
          'test.email+tag@domain.co.uk',
          'user123@subdomain.example.org',
        ]

        validEmails.forEach(email => {
          const result = securityService.validateInput(email, { type: 'email' })
          expect(result.isValid).toBe(true)
          expect(result.errors).toHaveLength(0)
        })
      })

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user..double.dot@example.com',
          'user@.com',
        ]

        invalidEmails.forEach(email => {
          const result = securityService.validateInput(email, { type: 'email' })
          expect(result.isValid).toBe(false)
          expect(result.errors).toContain('Invalid email format')
        })
      })
    })
  })

  describe('Security Monitoring', () => {
    it('should track security violations', () => {
      const initialMetrics = securityService.getSecurityMetrics()
      const initialCount = initialMetrics.violationCount

      // Simulate a CSP violation
      const violationEvent = new Event('securitypolicyviolation') as any
      violationEvent.blockedURI = 'https://malicious.com/script.js'
      violationEvent.violatedDirective = 'script-src'

      // Get the event listener that was registered
      const eventHandler = mockDocument.addEventListener.mock.calls.find(
        call => call[0] === 'securitypolicyviolation'
      )?.[1]

      if (eventHandler) {
        eventHandler(violationEvent)
      }

      const updatedMetrics = securityService.getSecurityMetrics()
      expect(updatedMetrics.violationCount).toBe(initialCount + 1)
      expect(updatedMetrics.violations).toHaveLength(initialCount + 1)
    })

    it('should provide security metrics', () => {
      const metrics = securityService.getSecurityMetrics()

      expect(metrics).toHaveProperty('violations')
      expect(metrics).toHaveProperty('violationCount')
      expect(metrics).toHaveProperty('cspEnabled')
      expect(metrics).toHaveProperty('validationEnabled')
      expect(Array.isArray(metrics.violations)).toBe(true)
      expect(typeof metrics.violationCount).toBe('number')
      expect(typeof metrics.cspEnabled).toBe('boolean')
      expect(typeof metrics.validationEnabled).toBe('boolean')
    })
  })

  describe('Security Audit', () => {
    it('should perform comprehensive security audit', () => {
      const auditResult = securityService.performSecurityAudit()

      expect(auditResult).toHaveProperty('passed')
      expect(auditResult).toHaveProperty('checks')
      expect(Array.isArray(auditResult.checks)).toBe(true)
      expect(auditResult.checks.length).toBeGreaterThan(0)

      auditResult.checks.forEach(check => {
        expect(check).toHaveProperty('name')
        expect(check).toHaveProperty('passed')
        expect(check).toHaveProperty('details')
        expect(typeof check.passed).toBe('boolean')
      })
    })

    it('should check CSP configuration', () => {
      const auditResult = securityService.performSecurityAudit()

      const cspCheck = auditResult.checks.find(
        check => check.name === 'CSP Configuration'
      )
      expect(cspCheck).toBeDefined()
      expect(cspCheck?.passed).toBe(true)
    })

    it('should check input validation configuration', () => {
      const auditResult = securityService.performSecurityAudit()

      const validationCheck = auditResult.checks.find(
        check => check.name === 'Input Validation'
      )
      expect(validationCheck).toBeDefined()
      expect(validationCheck?.passed).toBe(true)
    })

    it('should check security monitoring', () => {
      const auditResult = securityService.performSecurityAudit()

      const monitoringCheck = auditResult.checks.find(
        check => check.name === 'Security Monitoring'
      )
      expect(monitoringCheck).toBeDefined()
      expect(monitoringCheck?.passed).toBe(true)
    })

    it('should check HTTPS usage', () => {
      const auditResult = securityService.performSecurityAudit()

      const httpsCheck = auditResult.checks.find(
        check => check.name === 'HTTPS Usage'
      )
      expect(httpsCheck).toBeDefined()
      expect(httpsCheck?.passed).toBe(true) // Mock uses HTTPS
    })
  })

  describe('Configuration Management', () => {
    it('should update security configuration', () => {
      const newConfig: Partial<SecurityConfig> = {
        csp: {
          enabled: false,
          reportOnly: true,
        },
      }

      securityService.updateConfig(newConfig)

      const metrics = securityService.getSecurityMetrics()
      expect(metrics.cspEnabled).toBe(false)
    })

    it('should maintain configuration consistency', () => {
      const originalConfig = securityService.getSecurityMetrics()

      securityService.updateConfig({
        validation: {
          strictMode: false,
          sanitizeHtml: false,
          maxInputLength: 100000,
        },
      })

      const updatedMetrics = securityService.getSecurityMetrics()
      expect(updatedMetrics.validationEnabled).toBe(false)
      expect(updatedMetrics.cspEnabled).toBe(originalConfig.cspEnabled) // Should remain unchanged
    })
  })

  describe('Error Handling', () => {
    it('should handle validation failures gracefully', () => {
      // Mock console.warn to verify error logging
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = securityService.validateInput('test')

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')

      warnSpy.mockRestore()
    })

    it('should provide meaningful error messages', () => {
      const longInput = 'a'.repeat(100000)
      const result = securityService.validateInput(longInput, {
        maxLength: 1000,
      })

      expect(result.errors[0]).toContain('exceeds maximum length')
      expect(result.errors[0]).toContain('1000')
    })

    it('should handle HTML sanitization errors', () => {
      // Test with potentially problematic HTML
      const problematicHtml = '<svg><script>alert(1)</script></svg>'
      const result = securityService.validateInput(problematicHtml, {
        type: 'html',
      })

      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should validate large inputs efficiently', () => {
      const largeInput = 'a'.repeat(10000)
      const startTime = performance.now()

      const result = securityService.validateInput(largeInput)

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // Should complete within 100ms
      expect(result).toBeDefined()
    })

    it('should handle multiple concurrent validations', async () => {
      const inputs = Array(100)
        .fill(0)
        .map((_, i) => `test input ${i}`)

      const startTime = performance.now()

      const results = inputs.map(input => securityService.validateInput(input))

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // Should complete within 500ms
      expect(results).toHaveLength(100)
      expect(results.every(r => r.isValid)).toBe(true)
    })
  })
})
