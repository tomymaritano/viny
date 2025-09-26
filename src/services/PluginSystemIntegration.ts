/**
 * Plugin System Integration
 * Bridges the enhanced plugin system with existing UI components
 */

import { createEnhancedPluginAPI } from '../lib/pluginApiEnhanced'
import { enhancedPluginSecurityService } from './EnhancedPluginSecurityService'
import { pluginService } from './PluginService'
import { logger } from '../utils/logger'

/**
 * Enhanced Plugin Service that integrates with existing components
 */
export class PluginSystemIntegration {
  private static instance: PluginSystemIntegration | null = null

  static getInstance(): PluginSystemIntegration {
    if (!this.instance) {
      this.instance = new PluginSystemIntegration()
    }
    return this.instance
  }

  /**
   * Initialize a plugin with enhanced API and security
   */
  async initializeEnhancedPlugin(
    pluginName: string,
    manifestData: any
  ): Promise<{
    api: any
    security: any
    success: boolean
    error?: string
  }> {
    try {
      logger.info(`Initializing enhanced plugin: ${pluginName}`)

      // Register security policy
      await enhancedPluginSecurityService.registerPlugin(pluginName, {
        permissions: manifestData.permissions || ['notes.read'],
        resourceLimits: {
          maxMemoryMB: manifestData.resourceLimits?.maxMemoryMB || 50,
          maxExecutionTimeMs:
            manifestData.resourceLimits?.maxExecutionTimeMs || 5000,
          maxNetworkRequests:
            manifestData.resourceLimits?.maxNetworkRequests || 10,
          maxStorageMB: manifestData.resourceLimits?.maxStorageMB || 10,
          maxConcurrentOperations:
            manifestData.resourceLimits?.maxConcurrentOperations || 3,
        },
        sandboxLevel: manifestData.sandboxLevel || 'strict',
        trustedOrigins: manifestData.trustedOrigins || [],
        allowedDomains: manifestData.allowedDomains || [],
      })

      // Get security policy
      const policy =
        enhancedPluginSecurityService.getAuditReport(pluginName).policy
      if (!policy) {
        throw new Error('Failed to create security policy')
      }

      // Create enhanced API
      const enhancedAPI = createEnhancedPluginAPI(pluginName, policy)

      // Create security interface for plugin
      const securityInterface = {
        startOperation: (operationId: string) =>
          enhancedPluginSecurityService.startOperation(pluginName, operationId),
        validatePermission: (permission: string) =>
          enhancedPluginSecurityService.validatePermission(
            pluginName,
            permission
          ),
        getAuditReport: () =>
          enhancedPluginSecurityService.getAuditReport(pluginName),
      }

      logger.info(`Enhanced plugin ${pluginName} initialized successfully`)

      return {
        api: enhancedAPI,
        security: securityInterface,
        success: true,
      }
    } catch (error) {
      logger.error(`Failed to initialize enhanced plugin ${pluginName}:`, error)
      return {
        api: null,
        security: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get comprehensive plugin statistics for UI display
   */
  getPluginStatistics(): {
    totalPlugins: number
    activePlugins: number
    securitySummary: any
    pluginDetails: Array<{
      name: string
      status: 'active' | 'suspended' | 'error'
      riskLevel: string
      violations: number
      resourceUsage: any
    }>
  } {
    const securitySummary = enhancedPluginSecurityService.getSecuritySummary()
    const installedPlugins = pluginService.getInstalledPlugins()

    const pluginDetails = installedPlugins.map(plugin => {
      const auditReport = enhancedPluginSecurityService.getAuditReport(
        plugin.manifest.name
      )

      return {
        name: plugin.manifest.name,
        status: plugin.enabled
          ? auditReport.policy?.permissions.length === 0
            ? 'suspended'
            : 'active'
          : 'error',
        riskLevel: auditReport.riskLevel,
        violations: auditReport.violations.length,
        resourceUsage: auditReport.metrics,
      }
    })

    return {
      totalPlugins: installedPlugins.length,
      activePlugins: securitySummary.activePlugins,
      securitySummary,
      pluginDetails,
    }
  }

  /**
   * Enhanced plugin installation with security validation
   */
  async installPluginEnhanced(
    source: File | string,
    options: {
      trusted?: boolean
      customPermissions?: string[]
      customLimits?: any
    } = {}
  ): Promise<{
    success: boolean
    pluginName?: string
    error?: string
    securityWarnings?: string[]
  }> {
    try {
      logger.info('Starting enhanced plugin installation')

      // First, install using existing service
      const installResult = await pluginService.installPlugin(source, {
        trusted: options.trusted || false,
      })

      if (!installResult.success) {
        return {
          success: false,
          error: installResult.error,
        }
      }

      const pluginName = installResult.pluginName!
      const plugin = pluginService
        .getInstalledPlugins()
        .find(p => p.manifest.name === pluginName)

      if (!plugin) {
        return {
          success: false,
          error: 'Plugin installation succeeded but plugin not found',
        }
      }

      // Enhanced security setup
      const securityWarnings: string[] = []

      // Validate permissions
      const requestedPermissions =
        options.customPermissions || plugin.manifest.permissions || []
      const riskAnalysis = this.analyzePermissionRisk(requestedPermissions)

      if (riskAnalysis.riskLevel === 'high') {
        securityWarnings.push('Plugin requests high-risk permissions')
      }

      // Initialize with enhanced system
      const enhancedInit = await this.initializeEnhancedPlugin(pluginName, {
        ...plugin.manifest,
        permissions: requestedPermissions,
        resourceLimits: options.customLimits,
      })

      if (!enhancedInit.success) {
        // Rollback installation
        await pluginService.uninstallPlugin(pluginName)
        return {
          success: false,
          error: `Enhanced initialization failed: ${enhancedInit.error}`,
        }
      }

      logger.info(`Enhanced plugin installation completed: ${pluginName}`)

      return {
        success: true,
        pluginName,
        securityWarnings,
      }
    } catch (error) {
      logger.error('Enhanced plugin installation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Analyze permission risk level
   */
  private analyzePermissionRisk(permissions: string[]): {
    riskLevel: 'low' | 'medium' | 'high'
    riskFactors: string[]
  } {
    const riskFactors: string[] = []
    let riskScore = 0

    // High-risk permissions
    if (permissions.includes('notes.delete')) {
      riskFactors.push('Can delete notes permanently')
      riskScore += 3
    }
    if (permissions.includes('storage.access')) {
      riskFactors.push('Can access local storage')
      riskScore += 2
    }
    if (permissions.includes('network.fetch')) {
      riskFactors.push('Can make network requests')
      riskScore += 2
    }
    if (permissions.includes('*')) {
      riskFactors.push('Requests all permissions')
      riskScore += 5
    }

    // Medium-risk permissions
    if (permissions.includes('notes.write')) {
      riskFactors.push('Can modify notes')
      riskScore += 1
    }
    if (permissions.includes('ui.modify')) {
      riskFactors.push('Can modify user interface')
      riskScore += 1
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (riskScore >= 5) riskLevel = 'high'
    else if (riskScore >= 2) riskLevel = 'medium'

    return { riskLevel, riskFactors }
  }

  /**
   * Get real-time security monitoring data for dashboard
   */
  getSecurityDashboardData(): {
    alerts: Array<{
      level: 'info' | 'warning' | 'error'
      message: string
      pluginName?: string
      timestamp: number
    }>
    resourceUsage: {
      totalMemoryMB: number
      averageExecutionTime: number
      totalOperations: number
    }
    riskDistribution: {
      low: number
      medium: number
      high: number
      critical: number
    }
  } {
    const summary = enhancedPluginSecurityService.getSecuritySummary()
    const stats = this.getPluginStatistics()

    const alerts = []

    // Generate alerts based on current state
    if (summary.highRiskPlugins.length > 0) {
      alerts.push({
        level: 'error' as const,
        message: `${summary.highRiskPlugins.length} high-risk plugins detected`,
        timestamp: Date.now(),
      })
    }

    if (summary.totalViolations > 10) {
      alerts.push({
        level: 'warning' as const,
        message: `${summary.totalViolations} security violations recorded`,
        timestamp: Date.now(),
      })
    }

    // Calculate risk distribution
    const riskDistribution = stats.pluginDetails.reduce(
      (acc, plugin) => {
        acc[plugin.riskLevel as keyof typeof acc]++
        return acc
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    )

    return {
      alerts,
      resourceUsage: {
        totalMemoryMB: summary.resourceUsage.totalMemory / (1024 * 1024),
        averageExecutionTime: summary.resourceUsage.averageExecutionTime,
        totalOperations: summary.resourceUsage.totalOperations,
      },
      riskDistribution,
    }
  }

  /**
   * Emergency plugin suspension
   */
  async emergencySuspendPlugin(
    pluginName: string,
    reason: string
  ): Promise<void> {
    logger.warn(`Emergency suspension of plugin ${pluginName}: ${reason}`)

    // Suspend in security service
    enhancedPluginSecurityService.suspendPlugin(pluginName, reason)

    // Disable in plugin service
    await pluginService.disablePlugin(pluginName)

    // Record critical violation
    enhancedPluginSecurityService.recordViolation(
      pluginName,
      `Emergency suspension: ${reason}`,
      'critical'
    )
  }
}

// Export singleton instance
export const pluginSystemIntegration = PluginSystemIntegration.getInstance()
