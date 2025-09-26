import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/SelectRadix'
import { SwitchWithLabel } from '../../ui/SwitchRadix'

const EditorSettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Editor Preferences
        </h3>

        <div className="space-y-4">
          {/* Editor Mode */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Default Editor Mode
            </label>
            <Select
              value={settings.defaultEditorMode || 'markdown'}
              onValueChange={value =>
                updateSettings({
                  defaultEditorMode: value as 'markdown' | 'monaco',
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select editor mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="monaco">Monaco (Code Editor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Tab Size
            </label>
            <Select
              value={String(settings.tabSize || 2)}
              onValueChange={value =>
                updateSettings({ tabSize: parseInt(value) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tab size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="8">8 spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Word Wrap
              </div>
              <div className="text-xs text-theme-text-muted">
                Wrap long lines in the editor
              </div>
            </div>
            <SwitchWithLabel
              checked={settings.wordWrap !== false}
              onCheckedChange={checked => updateSettings({ wordWrap: checked })}
            />
          </div>

          {/* Vim Mode */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Vim Mode
              </div>
              <div className="text-xs text-theme-text-muted">
                Enable Vim keybindings in the editor
              </div>
            </div>
            <SwitchWithLabel
              checked={settings.vimMode === true}
              onCheckedChange={checked => updateSettings({ vimMode: checked })}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Markdown Settings
        </h3>

        <div className="space-y-4">
          {/* Preview Side */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Preview Position
            </label>
            <Select
              value={settings.previewPosition || 'right'}
              onValueChange={value =>
                updateSettings({
                  previewPosition: value as 'right' | 'bottom' | 'hidden',
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preview position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Live Preview */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Live Preview
              </div>
              <div className="text-xs text-theme-text-muted">
                Update preview as you type
              </div>
            </div>
            <SwitchWithLabel
              checked={settings.livePreview !== false}
              onCheckedChange={checked =>
                updateSettings({ livePreview: checked })
              }
            />
          </div>

          {/* Syntax Highlighting */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Syntax Highlighting
              </div>
              <div className="text-xs text-theme-text-muted">
                Highlight code blocks in preview
              </div>
            </div>
            <SwitchWithLabel
              checked={settings.syntaxHighlighting !== false}
              onCheckedChange={checked =>
                updateSettings({ syntaxHighlighting: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorSettings
