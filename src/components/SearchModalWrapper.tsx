import React from 'react'
import { featureFlags } from '../config/featureFlags'
import { SearchModalEnhanced } from './SearchModalEnhanced'
import { SearchModalWithQuery } from './SearchModalWithQuery'

interface SearchModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  onSelectNote: (noteId: string) => void
}

/**
 * Wrapper component that conditionally renders SearchModalEnhanced or SearchModalWithQuery
 * based on the feature flag
 * 
 * Note: We use SearchModalEnhanced as the default since it has semantic search capabilities
 */
export const SearchModalWrapper: React.FC<SearchModalWrapperProps> = (props) => {
  // Use query version if feature flag is enabled
  if (featureFlags.useQueryForSearch) {
    return <SearchModalWithQuery {...props} />
  }
  
  // Otherwise use the enhanced version with semantic search
  return <SearchModalEnhanced {...props} />
}