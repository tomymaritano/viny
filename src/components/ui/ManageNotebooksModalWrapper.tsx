import React from 'react'
import { featureFlags } from '../../config/featureFlags'
import ManageNotebooksModal from './ManageNotebooksModal'
import ManageNotebooksModalV2 from './ManageNotebooksModalV2'

interface ManageNotebooksModalWrapperProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Wrapper component that conditionally renders V1 or V2 ManageNotebooksModal
 * based on the clean architecture feature flag
 */
export const ManageNotebooksModalWrapper: React.FC<ManageNotebooksModalWrapperProps> = (props) => {
  // ManageNotebooksModalV2 is ready to use
  if (featureFlags.useCleanArchitecture) {
    return <ManageNotebooksModalV2 {...props} />
  }
  
  return <ManageNotebooksModal {...props} />
}

export default ManageNotebooksModalWrapper