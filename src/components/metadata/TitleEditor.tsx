import React from 'react'

interface TitleEditorProps {
  title: string
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLocalTitleChange: (title: string) => void
}

const TitleEditor: React.FC<TitleEditorProps> = ({
  title,
  onTitleChange,
  onLocalTitleChange
}) => {
  return (
    <div className="mb-3">
      <input
        type="text"
        value={title}
        onChange={(e) => {
          const newTitle = e.target.value
          onLocalTitleChange(newTitle)
          onTitleChange(e)
        }}
        onBlur={(e) => onTitleChange(e)}
        placeholder="Note title..."
        className="w-full text-lg font-semibold bg-transparent text-theme-text-primary border-none outline-none placeholder-theme-text-muted py-2 px-1 hover:bg-theme-bg-secondary/20 focus:bg-theme-bg-secondary/30 rounded transition-colors"
      />
    </div>
  )
}

export default TitleEditor