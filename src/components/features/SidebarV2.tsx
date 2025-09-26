/**
 * SidebarV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2 + UI-only Store
 */

import React, { memo } from 'react'
import SidebarLogicProviderV2 from '../sidebar/SidebarLogicProviderV2'
import SidebarContentV2 from '../sidebar/SidebarContentV2'

/**
 * Main Sidebar component using clean architecture
 * All data comes from TanStack Query and services
 */
const SidebarV2: React.FC = memo(() => {
  return (
    <SidebarLogicProviderV2>
      <SidebarContentV2 />
    </SidebarLogicProviderV2>
  )
})

SidebarV2.displayName = 'SidebarV2'

export default SidebarV2