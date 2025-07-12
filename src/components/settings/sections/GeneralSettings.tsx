import React from 'react'
import SettingItem from '../SettingItem'
import Select from '../Select'
import NumberInput from '../NumberInput'
import CustomSwitch from '../../ui/CustomSwitch'

interface Option {
  value: string
  label: string
}

interface Settings {
  theme: string
  autoSave: boolean
  autoSaveInterval: number
  language: string
  startupBehavior: string
  confirmDeletes: boolean
  analytics: boolean
  [key: string]: any
}

interface GeneralSettingsProps {
  settings: Settings
  updateSetting: (key: string, value: any) => void
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, updateSetting }) => {
  const themeOptions: Option[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'solarized', label: 'Solarized' },
    { value: 'system', label: 'System' },
  ]

  const languageOptions: Option[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ]

  const startupBehaviorOptions: Option[] = [
    { value: 'last-note', label: 'Open last note' },
    { value: 'new-note', label: 'Create new note' },
    { value: 'notes-list', label: 'Show notes list' },
    { value: 'empty', label: 'Start empty' },
  ]

  return (
    <div className="space-y-1">
      <SettingItem
        label="Theme"
        description="Choose your preferred color scheme"
      >
        <Select
          value={settings.theme}
          onChange={value => updateSetting('theme', value)}
          options={themeOptions}
        />
      </SettingItem>

      <SettingItem
        label="Auto Save"
        description="Automatically save notes as you type"
      >
        <CustomSwitch
          checked={settings.autoSave}
          onChange={value => updateSetting('autoSave', value)}
        />
      </SettingItem>

      <SettingItem
        label="Auto Save Interval"
        description="How often to auto-save (in seconds)"
      >
        <NumberInput
          value={settings.autoSaveInterval}
          onChange={value => updateSetting('autoSaveInterval', value)}
          min={5}
          max={300}
          step={5}
        />
      </SettingItem>

      <SettingItem label="Language" description="Interface language">
        <Select
          value={settings.language}
          onChange={value => updateSetting('language', value)}
          options={languageOptions}
        />
      </SettingItem>

      <SettingItem
        label="Startup Behavior"
        description="What to do when the app starts"
      >
        <Select
          value={settings.startupBehavior}
          onChange={value => updateSetting('startupBehavior', value)}
          options={startupBehaviorOptions}
        />
      </SettingItem>

      <SettingItem
        label="Confirm Deletes"
        description="Ask for confirmation before deleting notes"
      >
        <CustomSwitch
          checked={settings.confirmDeletes}
          onChange={value => updateSetting('confirmDeletes', value)}
        />
      </SettingItem>

      <SettingItem
        label="Enable Analytics"
        description="Help improve Nototo by sharing anonymous usage data"
      >
        <CustomSwitch
          checked={settings.analytics}
          onChange={value => updateSetting('analytics', value)}
        />
      </SettingItem>
    </div>
  )
}

export default GeneralSettings
