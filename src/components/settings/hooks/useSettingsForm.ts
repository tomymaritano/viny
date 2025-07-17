import { useState } from 'react'
import { useSettingsService } from '../../../hooks/useSettingsService'

export const useSettingsForm = (initialTab = 'general') => {
  const { settings, setSetting, resetCategory } = useSettingsService()
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const updateSetting = (key: string, value: any) => {
    setSetting(key, value)
  }

  const handleResetSettings = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to default? This action cannot be undone.'
      )
    ) {
      resetCategory()
    }
  }

  const handleExportSettings = () => {
    const settingsData = JSON.stringify(settings, null, 2)
    const blob = new Blob([settingsData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'viny-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)

        // Validate imported settings structure
        if (typeof importedSettings === 'object' && importedSettings !== null) {
          // Apply imported settings
          Object.keys(importedSettings).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
              updateSetting(key, importedSettings[key])
            }
          })
          alert('Settings imported successfully!')
        } else {
          alert('Invalid settings file format.')
        }
      } catch (error) {
        alert(
          "Error reading settings file. Please make sure it's a valid JSON file."
        )
      }
    }
    reader.readAsText(file)

    // Reset file input
    event.target.value = ''
  }

  return {
    settings,
    activeTab,
    updateSetting,
    handleTabChange,
    handleResetSettings,
    handleExportSettings,
    handleImportSettings,
  }
}
