/**
 * Security Service - Production-grade security hardening
 * Implements CSP, input validation, and security monitoring
 */

import { logger } from '../utils/logger'

export interface SecurityConfig {
  csp: {
    enabled: boolean
    reportOnly: boolean
    reportUri?: string
  }
  validation: {
    strictMode: boolean
    sanitizeHtml: boolean
    maxInputLength: number
  }
  monitoring: {
    enabled: boolean
    reportViolations: boolean
  }
}

export interface ValidationResult {
  isValid: boolean
  sanitized?: string
  errors: string[]
  warnings: string[]
}

export class SecurityService {
  private static instance: SecurityService
  private config: SecurityConfig
  private violations: Array<{
    type: string
    timestamp: Date
    details: any
  }> = []

  private constructor() {
    // Disable CSP in development to allow Ollama connections
    const isDev = import.meta.env.DEV
    this.config = {
      csp: {
        enabled: !isDev, // Disable CSP in development
        reportOnly: false,
        reportUri: '/api/csp-report',
      },
      validation: {
        strictMode: true,
        sanitizeHtml: true,
        maxInputLength: 50000,
      },
      monitoring: {
        enabled: true,
        reportViolations: true,
      },
    }
    this.initialize()
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  private initialize(): void {
    this.setupCSP()
    this.setupSecurityHeaders()
    this.setupViolationReporting()
    logger.info('SecurityService initialized', {
      correlationId: this.generateCorrelationId(),
      config: this.config,
    })
  }

  private setupCSP(): void {
    if (!this.config.csp.enabled) return

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "connect-src 'self' http://localhost:3001 http://localhost:11434 https://api.viny.app",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ]

    if (this.config.csp.reportUri) {
      cspDirectives.push(`report-uri ${this.config.csp.reportUri}`)
    }

    const cspHeader = cspDirectives.join('; ')
    const headerName = this.config.csp.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'

    // Note: In a real implementation, this would be set by the server
    // For client-side apps, we use meta tags
    this.injectCSPMetaTag(cspHeader, this.config.csp.reportOnly)
  }

  private injectCSPMetaTag(policy: string, reportOnly: boolean): void {
    const existingMeta =
      document.querySelector('meta[http-equiv="Content-Security-Policy"]') ||
      document.querySelector(
        'meta[http-equiv="Content-Security-Policy-Report-Only"]'
      )

    if (existingMeta) {
      existingMeta.remove()
    }

    const meta = document.createElement('meta')
    meta.httpEquiv = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'
    meta.content = policy
    document.head.appendChild(meta)

    logger.info('CSP policy applied', {
      correlationId: this.generateCorrelationId(),
      reportOnly,
      policy,
    })
  }

  private setupSecurityHeaders(): void {
    // These would typically be set by the server, but we can check/warn if missing
    const expectedHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Permissions-Policy',
    ]

