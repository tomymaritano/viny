import React from 'react'
import SettingItem from '../SettingItem'
import Select from '../Select'
import NumberInput from '../NumberInput'

interface Option {
  value: string | number
  label: string
}

interface TypographySettingsData {
  uiFontFamily: string
  uiFontSize: number
  markdownFontFamily: string
  markdownFontSize: number
  lineHeight: number
  letterSpacing: number
  paragraphSpacing: number
  [key: string]: any
}

interface TypographySettingsProps {
  settings: TypographySettingsData
  updateSetting: (key: string, value: any) => void
}

const TypographySettings: React.FC<TypographySettingsProps> = ({ settings, updateSetting }) => {
  const uiFontOptions: Option[] = [
    { value: 'system-ui', label: 'System UI' },
    {
      value:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      label: 'System Default',
    },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Verdana', label: 'Verdana' },
  ]

  const markdownFontOptions: Option[] = [
    { value: 'system-ui', label: 'System UI' },
    {
      value:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      label: 'System Default',
    },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Charter', label: 'Charter' },
    { value: 'Source Serif Pro', label: 'Source Serif Pro' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
  ]

  const lineHeightOptions: Option[] = [
    { value: 1.2, label: 'Tight (1.2)' },
    { value: 1.4, label: 'Snug (1.4)' },
    { value: 1.5, label: 'Normal (1.5)' },
    { value: 1.6, label: 'Relaxed (1.6)' },
    { value: 1.8, label: 'Loose (1.8)' },
    { value: 2.0, label: 'Extra Loose (2.0)' },
  ]

  const handleLineHeightChange = (value: string): void => {
    updateSetting('lineHeight', parseFloat(value))
  }

  return (
    <div className="space-y-1">
      <SettingItem
        label="UI Font Family"
        description="Font for user interface elements"
      >
        <Select
          value={settings.uiFontFamily}
          onChange={value => updateSetting('uiFontFamily', value)}
          options={uiFontOptions}
        />
      </SettingItem>

      <SettingItem label="UI Font Size" description="Size of interface text">
        <NumberInput
          value={settings.uiFontSize}
          onChange={value => updateSetting('uiFontSize', value)}
          min={10}
          max={20}
        />
      </SettingItem>

      <SettingItem
        label="Markdown Font Family"
        description="Font for markdown content"
      >
        <Select
          value={settings.markdownFontFamily}
          onChange={value => updateSetting('markdownFontFamily', value)}
          options={markdownFontOptions}
        />
      </SettingItem>

      <SettingItem
        label="Markdown Font Size"
        description="Size of markdown text"
      >
        <NumberInput
          value={settings.markdownFontSize}
          onChange={value => updateSetting('markdownFontSize', value)}
          min={10}
          max={24}
        />
      </SettingItem>

      <SettingItem label="Line Height" description="Spacing between lines">
        <Select
          value={settings.lineHeight}
          onChange={handleLineHeightChange}
          options={lineHeightOptions}
        />
      </SettingItem>

      <SettingItem
        label="Letter Spacing"
        description="Space between characters (in pixels)"
      >
        <NumberInput
          value={settings.letterSpacing}
          onChange={value => updateSetting('letterSpacing', value)}
          min={-2}
          max={5}
          step={0.1}
        />
      </SettingItem>

      <SettingItem
        label="Paragraph Spacing"
        description="Space between paragraphs (in em)"
      >
        <NumberInput
          value={settings.paragraphSpacing}
          onChange={value => updateSetting('paragraphSpacing', value)}
          min={0}
          max={3}
          step={0.1}
        />
      </SettingItem>
    </div>
  )
}

export default TypographySettings