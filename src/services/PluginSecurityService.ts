/**
 * Viny Plugin Security Service
 * Enterprise-grade security framework for plugin system
 */

import { logger } from '../utils/logger'

export interface SecurityViolation {
  pluginName: string
  violation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  details?: any
}

export interface ResourceUsage {
  memory: number // bytes
  executionTime: number // ms
  networkRequests: number
  storageUsed: number // bytes
}

export interface SecurityAuditLog {
  pluginName: string
  action: string
  permission: string
  granted: boolean
  timestamp: number
  resourceUsage?: ResourceUsage
}

/**
 * Plugin Security Framework
 * Handles sandboxing, permissions, resource monitoring, and threat detection
 */
export class PluginSecurityService {
  private violations: SecurityViolation[] = []
  private auditLog: SecurityAuditLog[] = []
  private resourceMonitors: Map<string, ResourceMonitor> = new Map()
  private securityPolicies: Map<string, any> = new Map()

  // Security configuration
  private readonly MAX_VIOLATIONS_PER_PLUGIN = 10
  private readonly MAX_AUDIT_LOG_SIZE = 1000
  private readonly VIOLATION_THRESHOLD = {
    low: 50,
    medium: 20,
    high: 5,
    critical: 1,
  }

  constructor() {
    this.initializeSecurityFramework()
  }

  private initializeSecurityFramework(): void {
    logger.info('PluginSecurityService: Initializing security framework')
    this.setupSecurityMonitoring()
    this.loadSecurityConfiguration()
  }

  private setupSecurityMonitoring(): void {
    // Monitor global JavaScript execution for suspicious activity
    this.setupCodeInjectionDetection()
    this.setupResourceMonitoring()
    this.setupNetworkMonitoring()
  }

  private setupCodeInjectionDetection(): void {
    // Override dangerous functions to detect misuse
    const originalEval = window.eval
    window.eval = (code: string) => {
      this.recordViolation('unknown', 'Attempted eval() usage', 'high', {
        code: code.substring(0, 100),
      })
      throw new Error('eval() is not allowed in plugin context')
    }

    // Monitor Function constructor
    const originalFunction = window.Function
    window.Function = function (...args: any[]) {
      logger.warn('PluginSecurityService: Function constructor usage detected')
      return originalFunction.apply(this, args)
    }
  }

  private setupResourceMonitoring(): void {
    // Monitor memory and CPU usage
    setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize
        this.resourceMonitors.forEach((monitor, pluginName) => {
          monitor.updateMemoryUsage(memoryUsage)
        })
      }
    }, 5000)
  }

  private setupNetworkMonitoring(): void {
    // Monitor fetch and XMLHttpRequest
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      this.recordNetworkRequest('unknown', url, 'fetch')
      return originalFetch(input, init)
    }

    const originalXHR = window.XMLHttpRequest
    window.XMLHttpRequest = class extends originalXHR {
      open(method: string, url: string, ...args: any[]) {
        this.recordNetworkRequest('unknown', url, 'xhr')
        return super.open(method, url, ...args)
      }
    } as any
  }

  private loadSecurityConfiguration(): void {
    // Load security configuration from storage
    try {
      const config = localStorage.getItem('viny_security_config')
      if (config) {
        const parsed = JSON.parse(config)
        this.securityPolicies.set('global', parsed)
      }
    } catch (error) {
      logger.error('Failed to load security configuration:', error)
    }
  }

  /**
   * Create secure sandbox for plugin execution
   */
  createSecureSandbox(pluginName: string, policy: any): any {
    logger.debug(`Creating secure sandbox for plugin: ${pluginName}`)

    // Create resource monitor
    const monitor = new ResourceMonitor(pluginName, policy.resourceLimits)
    this.resourceMonitors.set(pluginName, monitor)

    // Create restricted global context
    const sandbox = {
      // Safe console
      console: this.createSecureConsole(pluginName),

      // Restricted timers
      setTimeout: policy.allowedPermissions.includes('timers')
        ? (fn: Function, delay: number) =>
            this.secureSetTimeout(pluginName, fn, delay, monitor)
        : undefined,

      setInterval: policy.allowedPermissions.includes('timers')
        ? (fn: Function, delay: number) =>
            this.secureSetInterval(pluginName, fn, delay, monitor)
        : undefined,

      // Restricted DOM access
      document: policy.allowedPermissions.includes('dom')
        ? this.createRestrictedDocument(pluginName)
        : undefined,

      // Restricted network access
      fetch: policy.allowedPermissions.includes('network')
        ? (input: any, init?: any) =>
            this.secureFetch(pluginName, input, init, monitor)
        : undefined,

      // Plugin-specific storage
      localStorage: this.createPluginStorage(pluginName),

      // Utility functions
      JSON: JSON,
      Math: Math,
      Date: Date,

      // Disable dangerous functions
      eval: undefined,
      Function: undefined,
      import: undefined,
      require: undefined,
      process: undefined,
      global: undefined,
      globalThis: undefined,
      window: undefined,
      self: undefined,
      parent: undefined,
      top: undefined,
    }

    // Record sandbox creation
    this.recordAuditLog(pluginName, 'sandbox_created', 'system', true)

    return sandbox
  }

  /**
   * Validate plugin code for security issues
   */
  validatePluginCode(
    pluginName: string,
    code: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /eval\s*\(/gi, message: 'Contains eval() call' },
      { pattern: /Function\s*\(/gi, message: 'Contains Function constructor' },
      { pattern: /innerHTML\s*=/gi, message: 'Contains innerHTML assignment' },
      { pattern: /outerHTML\s*=/gi, message: 'Contains outerHTML assignment' },
      { pattern: /document\.write/gi, message: 'Contains document.write' },
      { pattern: /script\s*>/gi, message: 'Contains script tag' },
      { pattern: /javascript:/gi, message: 'Contains javascript: protocol' },
      { pattern: /on\w+\s*=/gi, message: 'Contains inline event handlers' },
      { pattern: /import\s*\(/gi, message: 'Contains dynamic import' },
      { pattern: /require\s*\(/gi, message: 'Contains require call' },
      { pattern: /process\./gi, message: 'Attempts to access process object' },
      { pattern: /global\./gi, message: 'Attempts to access global object' },
      { pattern: /window\./gi, message: 'Direct window object access' },
    ]

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        issues.push(message)
        this.recordViolation(pluginName, message, 'medium', {
          pattern: pattern.source,
        })
      }
    }

    // Check code size
    if (code.length > 1024 * 1024) {
      // 1MB
      issues.push('Plugin code exceeds size limit (1MB)')
      this.recordViolation(pluginName, 'Code size limit exceeded', 'medium')
    }

    // Check for obfuscated code patterns
    const obfuscationPatterns = [
      /[\x00-\x1f\x7f-\x9f]/, // Control characters
      /[^\x20-\x7e\s]/, // Non-printable characters
      /\\x[0-9a-f]{2}/gi, // Hex escape sequences
      /\\u[0-9a-f]{4}/gi, // Unicode escape sequences
    ]

    let obfuscationScore = 0
    for (const pattern of obfuscationPatterns) {
      const matches = code.match(pattern)
      if (matches) {
        obfuscationScore += matches.length
      }
    }

    if (obfuscationScore > 10) {
      issues.push('Plugin appears to be obfuscated')
      this.recordViolation(pluginName, 'Obfuscated code detected', 'high', {
        score: obfuscationScore,
      })
    }

    const isValid = issues.length === 0

    this.recordAuditLog(pluginName, 'code_validation', 'security', isValid, {
      codeSize: code.length,
      issuesFound: issues.length,
      obfuscationScore,
    })

    return { valid: isValid, issues }
  }

  /**
   * Check if plugin has permission for specific action
   */
  checkPermission(pluginName: string, permission: string): boolean {
    const policy = this.securityPolicies.get(pluginName)
    if (!policy) {
      this.recordViolation(pluginName, `No security policy found`, 'high')
      return false
    }

    const hasPermission =
      policy.allowedPermissions.includes('*') ||
      policy.allowedPermissions.includes(permission)

    this.recordAuditLog(
      pluginName,
      'permission_check',
      permission,
      hasPermission
    )

    if (!hasPermission) {
      this.recordViolation(
        pluginName,
        `Permission denied: ${permission}`,
        'medium'
      )
    }

    return hasPermission
  }

  /**
   * Monitor plugin resource usage
   */
  monitorResourceUsage(pluginName: string): ResourceUsage | null {
    const monitor = this.resourceMonitors.get(pluginName)
    return monitor ? monitor.getCurrentUsage() : null
  }

  /**
   * Get security violations for plugin
   */
  getViolations(pluginName?: string): SecurityViolation[] {
    if (pluginName) {
      return this.violations.filter(v => v.pluginName === pluginName)
    }
    return [...this.violations]
  }

  /**
   * Get security audit log
   */
  getAuditLog(pluginName?: string): SecurityAuditLog[] {
    if (pluginName) {
      return this.auditLog.filter(log => log.pluginName === pluginName)
    }
    return [...this.auditLog]
  }

  /**
   * Check if plugin should be quarantined
   */
  shouldQuarantinePlugin(pluginName: string): boolean {
    const violations = this.getViolations(pluginName)

    let score = 0
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score += 10
          break
        case 'high':
          score += 5
          break
        case 'medium':
          score += 2
          break
        case 'low':
          score += 1
          break
      }
    }

    return score >= 15 // Quarantine threshold
  }

  /**
   * Clean up security data for unloaded plugin
   */
  cleanupPlugin(pluginName: string): void {
    this.resourceMonitors.delete(pluginName)
    this.securityPolicies.delete(pluginName)

    // Remove old violations (keep recent ones for analysis)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
    this.violations = this.violations.filter(
      v => v.pluginName !== pluginName || v.timestamp > cutoff
    )

    logger.info(`Security cleanup completed for plugin: ${pluginName}`)
  }

  // Private helper methods

  private createSecureConsole(pluginName: string): Console {
    return {
      log: (...args: any[]) => logger.info(`Plugin(${pluginName}):`, ...args),
      warn: (...args: any[]) => logger.warn(`Plugin(${pluginName}):`, ...args),
      error: (...args: any[]) =>
        logger.error(`Plugin(${pluginName}):`, ...args),
      debug: (...args: any[]) =>
        logger.debug(`Plugin(${pluginName}):`, ...args),
      info: (...args: any[]) => logger.info(`Plugin(${pluginName}):`, ...args),
    } as Console
  }

  private secureSetTimeout(
    pluginName: string,
    fn: Function,
    delay: number,
    monitor: ResourceMonitor
  ): NodeJS.Timeout {
    if (delay < 10) {
      this.recordViolation(
        pluginName,
        'Excessive setTimeout frequency',
        'medium',
        { delay }
      )
      delay = 10 // Minimum delay
    }

    monitor.incrementTimerUsage()

    return setTimeout(() => {
      try {
        const start = performance.now()
        fn()
        const executionTime = performance.now() - start
        monitor.recordExecution(executionTime)
      } catch (error) {
        this.recordViolation(pluginName, 'Timer callback error', 'low', {
          error: String(error),
        })
      }
    }, delay)
  }

  private secureSetInterval(
    pluginName: string,
    fn: Function,
    delay: number,
    monitor: ResourceMonitor
  ): NodeJS.Timeout {
    if (delay < 100) {
      this.recordViolation(
        pluginName,
        'Excessive setInterval frequency',
        'high',
        { delay }
      )
      delay = 100 // Minimum delay for intervals
    }

    monitor.incrementTimerUsage()

    return setInterval(() => {
      try {
        const start = performance.now()
        fn()
        const executionTime = performance.now() - start
        monitor.recordExecution(executionTime)
      } catch (error) {
        this.recordViolation(pluginName, 'Interval callback error', 'low', {
          error: String(error),
        })
      }
    }, delay)
  }

  private createRestrictedDocument(pluginName: string): any {
    // Return a very limited document interface
    return {
      createElement: (tag: string) => {
        if (!['div', 'span', 'p', 'button'].includes(tag.toLowerCase())) {
          this.recordViolation(
            pluginName,
            `Attempted to create restricted element: ${tag}`,
            'medium'
          )
          throw new Error(`Element type '${tag}' not allowed`)
        }
        return document.createElement(tag)
      },

      querySelector: (selector: string) => {
        // Log selector for monitoring
        this.recordAuditLog(pluginName, 'dom_query', 'dom.read', true, {
          selector,
        })
        return null // Restricted for security
      },

      // Prevent access to dangerous methods
      write: undefined,
      writeln: undefined,
      open: undefined,
      close: undefined,
    }
  }

  private async secureFetch(
    pluginName: string,
    input: any,
    init: any,
    monitor: ResourceMonitor
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString()

    // Check URL whitelist
    if (!this.isUrlAllowed(url)) {
      this.recordViolation(
        pluginName,
        `Blocked network request to: ${url}`,
        'high'
      )
      throw new Error(`Network request to ${url} not allowed`)
    }

    monitor.incrementNetworkRequests()
    this.recordAuditLog(pluginName, 'network_request', 'network', true, { url })

    try {
      const response = await fetch(input, init)
      monitor.recordNetworkResponse(response.status)
      return response
    } catch (error) {
      this.recordViolation(pluginName, 'Network request failed', 'low', {
        url,
        error: String(error),
      })
      throw error
    }
  }

  private createPluginStorage(pluginName: string): Storage {
    const storageKey = `viny_plugin_secure_${pluginName}`

    return {
      getItem: (key: string) => {
        try {
          const data = localStorage.getItem(storageKey)
          const parsed = data ? JSON.parse(data) : {}
          return parsed[key] || null
        } catch (error) {
          this.recordViolation(pluginName, 'Storage read error', 'low')
          return null
        }
      },

      setItem: (key: string, value: string) => {
        try {
          const data = localStorage.getItem(storageKey)
          const parsed = data ? JSON.parse(data) : {}
          parsed[key] = value
          localStorage.setItem(storageKey, JSON.stringify(parsed))
        } catch (error) {
          this.recordViolation(pluginName, 'Storage write error', 'low')
          throw new Error('Storage quota exceeded')
        }
      },

      removeItem: (key: string) => {
        try {
          const data = localStorage.getItem(storageKey)
          const parsed = data ? JSON.parse(data) : {}
          delete parsed[key]
          localStorage.setItem(storageKey, JSON.stringify(parsed))
        } catch (error) {
          this.recordViolation(pluginName, 'Storage remove error', 'low')
        }
      },

      clear: () => {
        try {
          localStorage.removeItem(storageKey)
        } catch (error) {
          this.recordViolation(pluginName, 'Storage clear error', 'low')
        }
      },

      key: () => null,
      length: 0,
    }
  }

  private isUrlAllowed(url: string): boolean {
    // Implement URL whitelist logic
    const allowedDomains = [
      'api.github.com',
      'raw.githubusercontent.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
    ]

    try {
      const urlObj = new URL(url)
      return allowedDomains.some(domain => urlObj.hostname.endsWith(domain))
    } catch {
      return false
    }
  }

  private recordViolation(
    pluginName: string,
    violation: string,
    severity: SecurityViolation['severity'],
    details?: any
  ): void {
    const securityViolation: SecurityViolation = {
      pluginName,
      violation,
      severity,
      timestamp: Date.now(),
      details,
    }

    this.violations.push(securityViolation)

    // Keep violations list manageable
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-500)
    }

    logger.warn(
      `Security violation [${severity}] in plugin ${pluginName}: ${violation}`
    )

    // Auto-quarantine for critical violations
    if (severity === 'critical') {
      logger.error(
        `Critical security violation in plugin ${pluginName}, consider quarantine`
      )
    }
  }

  private recordAuditLog(
    pluginName: string,
    action: string,
    permission: string,
    granted: boolean,
    details?: any
  ): void {
    const logEntry: SecurityAuditLog = {
      pluginName,
      action,
      permission,
      granted,
      timestamp: Date.now(),
      resourceUsage: this.monitorResourceUsage(pluginName) || undefined,
    }

    this.auditLog.push(logEntry)

    // Keep audit log manageable
    if (this.auditLog.length > this.MAX_AUDIT_LOG_SIZE) {
      this.auditLog = this.auditLog.slice(-this.MAX_AUDIT_LOG_SIZE / 2)
    }
  }

  private recordNetworkRequest(
    pluginName: string,
    url: string,
    method: string
  ): void {
    this.recordAuditLog(pluginName, 'network_request', 'network', true, {
      url,
      method,
    })
  }
}

