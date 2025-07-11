import React from 'react'
import SettingItem from '../SettingItem'
import Select from '../Select'
import NumberInput from '../NumberInput'
import CustomSwitch from '../../ui/CustomSwitch'

interface Option {
  value: string
  label: string
}

interface EditorSettingsData {
  fontFamily: string
  fontSize: number
  tabSize: number
  wordWrap: boolean
  lineNumbers: boolean
  minimap: boolean
  vimMode: boolean
  smartIndent: boolean
  autoCloseBrackets: boolean
  highlightMatchingBrackets: boolean
  [key: string]: any
}

interface EditorSettingsProps {
  settings: EditorSettingsData
  updateSetting: (key: string, value: any) => void
}

const EditorSettings: React.FC<EditorSettingsProps> = ({ settings, updateSetting }) => {
  const fontFamilyOptions: Option[] = [
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'SF Mono', label: 'SF Mono' },
    { value: 'Source Code Pro', label: 'Source Code Pro' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
    { value: 'Courier New', label: 'Courier New' },
  ]

  return (
    <div className="space-y-1">
      <SettingItem
        label="Font Family"
        description="Choose your preferred code font"
      >
        <Select
          value={settings.fontFamily}
          onChange={value => updateSetting('fontFamily', value)}
          options={fontFamilyOptions}
        />
      </SettingItem>

      <SettingItem label="Font Size" description="Editor font size">
        <NumberInput
          value={settings.fontSize}
          onChange={value => updateSetting('fontSize', value)}
          min={10}
          max={24}
        />
      </SettingItem>

      <SettingItem label="Tab Size" description="Number of spaces per tab">
        <NumberInput
          value={settings.tabSize}
          onChange={value => updateSetting('tabSize', value)}
          min={1}
          max={8}
        />
      </SettingItem>

      <SettingItem label="Word Wrap" description="Wrap long lines">
        <CustomSwitch
          checked={settings.wordWrap}
          onChange={value => updateSetting('wordWrap', value)}
        />
      </SettingItem>

      <SettingItem label="Line Numbers" description="Show line numbers">
        <CustomSwitch
          checked={settings.lineNumbers}
          onChange={value => updateSetting('lineNumbers', value)}
        />
      </SettingItem>

      <SettingItem label="Minimap" description="Show code minimap">
        <CustomSwitch
          checked={settings.minimap}
          onChange={value => updateSetting('minimap', value)}
        />
      </SettingItem>

      <SettingItem label="Vim Mode" description="Enable vim keybindings">
        <CustomSwitch
          checked={settings.vimMode}
          onChange={value => updateSetting('vimMode', value)}
        />
      </SettingItem>

      <SettingItem
        label="Smart Indentation"
        description="Automatically indent based on context"
      >
        <CustomSwitch
          checked={settings.smartIndent}
          onChange={value => updateSetting('smartIndent', value)}
        />
      </SettingItem>

      <SettingItem
        label="Auto Closing Brackets"
        description="Automatically close brackets and quotes"
      >
        <CustomSwitch
          checked={settings.autoCloseBrackets}
          onChange={value => updateSetting('autoCloseBrackets', value)}
        />
      </SettingItem>

      <SettingItem
        label="Highlight Matching Brackets"
        description="Highlight matching brackets when cursor is over one"
      >
        <CustomSwitch
          checked={settings.highlightMatchingBrackets}
          onChange={value => updateSetting('highlightMatchingBrackets', value)}
        />
      </SettingItem>
    </div>
  )
}

export default EditorSettings