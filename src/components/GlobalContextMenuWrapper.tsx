import React from 'react'
import { featureFlags } from '../config/featureFlags'
import GlobalContextMenu from './GlobalContextMenu'
import GlobalContextMenuV2 from './GlobalContextMenuV2'

/**
 * Wrapper component that conditionally renders V1 or V2 GlobalContextMenu
 * based on the clean architecture feature flag
 */
export const GlobalContextMenuWrapper: React.FC = () => {
  // GlobalContextMenuV2 is ready to use
  if (featureFlags.useCleanArchitecture) {
    return <GlobalContextMenuV2 />
  }
  
  return <GlobalContextMenu />
}

export default GlobalContextMenuWrapper