import Icons from '../Icons'

const PinnedNotesSection = ({ notes = [], onOpenNote }) => {
  const pinnedNotes = notes.filter(note => note.isPinned && !note.isTrashed)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-theme-text-primary mb-2">
          Pinned Notes
        </h1>
        <p className="text-sm text-theme-text-tertiary">
          {pinnedNotes.length} pinned notes
        </p>
      </div>

      {pinnedNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icons.Star size={48} className="text-theme-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-theme-text-secondary mb-2">
            No Pinned Notes
          </h3>
          <p className="text-theme-text-tertiary">
            Pin important notes to keep them easily accessible
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pinnedNotes.map(note => (
            <div
              key={note.id}
              onClick={() => onOpenNote(note.id)}
              className="theme-bg-secondary border border-theme-border-primary rounded p-4 hover:theme-bg-tertiary transition-colors cursor-pointer max-h-32 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-theme-text-secondary flex items-center space-x-2">
                  <Icons.Star size={14} className="text-theme-accent-yellow" />
                  <span>{note.title}</span>
                </h3>
                <span className="text-xs text-theme-text-muted">
                  {new Date(note.updatedAt || note.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-theme-text-tertiary mb-2 line-clamp-2">
                {note.content
                  ? note.content.length > 150
                    ? note.content.substring(0, 150) + '...'
                    : note.content
                  : 'No content'}
              </p>
              <span className="text-xs px-2 py-1 theme-bg-tertiary text-theme-text-tertiary rounded">
                {note.notebook}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PinnedNotesSection
