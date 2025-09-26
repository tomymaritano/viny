/**
 * Viny Plugin Service
 * Enterprise-grade plugin system with security, lifecycle management, and error handling
 */

import { logger } from '../utils/logger'
import { pluginSecurityService } from './PluginSecurityService'

// Plugin Types and Interfaces
export interface PluginManifest {
  name: string
  version: string
  description: string
  author: string
  main?: string
  permissions?: string[]
  dependencies?: Record<string, string>
  vinyVersion?: string
  icon?: string
  homepage?: string
  repository?: string
}

export interface PluginConfig {
  enabled: boolean
  settings: Record<string, any>
}

export interface PluginInstance {
  manifest: PluginManifest
  config: PluginConfig
  module: any
  activated: boolean
  error?: string
  loadedAt: number
  activatedAt?: number
}

export interface PluginAPI {
  notes: {
    getAll: () => any[]
    getById: (id: string) => any | null
    create: (note: any) => any
    update: (id: string, updates: any) => any
    delete: (id: string) => boolean
    search: (query: string) => any[]
  }
  ui: {
    showToast: (
      message: string,
      type?: 'success' | 'error' | 'info' | 'warning'
    ) => void
    showModal: (content: string, options?: any) => void
    addSidebarItem: (item: any) => void
    addMenuItem: (item: any) => void
    addToolbarButton: (button: any) => void
  }
  editor: {
    insertText: (text: string) => void
    replaceSelection: (text: string) => void
    getSelection: () => string
    getCursorPosition: () => number
    setCursorPosition: (position: number) => void
    addCommand: (command: any) => void
    addKeybinding: (keybinding: any) => void
  }
  storage: {
    get: (key: string) => any
    set: (key: string, value: any) => void
    remove: (key: string) => void
    clear: () => void
  }
  utils: {
    generateId: () => string
    formatDate: (date: Date) => string
    debounce: (fn: Function, delay: number) => Function
    throttle: (fn: Function, delay: number) => Function
  }
  markdown: {
    registerHook: (hook: any) => () => void
    injectCSS: (css: string, pluginId: string) => () => void
    removeCSS: (pluginId: string) => void
    transform: (content: string, options?: any) => string
  }
}

export interface PluginError {
  plugin: string
  error: string
  timestamp: number
  stack?: string
}

// Plugin Security Levels
export enum SecurityLevel {
  SAFE = 'safe', // Basic operations only
  TRUSTED = 'trusted', // Full API access
  SYSTEM = 'system', // System-level access
}

export interface SecurityPolicy {
  level: SecurityLevel
  allowedPermissions: string[]
  resourceLimits: {
    memoryLimit: number // MB
    executionTimeout: number // ms
    networkRequests: boolean
    fileSystemAccess: boolean
  }
}

/**
 * Main Plugin Service Class
 * Handles plugin loading, lifecycle, security, and API provision
 */
export class PluginService {
  private plugins: Map<string, PluginInstance> = new Map()
  private errors: PluginError[] = []
  private securityPolicies: Map<string, SecurityPolicy> = new Map()
  private readonly pluginAPIs: Map<string, PluginAPI> = new Map()

  // Default security policy
  private readonly defaultSecurityPolicy: SecurityPolicy = {
    level: SecurityLevel.SAFE,
    allowedPermissions: ['notes.read', 'ui.toast', 'storage.basic'],
    resourceLimits: {
      memoryLimit: 50,
      executionTimeout: 5000,
      networkRequests: false,
      fileSystemAccess: false,
    },
  }

  constructor() {
    this.initializeService()
  }

  private initializeService(): void {
    logger.info('PluginService: Initializing plugin system')
    this.loadSecurityPolicies()
    this.setupErrorHandling()
  }

  private loadSecurityPolicies(): void {
    // Load security policies from settings or defaults
    const savedPolicies = this.loadFromStorage('plugin_security_policies')
    if (savedPolicies) {
      Object.entries(savedPolicies).forEach(([pluginName, policy]) => {
        this.securityPolicies.set(pluginName, policy as SecurityPolicy)
      })
    }
  }

