/**
 * Service Provider for Dependency Injection
 *
 * This implements the Service Provider pattern for dependency injection,
 * allowing services to be injected for testing and configuration.
 *
 * Architecture:
 * - ServiceProvider: React context provider for services
 * - useServices: Hook to access injected services
 * - createTestServices: Utility for creating test service instances
 *
 * Benefits:
 * - 100% testable code (services can be mocked)
 * - Flexible configuration per environment
 * - Clear dependency boundaries
 * - Professional architecture pattern
 *
 * Usage in production:
 * ```tsx
 * // In main.tsx
 * <ServiceProvider>
 *   <App />
 * </ServiceProvider>
 * ```
 *
 * Usage in components:
 * ```tsx
 * const { appInitializationService, themeService } = useServices()
 * await appInitializationService.initialize(deps)
 * ```
 *
 * Usage in tests:
 * ```tsx
 * const mockServices = createTestServices({
 *   appInitializationService: mockInitService
 * })
 *
 * render(
 *   <ServiceProvider services={mockServices}>
 *     <ComponentUnderTest />
 *   </ServiceProvider>
 * )
 * ```
 *
 * @see AppInitializationService For initialization logic
 * @see ThemeService For theme management
 */

import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import {
  AppInitializationService,
  appInitializationService,
} from './AppInitializationService'
import { SecurityService, securityService } from './SecurityService'
// import { ThemeService, themeService } from './ThemeService' // removed - now using settingsStore

export interface ServiceContainer {
  appInitializationService: AppInitializationService
  securityService: SecurityService
  // themeService: ThemeService // removed - now using settingsStore
}

// Default production services
const defaultServices: ServiceContainer = {
  appInitializationService,
  securityService,
  // themeService // removed - now using settingsStore
}

const ServiceContext = createContext<ServiceContainer>(defaultServices)

interface ServiceProviderProps {
  children: ReactNode
  services?: Partial<ServiceContainer>
}

/**
 * Provider component for dependency injection
 * Allows overriding services for testing
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  services = {},
}) => {
  const contextValue: ServiceContainer = {
    ...defaultServices,
    ...services,
  }

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  )
}

/**
 * Hook to access injected services
 */
export const useServices = (): ServiceContainer => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider')
  }
  return context
}

/**
 * Test utilities for service mocking
 */
export const createTestServices = (
  overrides: Partial<ServiceContainer> = {}
): ServiceContainer => {
  return {
    appInitializationService:
      overrides.appInitializationService || new AppInitializationService(),
    securityService: overrides.securityService || SecurityService.getInstance(),
    // themeService: overrides.themeService || new ThemeService(), // removed - now using settingsStore
  }
}
