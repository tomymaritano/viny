import PropTypes from 'prop-types'
import SettingItem from '../SettingItem'
import Select from '../Select'
import NumberInput from '../NumberInput'

const TypographySettings = ({ settings, updateSetting }) => {
  const uiFontOptions = [
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

  const markdownFontOptions = [
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

  const lineHeightOptions = [
    { value: 1.2, label: 'Tight (1.2)' },
    { value: 1.4, label: 'Snug (1.4)' },
    { value: 1.5, label: 'Normal (1.5)' },
    { value: 1.6, label: 'Relaxed (1.6)' },
    { value: 1.8, label: 'Loose (1.8)' },
    { value: 2.0, label: 'Extra Loose (2.0)' },
  ]

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
          onChange={value => updateSetting('lineHeight', parseFloat(value))}
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

TypographySettings.propTypes = {
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
}

export default TypographySettings