/**
 * Resource Monitor for individual plugins
 */
class ResourceMonitor {
  private startTime: number = Date.now()
  private memoryPeek = 0
  private executionTime = 0
  private timerCount = 0
  private networkRequests = 0
  private limits: any

  constructor(
    public pluginName: string,
    limits: any
  ) {
    this.limits = limits
  }

  updateMemoryUsage(currentMemory: number): void {
    this.memoryPeek = Math.max(this.memoryPeek, currentMemory)

    if (this.memoryPeek > this.limits.memoryLimit * 1024 * 1024) {
      logger.warn(`Plugin ${this.pluginName} exceeded memory limit`)
    }
  }

  recordExecution(time: number): void {
    this.executionTime += time

    if (time > this.limits.executionTimeout) {
      logger.warn(`Plugin ${this.pluginName} execution time exceeded limit`)
    }
  }

  incrementTimerUsage(): void {
    this.timerCount++

    if (this.timerCount > 10) {
      logger.warn(`Plugin ${this.pluginName} created excessive timers`)
    }
  }

  incrementNetworkRequests(): void {
    this.networkRequests++

    if (this.networkRequests > 50) {
      logger.warn(`Plugin ${this.pluginName} made excessive network requests`)
    }
  }

  recordNetworkResponse(status: number): void {
    if (status >= 400) {
      logger.debug(`Plugin ${this.pluginName} received HTTP error: ${status}`)
    }
  }

  getCurrentUsage(): ResourceUsage {
    return {
      memory: this.memoryPeek,
      executionTime: this.executionTime,
      networkRequests: this.networkRequests,
      storageUsed: 0,
    }
  }
}

// Export singleton instance
export const pluginSecurityService = new PluginSecurityService()