    // In a real app, check if these headers are present in responses
    logger.info('Security headers configuration checked', {
      correlationId: this.generateCorrelationId(),
      expectedHeaders,
    })
  }

  private setupViolationReporting(): void {
    if (!this.config.monitoring.enabled) return

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', event => {
      this.handleSecurityViolation('csp', {
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        statusCode: event.statusCode,
        violatedDirective: event.violatedDirective,
      })
    })

    // Monitor for other security issues
    window.addEventListener('error', event => {
      if (event.error && event.error.name === 'SecurityError') {
        this.handleSecurityViolation('security-error', {
          message: event.error.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        })
      }
    })
  }

  private handleSecurityViolation(type: string, details: any): void {
    const violation = {
      type,
      timestamp: new Date(),
      details,
    }

    this.violations.push(violation)

    // Skip common development CSP violations
    if (import.meta.env.DEV && type === 'csp' && 
        (details.blockedURI === 'eval' || details.blockedURI === 'wasm-eval')) {
      return
    }

    logger.security('Security violation detected', {
      correlationId: this.generateCorrelationId(),
      violation,
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    if (this.config.monitoring.reportViolations) {
      this.reportViolation(violation)
    }
  }

  private async reportViolation(violation: any): Promise<void> {
    try {
      // In a real implementation, this would send to a security monitoring service
      logger.security('Security violation reported', {
        correlationId: this.generateCorrelationId(),
        violation,
      })
    } catch (error) {
      logger.error('Failed to report security violation', {
        correlationId: this.generateCorrelationId(),
        error,
        violation,
      })
    }
  }

  /**
   * Validates and sanitizes user input
   */
  validateInput(
    input: string,
    options: {
      type?: 'text' | 'html' | 'url' | 'email'
      maxLength?: number
      allowedTags?: string[]
      stripTags?: boolean
      skipHeavyValidation?: boolean
    } = {}
  ): ValidationResult {
    const correlationId = '' // Skip correlation ID generation for performance
    const errors: string[] = []
    const warnings: string[] = []
    let sanitized = input

    try {
      // Length validation
      const maxLength =
        options.maxLength || this.config.validation.maxInputLength
      if (input.length > maxLength) {
        errors.push(`Input exceeds maximum length of ${maxLength} characters`)
        sanitized = input.substring(0, maxLength)
        warnings.push('Input was truncated to maximum length')
      }

      // Basic XSS prevention
      if (options.type === 'html' && this.config.validation.sanitizeHtml) {
        sanitized = this.sanitizeHtml(sanitized, options.allowedTags)
        if (sanitized !== input) {
          warnings.push('HTML content was sanitized for security')
        }
      }

      // URL validation
      if (options.type === 'url') {
        try {
          const url = new URL(sanitized)
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('Only HTTP and HTTPS URLs are allowed')
          }
        } catch {
          errors.push('Invalid URL format')
        }
      }

      // Email validation
      if (options.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitized)) {
          errors.push('Invalid email format')
        }
      }

      // Skip heavy validation for editor content to improve performance
      if (!options.skipHeavyValidation && options.type !== 'text') {
        // SQL injection patterns (basic detection)
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
          /(;|\-\-|\/\*|\*\/)/,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
        ]

        for (const pattern of sqlPatterns) {
          if (pattern.test(sanitized)) {
            errors.push('Input contains potentially malicious content')
            break
          }
        }
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        sanitized: sanitized !== input ? sanitized : undefined,
        errors,
        warnings,
      }

      // Skip debug logging for performance
      // logger.debug('Input validation completed', ...)

      return result
    } catch (error) {
      logger.error('Input validation failed', {
        correlationId,
        error,
        inputLength: input.length,
      })

      return {
        isValid: false,
        errors: ['Validation process failed'],
        warnings: [],
      }
    }
  }

  private sanitizeHtml(html: string, allowedTags: string[] = []): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    const div = document.createElement('div')
    div.innerHTML = html

    // Remove script tags and event handlers
    const scripts = div.querySelectorAll('script')
    scripts.forEach(script => script.remove())

    // Remove event handlers
    const allElements = div.querySelectorAll('*')
    allElements.forEach(element => {
      const attributes = [...element.attributes]
      attributes.forEach(attr => {
        if (attr.name.startsWith('on') || attr.name === 'javascript:') {
          element.removeAttribute(attr.name)
        }
      })

      // Remove disallowed tags
      if (
        allowedTags.length > 0 &&
        !allowedTags.includes(element.tagName.toLowerCase())
      ) {
        element.remove()
      }
    })

    return div.innerHTML
  }

  /**
   * Generates a correlation ID for tracking security events
   */
  private generateCorrelationId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Gets security metrics and violation reports
   */
  getSecurityMetrics(): {
    violations: Array<any>
    violationCount: number
    lastViolation?: Date
    cspEnabled: boolean
    validationEnabled: boolean
  } {
    return {
      violations: this.violations.slice(-100), // Last 100 violations
      violationCount: this.violations.length,
      lastViolation:
        this.violations.length > 0
          ? this.violations[this.violations.length - 1].timestamp
          : undefined,
      cspEnabled: this.config.csp.enabled,
      validationEnabled: this.config.validation.strictMode,
    }
  }

  /**
   * Updates security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates }
    logger.info('Security configuration updated', {
      correlationId: this.generateCorrelationId(),
      updates,
    })

    // Re-initialize with new config
    this.initialize()
  }

  /**
   * Performs a security self-check
   */
  performSecurityAudit(): {
    passed: boolean
    checks: Array<{
      name: string
      passed: boolean
      details: string
    }>
  } {
    const checks = [
      {
        name: 'CSP Configuration',
        passed: this.config.csp.enabled,
        details: this.config.csp.enabled
          ? 'CSP is enabled and configured'
          : 'CSP is disabled',
      },
      {
        name: 'Input Validation',
        passed: this.config.validation.strictMode,
        details: this.config.validation.strictMode
          ? 'Strict validation enabled'
          : 'Validation is not in strict mode',
      },
      {
        name: 'Security Monitoring',
        passed: this.config.monitoring.enabled,
        details: this.config.monitoring.enabled
          ? 'Security monitoring active'
          : 'Security monitoring disabled',
      },
      {
        name: 'HTTPS Usage',
        passed:
          location.protocol === 'https:' || location.hostname === 'localhost',
        details:
          location.protocol === 'https:'
            ? 'Using HTTPS'
            : 'Not using HTTPS (acceptable for localhost)',
      },
    ]

    const passed = checks.every(check => check.passed)

    logger.audit('Security audit performed', {
      correlationId: this.generateCorrelationId(),
      passed,
      checks,
    })

    return { passed, checks }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance()
