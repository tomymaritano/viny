import React from 'react'
import { featureFlags } from '../config/featureFlags'
import ExportDialog from './ExportDialog'
import ExportDialogV2 from './ExportDialogV2'

interface ExportDialogWrapperProps {
  isVisible: boolean
  onClose: () => void
  notes?: any[]
  selectedNotes?: any[]
  type?: 'single' | 'multiple'
}

/**
 * Wrapper component that conditionally renders V1 or V2 ExportDialog
 * based on the clean architecture feature flag
 */
export const ExportDialogWrapper: React.FC<ExportDialogWrapperProps> = (props) => {
  // ExportDialogV2 is ready to use
  if (featureFlags.useCleanArchitecture) {
    return <ExportDialogV2 {...props} />
  }
  
  return <ExportDialog {...props} />
}

export default ExportDialogWrapper