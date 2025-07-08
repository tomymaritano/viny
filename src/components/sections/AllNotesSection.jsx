const AllNotesSection = ({ notes = [], onOpenNote, onNewNote }) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-solarized-base5 mb-2">
          All Notes
        </h1>
        <p className="text-sm text-solarized-base1">
          {notes.length} notes across all notebooks
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewNote}
            className="px-4 py-2 bg-solarized-blue text-solarized-base5 rounded text-sm font-medium hover:bg-solarized-green-hover transition-colors"
          >
            + New Note
          </button>
          <button className="px-4 py-2 border border-solarized-base01 text-solarized-base1 rounded text-sm hover:bg-solarized-base01 hover:text-solarized-base3 transition-colors">
            Import
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-64 px-3 py-2 bg-solarized-base01 border border-solarized-base00 rounded text-sm text-solarized-base2 placeholder-solarized-base0 focus:outline-none focus:border-solarized-blue focus:bg-solarized-base02"
            />
          </div>
          <select className="px-3 py-2 bg-solarized-base01 border border-solarized-base00 rounded text-sm text-solarized-base2 focus:outline-none focus:border-solarized-blue focus:bg-solarized-base02">
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
            className="bg-solarized-base02 border border-solarized-base01 rounded p-4 hover:bg-solarized-base01 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-solarized-base4 group-hover:text-solarized-base5">
                  {note.title}
                </h3>
                {note.isPinned && (
                  <span className="text-xs text-solarized-yellow">📌</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-solarized-base0">
                <span className="px-2 py-1 bg-solarized-base01 rounded">
                  {note.notebook}
                </span>
                <span>{note.date}</span>
              </div>
            </div>

            <p className="text-sm text-solarized-base1 mb-3 line-clamp-2">
              {note.preview}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-solarized-base00 text-solarized-blue rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs text-solarized-base1 hover:text-solarized-base3 px-2 py-1">
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
