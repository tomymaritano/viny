import React from 'react'

interface SettingItemProps {
  label: string
  children: React.ReactNode
  description?: string
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  children,
  description,
}) => (
  <div className="setting-item py-3 border-b border-theme-border-primary last:border-b-0">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-theme-text-secondary">
          {label}
        </div>
        {description && (
          <div className="text-xs text-theme-text-tertiary mt-1">
            {description}
          </div>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  </div>
)

export default SettingItem
