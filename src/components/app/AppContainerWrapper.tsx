/**
 * AppContainerWrapper - Conditionally renders V1 or V2 based on feature flag
 */

import React from 'react'
import { featureFlags } from '../../config/featureFlags'
import { AppContainer } from './AppContainer'
import { AppContainerV2 } from './AppContainerV2'

/**
 * Wrapper component that selects the appropriate AppContainer implementation
 * based on the feature flag for clean architecture
 */
export const AppContainerWrapper: React.FC = () => {
  // Use V2 if clean architecture is enabled
  if (featureFlags.useCleanArchitecture) {
    return <AppContainerV2 />
  }
  
  // Otherwise use the existing V1 implementation
  return <AppContainer />
}

export default AppContainerWrapper