import React from 'react'
import { LegacyTabs } from '../ui/TabsRadix'

interface Tab {
  id: string
  label: string
  icon: string
}

interface SettingsTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <LegacyTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
  )
}

export default SettingsTabs
