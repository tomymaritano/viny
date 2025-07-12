/**
 * Hook for managing sidebar dropdown states
 */
import { useState, useCallback } from 'react'

export const useSidebarDropdowns = () => {
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [activeTagDropdown, setActiveTagDropdown] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    notebooks: true,
    tags: true,
  })

  // Toggle section expansion
  const toggleSection = useCallback(sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }, [])

  // Expand a specific section
  const expandSection = useCallback(sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true,
    }))
  }, [])

  // Collapse a specific section
  const collapseSection = useCallback(sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: false,
    }))
  }, [])

  // Toggle tag dropdown
  const toggleTagDropdown = useCallback(tagName => {
    setActiveTagDropdown(prev => (prev === tagName ? null : tagName))
  }, [])

  // Close tag dropdown
  const closeTagDropdown = useCallback(() => {
    setActiveTagDropdown(null)
  }, [])

  // Toggle tags dropdown visibility
  const toggleTagsDropdown = useCallback(() => {
    setShowTagsDropdown(prev => !prev)
  }, [])

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setActiveTagDropdown(null)
    setShowTagsDropdown(false)
  }, [])

  return {
    // States
    showTagsDropdown,
    activeTagDropdown,
    expandedSections,

    // Section handlers
    toggleSection,
    expandSection,
    collapseSection,

    // Tag dropdown handlers
    toggleTagDropdown,
    closeTagDropdown,
    toggleTagsDropdown,

    // General
    closeAllDropdowns,
  }
}
