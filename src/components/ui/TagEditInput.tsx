import React from 'react'

interface TagEditInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
  className?: string
  style?: React.CSSProperties
  autoFocus?: boolean
}

const TagEditInput: React.FC<TagEditInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onBlur,
  inputRef,
  className = '',
  style = {},
  autoFocus = true,
}) => {
  return (
    <>
      <span>#</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={`bg-transparent text-xs outline-none ${className}`}
        style={{ color: 'inherit', ...style }}
        autoFocus={autoFocus}
      />
    </>
  )
}

export default TagEditInput
