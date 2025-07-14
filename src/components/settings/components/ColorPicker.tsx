import React, { useState } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  presetColors?: string[]
  allowCustom?: boolean
  disabled?: boolean
  className?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#6b7280', '#374151', '#1f2937'
  ],
  allowCustom = true,
  disabled = false,
  className = '',
}) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-theme-text-secondary">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          onClick={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          className={`
            flex items-center space-x-2 px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary 
            rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-bg-tertiary cursor-pointer'}
          `}
        >
          <div
            className="w-5 h-5 rounded border border-theme-border-primary"
            style={{ backgroundColor: value }}
          />
          <span className="text-theme-text-primary font-mono text-xs">
            {value.toUpperCase()}
          </span>
        </button>
        
        {showPicker && !disabled && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            
            {/* Color picker popup */}
            <div className="absolute top-full left-0 mt-2 p-4 bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg z-20 min-w-[200px]">
              {/* Preset colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-theme-text-primary">
                  Preset Colors
                </h4>
                
                <div className="grid grid-cols-5 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onChange(color)
                        setShowPicker(false)
                      }}
                      className={`
                        w-8 h-8 rounded border-2 hover:scale-110 transition-transform
                        ${value === color ? 'border-theme-accent-primary' : 'border-theme-border-primary'}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {allowCustom && (
                  <>
                    <hr className="border-theme-border-primary" />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-theme-text-primary">
                        Custom Color
                      </h4>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          className="w-8 h-8 rounded border border-theme-border-primary cursor-pointer"
                        />
                        
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const color = e.target.value
                            if (/^#[0-9a-fA-F]{6}$/.test(color)) {
                              onChange(color)
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 px-2 py-1 text-xs font-mono bg-theme-bg-secondary border border-theme-border-primary rounded focus:outline-none focus:ring-1 focus:ring-theme-accent-primary"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ColorPicker