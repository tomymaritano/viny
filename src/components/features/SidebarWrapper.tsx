/**
 * SidebarWrapper - Conditionally renders V1 or V2 based on feature flag
 */

import React from 'react'
import { featureFlags } from '../../config/featureFlags'
import SidebarSimple from './SidebarSimple'
import SidebarV2 from './SidebarV2'

/**
 * Wrapper component that selects the appropriate Sidebar implementation
 * based on the feature flag for clean architecture
 */
const SidebarWrapper: React.FC = () => {
  // Use V2 if clean architecture is enabled
  if (featureFlags.useCleanArchitecture) {
    return <SidebarV2 />
  }
  
  // Otherwise use the existing V1 implementation
  return <SidebarSimple />
}

export default SidebarWrapper