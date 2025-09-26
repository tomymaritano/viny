/**
 * SettingsModalWrapper - Conditionally renders V1 or V2 based on feature flag
 */

import React from 'react'
import { featureFlags } from '../../config/featureFlags'
import SettingsModal from './SettingsModal'
import SettingsModalV2 from './SettingsModalV2'

interface SettingsModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: string
}

/**
 * Wrapper component that selects the appropriate SettingsModal implementation
 * based on the feature flag for clean architecture
 */
const SettingsModalWrapper: React.FC<SettingsModalWrapperProps> = (props) => {
  // Use V2 if clean architecture is enabled
  if (featureFlags.useCleanArchitecture) {
    return <SettingsModalV2 {...props} />
  }
  
  // Otherwise use the existing V1 implementation
  return <SettingsModal {...props} />
}

export default SettingsModalWrapper