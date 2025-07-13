// Refactored Sidebar component with improved modularity and separation of concerns
import React, { memo } from 'react'
import SidebarContainer from '../sidebar/SidebarContainer'
import SettingsButton from '../sidebar/SettingsButton'
import SidebarLogicProvider from '../sidebar/SidebarLogicProvider'
import SidebarContent from '../sidebar/SidebarContent'

/**
 * Main Sidebar component - now much cleaner and focused only on composition
 * All logic has been moved to SidebarLogicProvider and SidebarContent
 * 
 * Before: 338 lines with mixed concerns
 * After: ~30 lines focused on composition only
 */
const SidebarSimple: React.FC = memo(() => {
  return (
    <SidebarLogicProvider>
      <SidebarContainer>
        {/* Main sidebar content */}
        <SidebarContent />
        
        {/* Settings button at bottom */}
        <SettingsButton />
      </SidebarContainer>
    </SidebarLogicProvider>
  )
})

SidebarSimple.displayName = 'SidebarSimple'

export default SidebarSimple