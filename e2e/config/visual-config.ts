/**
 * Visual Regression Testing Configuration
 * Settings for screenshot comparison and visual testing
 */

export const VisualConfig = {
  // Screenshot comparison settings
  comparison: {
    threshold: 0.2,           // Pixel difference threshold (0-1)
    maxDiffPixels: 100,       // Maximum different pixels allowed
    animations: 'disabled',   // Disable animations for consistency
    mode: 'css',             // Animation mode
  },

  // Screenshot capture settings
  capture: {
    fullPage: false,         // Default to element screenshots
    omitBackground: false,   // Include background
    clip: undefined,         // No clipping by default
    quality: 90,            // JPEG quality (if applicable)
  },

  // Browser-specific settings
  browsers: {
    chromium: {
      threshold: 0.2,
      maxDiffPixels: 100,
    },
    firefox: {
      threshold: 0.3,        // Firefox rendering slight differences
      maxDiffPixels: 150,
    },
    webkit: {
      threshold: 0.3,        // Safari rendering differences
      maxDiffPixels: 150,
    }
  },

  // Viewport configurations for responsive testing
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    wide: { width: 1920, height: 1080 }
  },

  // Theme configurations
  themes: {
    light: { colorScheme: 'light' as const },
    dark: { colorScheme: 'dark' as const }
  },

  // Component-specific settings
  components: {
    sidebar: {
      threshold: 0.1,        // Sidebar is usually stable
      clip: { x: 0, y: 0, width: 300, height: 600 }
    },
    editor: {
      threshold: 0.3,        // Editor content can vary
      maxDiffPixels: 200,
    },
    modal: {
      threshold: 0.2,
      omitBackground: true,  // Focus on modal content
    },
    list: {
      threshold: 0.25,       // Lists can have dynamic content
      maxDiffPixels: 150,
    }
  },

  // Error handling for visual tests
  errorHandling: {
    updateOnMismatch: false, // Don't auto-update in CI
    generateDiffImage: true, // Generate diff images on failure
    failOnMissing: true,     // Fail if baseline doesn't exist
  },

  // Performance settings for visual tests
  performance: {
    enableParallel: true,    // Run visual tests in parallel
    enableSharding: false,   // Don't shard visual tests (consistency)
    timeout: 30000,          // Visual test timeout
  }
};

/**
 * Get browser-specific visual settings
 */
export function getBrowserVisualConfig(browserName: string) {
  const browserConfig = VisualConfig.browsers[browserName as keyof typeof VisualConfig.browsers];
  return {
    ...VisualConfig.comparison,
    ...browserConfig
  };
}

/**
 * Get component-specific visual settings
 */
export function getComponentVisualConfig(componentName: string) {
  const componentConfig = VisualConfig.components[componentName as keyof typeof VisualConfig.components];
  return {
    ...VisualConfig.comparison,
    ...VisualConfig.capture,
    ...componentConfig
  };
}

/**
 * Screenshot naming convention
 */
export function getScreenshotName(
  testName: string,
  browser?: string,
  viewport?: string,
  theme?: string
): string {
  const parts = [testName];
  
  if (browser) parts.push(browser);
  if (viewport) parts.push(viewport);
  if (theme) parts.push(theme);
  
  return parts.join('-') + '.png';
}

/**
 * Environment-specific visual settings
 */
export const VisualEnvironmentConfig = {
  ci: {
    ...VisualConfig,
    comparison: {
      ...VisualConfig.comparison,
      threshold: VisualConfig.comparison.threshold * 1.5, // More lenient in CI
      maxDiffPixels: VisualConfig.comparison.maxDiffPixels * 1.5
    },
    errorHandling: {
      ...VisualConfig.errorHandling,
      updateOnMismatch: false, // Never auto-update in CI
      generateDiffImage: true,
    }
  },

  local: {
    ...VisualConfig,
    comparison: {
      ...VisualConfig.comparison,
      threshold: VisualConfig.comparison.threshold * 0.8, // Stricter locally
    },
    errorHandling: {
      ...VisualConfig.errorHandling,
      updateOnMismatch: process.env.UPDATE_SNAPSHOTS === 'true',
      generateDiffImage: true,
    }
  },

  debug: {
    ...VisualConfig,
    capture: {
      ...VisualConfig.capture,
      fullPage: true, // Full page screenshots in debug
    },
    performance: {
      ...VisualConfig.performance,
      enableParallel: false, // Sequential execution in debug
    }
  }
};

/**
 * Get environment-specific visual configuration
 */
export function getVisualEnvironmentConfig() {
  if (process.env.CI === 'true') {
    return VisualEnvironmentConfig.ci;
  }
  if (process.env.DEBUG === 'true') {
    return VisualEnvironmentConfig.debug;
  }
  return VisualEnvironmentConfig.local;
}