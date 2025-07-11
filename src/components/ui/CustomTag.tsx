import React from 'react'
import { getTagStyle, getCustomTagColor } from '../../utils/customTagColors'
import { useSimpleStore } from '../../stores/simpleStore'

interface CustomTagProps {
  tagName: string
  onClick?: () => void
  onRemove?: () => void
  removable?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const CustomTag: React.FC<CustomTagProps> = ({
  tagName,
  onClick,
  onRemove,
  removable = false,
  size = 'md',
  className = ''
}) => {
  const { tagColors } = useSimpleStore()
  
  const colorObj = getCustomTagColor(tagName, tagColors)
  const style = getTagStyle(tagName, tagColors)
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  
  const baseClasses = `
    inline-flex items-center gap-1 rounded-md font-medium transition-all duration-200
    hover:scale-105 hover:shadow-sm cursor-pointer border
    ${sizeClasses[size]}
    ${className}
  `.trim()

  return (
    <span
      className={baseClasses}
      style={style}
      onClick={onClick}
      title={`${tagName} (${colorObj.name})`}
    >
      <span className="flex items-center gap-1">
        {/* Color indicator dot */}
        <span 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colorObj.text }}
        />
        <span className="truncate">{tagName}</span>
      </span>
      
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:opacity-70 flex-shrink-0 transition-opacity"
          aria-label={`Remove ${tagName} tag`}
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </span>
  )
}

export default CustomTag