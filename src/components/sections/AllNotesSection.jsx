const AllNotesSection = ({ notes = [], onOpenNote, onNewNote }) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-theme-text-primary mb-2">
          All Notes
        </h1>
        <p className="text-sm text-theme-text-tertiary">
          {notes.length} notes across all notebooks
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewNote}
            className="px-4 py-2 bg-theme-accent-primary text-theme-text-primary rounded text-sm font-medium hover:bg-theme-accent-green-hover transition-colors"
          >
            + New Note
          </button>
          <button className="px-4 py-2 border border-theme-border-primary text-theme-text-tertiary rounded text-sm hover:theme-bg-tertiary hover:text-theme-text-secondary transition-colors">
            Import
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-64 px-3 py-2 theme-bg-tertiary border border-theme-border-secondary rounded text-sm text-theme-text-secondary placeholder-solarized-base0 focus:outline-none focus:border-theme-accent-primary focus:theme-bg-secondary"
            />
          </div>
          <select className="px-3 py-2 theme-bg-tertiary border border-theme-border-secondary rounded text-sm text-theme-text-secondary focus:outline-none focus:border-theme-accent-primary focus:theme-bg-secondary">
            <option>Sort by Modified</option>
            <option>Sort by Created</option>
            <option>Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => onOpenNote(note.id)}
            className="theme-bg-secondary border border-theme-border-primary rounded p-4 hover:theme-bg-tertiary transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-theme-text-secondary group-hover:text-theme-text-primary">
                  {note.title}
                </h3>
                {note.isPinned && (
                  <span className="text-xs text-theme-accent-yellow">📌</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-theme-text-muted">
                <span className="px-2 py-1 theme-bg-tertiary rounded">
                  {note.notebook}
                </span>
                <span>{note.date}</span>
              </div>
            </div>

            <p className="text-sm text-theme-text-tertiary mb-3 line-clamp-2">
              {note.preview}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 theme-bg-quaternary text-theme-accent-primary rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs text-theme-text-tertiary hover:text-theme-text-secondary px-2 py-1">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllNotesSection
