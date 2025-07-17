/**
 * Enhanced E2E Test Configuration
 * Centralized configuration for timeouts, retries, and test stability
 */

export const TestConfig = {
  // Global timeouts (in milliseconds)
  timeouts: {
    default: 10000,        // Default element wait
    navigation: 15000,     // Page navigation
    saveOperation: 8000,   // Save operations
    searchOperation: 5000, // Search operations
    modalOperation: 3000,  // Modal open/close
    networkRequest: 20000, // Network requests
    longOperation: 30000   // Long running operations
  },

  // Retry strategies
  retries: {
    default: 3,           // Default retry count
    flaky: 5,            // For known flaky operations
    network: 4,          // Network-dependent operations
    critical: 2          // Critical path operations
  },

  // Delay configurations
  delays: {
    default: 1000,       // Default retry delay
    short: 500,          // Short operations
    medium: 1500,        // Medium operations
    long: 3000,          // Long operations
    autoSave: 2000       // Auto-save operations
  },

  // Element selectors with timeout overrides
  selectors: {
    app: {
      container: '[data-testid="app-container"]',
      timeout: 15000
    },
    editor: {
      container: '[data-testid="note-editor"]',
      content: '[data-testid="note-editor"] .cm-content',
      timeout: 10000
    },
    notes: {
      list: '[data-testid="notes-list"]',
      item: '[data-testid="note-item"]',
      createButton: '[data-testid="create-note-button"]',
      timeout: 8000
    },
    search: {
      modal: '[data-testid="search-modal"]',
      input: '[data-testid="search-input"]',
      results: '[data-testid="search-results"]',
      resultItem: '[data-testid="search-result-item"]',
      timeout: 5000
    },
    ui: {
      saveIndicator: '[data-testid="save-indicator"]',
      errorMessage: '[data-testid="error-message"]',
      loadingSpinner: '[data-testid="loading-spinner"]',
      timeout: 8000
    }
  },

  // Test stability settings
  stability: {
    enableRetries: true,
    enableBackoff: true,
    enableSmartWaits: true,
    enableStabilityChecks: true,
    stabilityCheckInterval: 100,
    requiredStabilityChecks: 3
  },

  // Performance settings
  performance: {
    enableParallelization: true,
    maxWorkers: 4,
    enableSharding: false,
    enableTracing: process.env.CI === 'true',
    enableScreenshots: process.env.CI === 'true' || process.env.DEBUG === 'true'
  },

  // Error handling
  errorHandling: {
    screenshotOnFailure: true,
    videoOnFailure: process.env.CI === 'true',
    retryOnTimeout: true,
    retryOnNetworkError: true,
    gracefulDegradation: true
  },

  // Browser settings
  browser: {
    headless: process.env.CI === 'true',
    slowMo: process.env.DEBUG === 'true' ? 100 : 0,
    devtools: process.env.DEBUG === 'true',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezone: 'UTC'
  },

  // Test data settings
  testData: {
    cleanupAfterTest: true,
    useFixtures: true,
    generateRandomData: true,
    preserveData: process.env.PRESERVE_TEST_DATA === 'true'
  }
};

/**
 * Get timeout value for specific operation
 */
export function getTimeout(operation: keyof typeof TestConfig.timeouts): number {
  return TestConfig.timeouts[operation] || TestConfig.timeouts.default;
}

/**
 * Get retry count for specific operation type
 */
export function getRetryCount(operationType: keyof typeof TestConfig.retries): number {
  return TestConfig.retries[operationType] || TestConfig.retries.default;
}

/**
 * Get delay for specific operation type
 */
export function getDelay(delayType: keyof typeof TestConfig.delays): number {
  return TestConfig.delays[delayType] || TestConfig.delays.default;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof TestConfig.stability): boolean {
  return TestConfig.stability[feature] as boolean;
}

/**
 * Environment-specific configuration overrides
 */
export const EnvironmentConfig = {
  ci: {
    timeouts: {
      ...TestConfig.timeouts,
      default: TestConfig.timeouts.default * 1.5,
      navigation: TestConfig.timeouts.navigation * 2
    },
    retries: {
      ...TestConfig.retries,
      default: TestConfig.retries.default * 2
    }
  },
  
  local: {
    timeouts: TestConfig.timeouts,
    retries: {
      ...TestConfig.retries,
      default: Math.max(1, TestConfig.retries.default - 1)
    }
  },

  debug: {
    timeouts: {
      ...TestConfig.timeouts,
      default: TestConfig.timeouts.default * 3
    },
    retries: {
      ...TestConfig.retries,
      default: 1 // Fewer retries in debug mode
    }
  }
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  if (process.env.CI === 'true') {
    return EnvironmentConfig.ci;
  }
  if (process.env.DEBUG === 'true') {
    return EnvironmentConfig.debug;
  }
  return EnvironmentConfig.local;
}