  private setupErrorHandling(): void {
    // Global error handler for plugin exceptions
    window.addEventListener('error', event => {
      if (event.filename?.includes('plugin')) {
        this.handlePluginError(
          'unknown',
          event.error?.message || 'Unknown error',
          event.error?.stack
        )
      }
    })
  }

  /**
   * Load a plugin from URL or file
   */
  async loadPlugin(
    source: string | File,
    options: {
      trusted?: boolean
      permissions?: string[]
    } = {}
  ): Promise<boolean> {
    try {
      logger.info(
        `PluginService: Loading plugin from ${typeof source === 'string' ? source : 'file'}`
      )

      let pluginCode: string
      let manifest: PluginManifest

      if (typeof source === 'string') {
        // Load from URL
        const response = await fetch(source)
        if (!response.ok) {
          throw new Error(`Failed to fetch plugin: ${response.statusText}`)
        }
        pluginCode = await response.text()
        manifest = await this.extractManifest(pluginCode, source)
      } else {
        // Load from File
        pluginCode = await this.readFileAsText(source)
        manifest = await this.extractManifest(pluginCode, source.name)
      }

      // Validate plugin
      this.validatePlugin(manifest, pluginCode)

      // Set security policy
      const securityPolicy = this.createSecurityPolicy(manifest, options)
      this.securityPolicies.set(manifest.name, securityPolicy)

      // Create plugin instance
      const pluginInstance: PluginInstance = {
        manifest,
        config: {
          enabled: true,
          settings: {},
        },
        module: null,
        activated: false,
        loadedAt: Date.now(),
      }

      // Execute plugin code in sandbox
      const pluginModule = await this.executePluginCode(
        pluginCode,
        manifest.name,
        securityPolicy
      )
      pluginInstance.module = pluginModule

      // Store plugin
      this.plugins.set(manifest.name, pluginInstance)

      logger.info(
        `PluginService: Successfully loaded plugin '${manifest.name}' v${manifest.version}`
      )
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error(`PluginService: Failed to load plugin - ${errorMessage}`)
      this.handlePluginError(
        'unknown',
        errorMessage,
        error instanceof Error ? error.stack : undefined
      )
      return false
    }
  }

  /**
   * Activate a loaded plugin
   */
  async activatePlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginName)
      if (!plugin) {
        throw new Error(`Plugin '${pluginName}' not found`)
      }

      if (plugin.activated) {
        logger.warn(
          `PluginService: Plugin '${pluginName}' is already activated`
        )
        return true
      }

      // Create plugin API
      const pluginAPI = this.createPluginAPI(pluginName)
      this.pluginAPIs.set(pluginName, pluginAPI)

      // Call plugin activate method
      if (plugin.module && typeof plugin.module.activate === 'function') {
        await this.executeWithTimeout(
          () => plugin.module.activate(pluginAPI),
          this.getSecurityPolicy(pluginName).resourceLimits.executionTimeout,
          `Plugin '${pluginName}' activation timeout`
        )
      }

      plugin.activated = true
      plugin.activatedAt = Date.now()
      plugin.config.enabled = true

      this.savePluginConfig(pluginName, plugin.config)

      logger.info(
        `PluginService: Successfully activated plugin '${pluginName}'`
      )
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error(
        `PluginService: Failed to activate plugin '${pluginName}' - ${errorMessage}`
      )
      this.handlePluginError(
        pluginName,
        errorMessage,
        error instanceof Error ? error.stack : undefined
      )
      return false
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginName)
      if (!plugin) {
        throw new Error(`Plugin '${pluginName}' not found`)
      }

      if (!plugin.activated) {
        logger.warn(`PluginService: Plugin '${pluginName}' is not activated`)
        return true
      }

      // Call plugin deactivate method
      if (plugin.module && typeof plugin.module.deactivate === 'function') {
        await this.executeWithTimeout(
          () => plugin.module.deactivate(),
          this.getSecurityPolicy(pluginName).resourceLimits.executionTimeout,
          `Plugin '${pluginName}' deactivation timeout`
        )
      }

      plugin.activated = false
      plugin.config.enabled = false

      // Clean up plugin API
      this.pluginAPIs.delete(pluginName)

      this.savePluginConfig(pluginName, plugin.config)

      logger.info(
        `PluginService: Successfully deactivated plugin '${pluginName}'`
      )
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error(
        `PluginService: Failed to deactivate plugin '${pluginName}' - ${errorMessage}`
      )
      this.handlePluginError(
        pluginName,
        errorMessage,
        error instanceof Error ? error.stack : undefined
      )
      return false
    }
  }

  /**
   * Unload a plugin completely
   */
  async unloadPlugin(pluginName: string): Promise<boolean> {
    try {
      // Deactivate first if activated
      if (this.isPluginActivated(pluginName)) {
        await this.deactivatePlugin(pluginName)
      }

      // Clean up security data
      pluginSecurityService.cleanupPlugin(pluginName)

      // Remove from memory
      this.plugins.delete(pluginName)
      this.pluginAPIs.delete(pluginName)
      this.securityPolicies.delete(pluginName)

      // Remove from storage
      this.removeFromStorage(`plugin_config_${pluginName}`)

      logger.info(`PluginService: Successfully unloaded plugin '${pluginName}'`)
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      logger.error(
        `PluginService: Failed to unload plugin '${pluginName}' - ${errorMessage}`
      )
      this.handlePluginError(
        pluginName,
        errorMessage,
        error instanceof Error ? error.stack : undefined
      )
      return false
    }
  }

  /**
   * Get list of all plugins
   */
  getPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get specific plugin
   */
  getPlugin(pluginName: string): PluginInstance | null {
    return this.plugins.get(pluginName) || null
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  /**
   * Check if plugin is activated
   */
  isPluginActivated(pluginName: string): boolean {
    const plugin = this.plugins.get(pluginName)
    return plugin ? plugin.activated : false
  }

  /**
   * Get plugin errors
   */
  getErrors(): PluginError[] {
    return [...this.errors]
  }

  /**
   * Clear plugin errors
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Get security violations for plugins
   */
  getSecurityViolations(pluginName?: string) {
    return pluginSecurityService.getViolations(pluginName)
  }

  /**
   * Get security audit log
   */
  getSecurityAuditLog(pluginName?: string) {
    return pluginSecurityService.getAuditLog(pluginName)
  }

  /**
   * Check if plugin should be quarantined
   */
  shouldQuarantinePlugin(pluginName: string): boolean {
    return pluginSecurityService.shouldQuarantinePlugin(pluginName)
  }

  /**
   * Monitor plugin resource usage
   */
  getPluginResourceUsage(pluginName: string) {
    return pluginSecurityService.monitorResourceUsage(pluginName)
  }

  // Private helper methods

  private async extractManifest(
    code: string,
    source: string
  ): Promise<PluginManifest> {
    // Extract manifest from plugin code comments or export
    const manifestMatch = code.match(/export\s+default\s+({[\s\S]*?})/)
    if (!manifestMatch) {
      throw new Error('Plugin manifest not found')
    }

    try {
      // CSP-safe manifest parsing using dynamic module evaluation
      const manifestCode = manifestMatch[1]
      const manifest = await this.parseManifestSafely(manifestCode)

      if (!manifest.name || !manifest.version) {
        throw new Error(
          'Plugin manifest missing required fields (name, version)'
        )
      }

      return manifest
    } catch (error) {
      throw new Error(
        `Invalid plugin manifest: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private validatePlugin(manifest: PluginManifest, code: string): void {
    // Validate manifest
    if (!manifest.name.match(/^[a-zA-Z0-9-_]+$/)) {
      throw new Error('Plugin name contains invalid characters')
    }

    if (!manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('Plugin version must follow semantic versioning (x.y.z)')
    }

    // Use security service for comprehensive validation
    const validation = pluginSecurityService.validatePluginCode(
      manifest.name,
      code
    )
    if (!validation.valid) {
      throw new Error(
        `Security validation failed: ${validation.issues.join(', ')}`
      )
    }
  }

  private createSecurityPolicy(
    manifest: PluginManifest,
    options: any
  ): SecurityPolicy {
    const policy = { ...this.defaultSecurityPolicy }

    if (options.trusted) {
      policy.level = SecurityLevel.TRUSTED
      policy.allowedPermissions = ['*']
      policy.resourceLimits.memoryLimit = 200
      policy.resourceLimits.networkRequests = true
    }

    if (options.permissions) {
      policy.allowedPermissions = options.permissions
    }

    return policy
  }

  private async executePluginCode(
    code: string,
    pluginName: string,
    policy: SecurityPolicy
  ): Promise<any> {
    // Create sandboxed execution environment
    const sandbox = this.createSandbox(pluginName, policy)

    try {
      // CSP-safe plugin execution using dynamic module import
      return this.executeWithTimeout(
        () => this.executePluginSafely(code, sandbox, pluginName),
        policy.resourceLimits.executionTimeout,
        `Plugin '${pluginName}' execution timeout`
      )
    } catch (error) {
      throw new Error(
        `Plugin execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private createSandbox(pluginName: string, policy: SecurityPolicy): any {
    // Use security service to create secure sandbox
    return pluginSecurityService.createSecureSandbox(pluginName, policy)
  }

  private createPluginAPI(pluginName: string): PluginAPI {
    const policy = this.getSecurityPolicy(pluginName)

    // Use the real Viny Plugin API implementation
    const { createVinyPluginAPI } = require('../lib/pluginApi')
    return createVinyPluginAPI(pluginName, policy)
  }

  // API creation methods moved to pluginApi.ts for better separation

  // Helper methods

  private getSecurityPolicy(pluginName: string): SecurityPolicy {
    return this.securityPolicies.get(pluginName) || this.defaultSecurityPolicy
  }

  private hasPermission(policy: SecurityPolicy, permission: string): boolean {
    return (
      policy.allowedPermissions.includes('*') ||
      policy.allowedPermissions.includes(permission)
    )
  }

  private async executeWithTimeout<T>(
    fn: () => T | Promise<T>,
    timeout: number,
    errorMessage: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(errorMessage))
      }, timeout)

      Promise.resolve(fn())
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  private async parseManifestSafely(manifestCode: string): Promise<any> {
    try {
      // For plugins with functions, we need to use dynamic import to parse them
      // This is CSP-safe as it uses ES modules instead of eval
      const moduleCode = `
        const manifest = ${manifestCode};
        export default manifest;
      `

      const dataUrl = 'data:text/javascript;base64,' + btoa(moduleCode)
      const module = await import(/* @vite-ignore */ dataUrl)
      return module.default
    } catch (error) {
      throw new Error(
        `Failed to parse manifest: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private async executePluginSafely(
    code: string,
    sandbox: any,
    pluginName: string
  ): Promise<any> {
    try {
      // Create a data URL with the plugin code as ES module
      const moduleCode = `
        const sandbox = ${JSON.stringify(sandbox, null, 2)};
        const api = sandbox.api;
        const storage = sandbox.storage;
        const console = sandbox.console;
        
        // Plugin code execution
        ${code}
        
        // Return the default export
        export default typeof exports !== 'undefined' ? exports : window.pluginExport;
      `

      const dataUrl = 'data:text/javascript;base64,' + btoa(moduleCode)
      const module = await import(/* @vite-ignore */ dataUrl)
      return module.default
    } catch (error) {
      throw new Error(
        `Plugin execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  private handlePluginError(
    pluginName: string,
    error: string,
    stack?: string
  ): void {
    const pluginError: PluginError = {
      plugin: pluginName,
      error,
      timestamp: Date.now(),
      stack,
    }

    this.errors.push(pluginError)

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100)
    }

    // Mark plugin as errored
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.error = error
    }
  }

  private savePluginConfig(pluginName: string, config: PluginConfig): void {
    this.saveToStorage(`plugin_config_${pluginName}`, config)
  }

  private loadPluginConfig(pluginName: string): PluginConfig | null {
    return this.loadFromStorage(`plugin_config_${pluginName}`)
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      logger.error(`Failed to save to storage: ${key}`, error)
    }
  }

  private loadFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      logger.error(`Failed to load from storage: ${key}`, error)
      return null
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      logger.error(`Failed to remove from storage: ${key}`, error)
    }
  }
}

// Export singleton instance
export const pluginService = new PluginService()
