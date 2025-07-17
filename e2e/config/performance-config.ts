/**
 * E2E Test Performance Optimization Configuration
 * Settings for improving test execution speed and parallelization
 */

export const PerformanceConfig = {
  // Parallelization settings
  parallelization: {
    enableFullyParallel: true,
    maxWorkers: {
      local: 4,              // Local development
      ci: 2,                 // CI environment (resource constrained)
      debug: 1               // Debug mode (sequential)
    },
    
    // Test sharding for large test suites
    sharding: {
      enabled: false,        // Enable for very large test suites
      totalShards: 4,        // Total number of shards
      currentShard: 1        // Current shard (1-based)
    }
  },

  // Test grouping and categorization
  testGroups: {
    // Fast tests that can run first
    smoke: {
      timeout: 30000,
      retries: 1,
      pattern: '**/*smoke*.spec.ts'
    },
    
    // Core functionality tests
    core: {
      timeout: 60000,
      retries: 2,
      pattern: '**/note-management.spec.ts'
    },
    
    // UI and visual tests (slower)
    ui: {
      timeout: 90000,
      retries: 3,
      pattern: '**/visual-regression.spec.ts'
    },
    
    // Complex workflow tests
    workflows: {
      timeout: 120000,
      retries: 2,
      pattern: '**/user-workflows.spec.ts'
    },
    
    // Accessibility tests
    accessibility: {
      timeout: 90000,
      retries: 2,
      pattern: '**/accessibility.spec.ts'
    },
    
    // Error handling tests
    errors: {
      timeout: 60000,
      retries: 3,
      pattern: '**/error-states.spec.ts'
    }
  },

  // Resource optimization
  resources: {
    // Browser instance management
    browserReuse: {
      enabled: true,
      maxReuseCount: 10,     // Max tests per browser instance
      resetBetweenTests: true // Reset state between tests
    },
    
    // Memory management
    memory: {
      enableGC: true,        // Force garbage collection
      maxMemoryUsage: '2GB', // Memory limit per worker
      cleanupInterval: 5     // Tests between cleanup
    },
    
    // Network optimization
    network: {
      enableRequestInterception: false, // Disable unless needed
      enableResponseCaching: true,      // Cache static responses
      timeout: 30000                    // Network timeout
    }
  },

  // Test execution optimization
  execution: {
    // Skip expensive operations in CI
    skipInCI: {
      animations: true,      // Skip animation tests
      video: false,          // Skip video recording unless failure
      fullPageScreenshots: false, // Skip full page screenshots
    },
    
    // Test filtering and selection
    filtering: {
      enableSmartSelection: true,    // Run only affected tests
      useTestTags: true,            // Use @smoke, @core tags
      skipKnownFlaky: false         // Skip flaky tests
    },
    
    // Retry strategy optimization
    retries: {
      fastFail: true,        // Fail fast on critical errors
      adaptiveRetries: true, // Adjust retries based on test type
      maxRetryTime: 300000   // Max time spent on retries (5 min)
    }
  },

  // Reporting and monitoring optimization
  reporting: {
    // Lightweight reporting for faster execution
    enableLightweight: {
      local: false,          // Full reporting locally
      ci: true,             // Lightweight reporting in CI
      debug: false          // Full reporting in debug
    },
    
    // Async reporting to not block test execution
    asyncReporting: true,
    
    // Selective artifact collection
    artifacts: {
      screenshots: 'failure-only',
      videos: 'failure-only', 
      traces: 'retry-only'
    }
  }
};

/**
 * Get optimized worker count based on environment
 */
export function getOptimalWorkerCount(): number {
  if (process.env.DEBUG === 'true') {
    return PerformanceConfig.parallelization.maxWorkers.debug;
  }
  
  if (process.env.CI === 'true') {
    return PerformanceConfig.parallelization.maxWorkers.ci;
  }
  
  // Local development - use CPU cores but cap at max
  const cpuCores = require('os').cpus().length;
  const maxLocal = PerformanceConfig.parallelization.maxWorkers.local;
  return Math.min(cpuCores, maxLocal);
}

/**
 * Get test group configuration
 */
export function getTestGroupConfig(groupName: string) {
  return PerformanceConfig.testGroups[groupName as keyof typeof PerformanceConfig.testGroups];
}

/**
 * Check if feature should be skipped in current environment
 */
export function shouldSkipFeature(feature: string): boolean {
  if (process.env.CI !== 'true') {
    return false; // Don't skip anything in local development
  }
  
  const skipConfig = PerformanceConfig.execution.skipInCI;
  return skipConfig[feature as keyof typeof skipConfig] || false;
}

/**
 * Get environment-specific performance configuration
 */
export function getPerformanceConfig() {
  const isCI = process.env.CI === 'true';
  const isDebug = process.env.DEBUG === 'true';
  
  return {
    ...PerformanceConfig,
    
    // Adjust settings based on environment
    parallelization: {
      ...PerformanceConfig.parallelization,
      enableFullyParallel: !isDebug, // Sequential in debug mode
    },
    
    resources: {
      ...PerformanceConfig.resources,
      browserReuse: {
        ...PerformanceConfig.resources.browserReuse,
        enabled: !isDebug, // Fresh browser for each test in debug
      }
    },
    
    reporting: {
      ...PerformanceConfig.reporting,
      enableLightweight: {
        ...PerformanceConfig.reporting.enableLightweight,
        [isCI ? 'ci' : isDebug ? 'debug' : 'local']: true
      }
    }
  };
}

/**
 * Test prioritization for smart execution
 */
export const TestPriority = {
  // Critical tests that should run first
  critical: [
    'note-management.spec.ts',
    'basic-functionality.spec.ts'
  ],
  
  // Important tests
  important: [
    'search.spec.ts',
    'editor.spec.ts',
    'accessibility.spec.ts'
  ],
  
  // Nice-to-have tests
  optional: [
    'visual-regression.spec.ts',
    'error-states.spec.ts',
    'organization.spec.ts'
  ],
  
  // Slow tests that should run last
  slow: [
    'user-workflows.spec.ts',
    'performance.spec.ts'
  ]
};

/**
 * Get test execution order based on priority
 */
export function getTestExecutionOrder(): string[] {
  return [
    ...TestPriority.critical,
    ...TestPriority.important,
    ...TestPriority.optional,
    ...TestPriority.slow
  ];
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitoring = {
  // Track test execution times
  enableTiming: true,
  
  // Memory usage tracking
  enableMemoryTracking: process.env.CI === 'true',
  
  // Resource usage alerts
  resourceAlerts: {
    memoryThreshold: '1.5GB',
    executionTimeThreshold: 300000, // 5 minutes
    failureRateThreshold: 0.1       // 10% failure rate
  },
  
  // Performance metrics to collect
  metrics: [
    'test-duration',
    'memory-usage',
    'browser-startup-time',
    'page-load-time',
    'element-wait-time'
  ]
};