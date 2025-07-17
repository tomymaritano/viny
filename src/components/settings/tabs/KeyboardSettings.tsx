import React from 'react'
import { Icons } from '../../Icons'

const KeyboardSettings: React.FC = () => {
  const shortcuts = [
    { category: 'General', items: [
      { action: 'Create New Note', keys: ['⌘', 'N'] },
      { action: 'Search Notes', keys: ['⌘', 'K'] },
      { action: 'Toggle Sidebar', keys: ['⌘', 'B'] },
      { action: 'Settings', keys: ['⌘', ','] },
    ]},
    { category: 'Editor', items: [
      { action: 'Bold', keys: ['⌘', 'B'] },
      { action: 'Italic', keys: ['⌘', 'I'] },
      { action: 'Insert Link', keys: ['⌘', 'K'] },
      { action: 'Toggle Preview', keys: ['⌘', 'P'] },
      { action: 'Save Note', keys: ['⌘', 'S'] },
    ]},
    { category: 'Navigation', items: [
      { action: 'Next Note', keys: ['⌘', '↓'] },
      { action: 'Previous Note', keys: ['⌘', '↑'] },
      { action: 'Focus Editor', keys: ['⌘', 'E'] },
      { action: 'Focus Notes List', keys: ['⌘', 'L'] },
    ]},
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Keyboard Shortcuts
        </h3>
        <p className="text-sm text-theme-text-secondary mb-6">
          These keyboard shortcuts help you navigate and work more efficiently.
        </p>
      </div>

      {shortcuts.map((category) => (
        <div key={category.category}>
          <h4 className="text-sm font-medium text-theme-text-primary mb-3">
            {category.category}
          </h4>
          <div className="space-y-2">
            {category.items.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-theme-bg-secondary"
              >
                <span className="text-sm text-theme-text-secondary">
                  {shortcut.action}
                </span>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="text-theme-text-muted">+</span>
                      )}
                      <kbd className="px-2 py-1 text-xs bg-theme-bg-tertiary border border-theme-border-primary rounded">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-theme-border-primary pt-6">
        <div className="bg-theme-bg-secondary rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icons.Info size={16} className="text-theme-accent-blue mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-theme-text-secondary">
                Some shortcuts may vary depending on your operating system.
              </p>
              <p className="text-sm text-theme-text-secondary">
                On Windows and Linux, replace ⌘ with Ctrl.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyboardSettings