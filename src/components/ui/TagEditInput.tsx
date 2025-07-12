// Simplified TagEditInput for backward compatibility
import React, { forwardRef } from 'react'

interface TagEditInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
}

const TagEditInput = forwardRef<HTMLInputElement, TagEditInputProps>(({
  value,
  onChange,
  onKeyDown,
  onBlur,
  className = '',
  placeholder = ''
}, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`bg-transparent outline-none border-none ${className}`}
      autoFocus
    />
  )
})

TagEditInput.displayName = 'TagEditInput'

export default TagEditInput