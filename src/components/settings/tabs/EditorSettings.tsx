import React from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'

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
            <select
              value={settings.defaultEditorMode || 'markdown'}
              onChange={(e) => updateSettings({ defaultEditorMode: e.target.value as 'markdown' | 'monaco' })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="markdown">Markdown</option>
              <option value="monaco">Monaco (Code Editor)</option>
            </select>
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Tab Size
            </label>
            <select
              value={settings.tabSize || 2}
              onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>

          {/* Word Wrap */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Word Wrap
              </div>
              <div className="text-xs text-theme-text-muted">
                Wrap long lines in the editor
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.wordWrap !== false}
              onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>

          {/* Vim Mode */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Vim Mode
              </div>
              <div className="text-xs text-theme-text-muted">
                Enable Vim keybindings in the editor
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.vimMode === true}
              onChange={(e) => updateSettings({ vimMode: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>
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
            <select
              value={settings.previewPosition || 'right'}
              onChange={(e) => updateSettings({ previewPosition: e.target.value as 'right' | 'bottom' | 'hidden' })}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Live Preview */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Live Preview
              </div>
              <div className="text-xs text-theme-text-muted">
                Update preview as you type
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.livePreview !== false}
              onChange={(e) => updateSettings({ livePreview: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>

          {/* Syntax Highlighting */}
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-theme-text-primary">
                Syntax Highlighting
              </div>
              <div className="text-xs text-theme-text-muted">
                Highlight code blocks in preview
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.syntaxHighlighting !== false}
              onChange={(e) => updateSettings({ syntaxHighlighting: e.target.checked })}
              className="w-4 h-4 text-theme-accent-primary bg-theme-bg-secondary border-theme-border-primary rounded"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default EditorSettings