import React from 'react'

interface SettingRowProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  children,
  className = '',
  fullWidth = false,
}) => {
  if (fullWidth) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div>
          <h4 className="text-sm font-medium text-theme-text-primary">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-theme-text-muted mt-1">{description}</p>
          )}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-theme-text-primary">{title}</h4>
        {description && (
          <p className="text-xs text-theme-text-muted mt-1">{description}</p>
        )}
      </div>

      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default SettingRow
