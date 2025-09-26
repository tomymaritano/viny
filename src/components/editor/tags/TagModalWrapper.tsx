import React from 'react'
import { featureFlags } from '../../../config/featureFlags'
import { TagModal } from './TagModal'
import { TagModalV2 } from './TagModalV2'

interface TagModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  currentTags?: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
  mode?: 'note' | 'global'
  filteredNotes?: any[]
}

/**
 * Wrapper component that conditionally renders V1 or V2 TagModal
 * based on the clean architecture feature flag
 */
export const TagModalWrapper: React.FC<TagModalWrapperProps> = (props) => {
  // TagModalV2 is ready to use
  if (featureFlags.useCleanArchitecture) {
    return <TagModalV2 {...props} />
  }
  
  return <TagModal {...props} />
}

export default TagModalWrapper