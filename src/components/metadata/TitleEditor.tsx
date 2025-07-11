/**
 * Note title editor component
 */
import React from 'react'

interface TitleEditorProps {
  title: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

const TitleEditor: React.FC<TitleEditorProps> = ({
  title,
  onChange,
  onBlur,
  placeholder = 'Note title...',
  className = ''
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      <input
        type="text"
        value={title}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full text-lg font-semibold bg-transparent text-theme-text-primary border-none outline-none placeholder-theme-text-muted py-2 px-1 hover:bg-theme-bg-secondary/20 focus:bg-theme-bg-secondary/30 rounded transition-colors"
      />
    </div>
  )
}

export default TitleEditor