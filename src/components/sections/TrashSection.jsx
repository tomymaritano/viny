const TrashSection = () => {
  const trashedNotes = [
    {
      id: 101,
      title: 'Old Meeting Notes',
      preview: 'Notes from last quarter meeting...',
      deletedDate: '2024-01-10',
      originalNotebook: 'Work',
    },
    {
      id: 102,
      title: 'Draft Ideas',
      preview: 'Some random thoughts and ideas...',
      deletedDate: '2024-01-08',
      originalNotebook: 'Personal',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-solarized-base5 mb-2">
          Trash
        </h1>
        <p className="text-sm text-solarized-base1">
          {trashedNotes.length} notes in trash
        </p>
      </div>

      {trashedNotes.length > 0 && (
        <div className="mb-4">
          <button className="px-4 py-2 bg-solarized-red text-solarized-base5 rounded text-sm font-medium hover:bg-opacity-80 transition-colors">
            Empty Trash
          </button>
        </div>
      )}

      <div className="space-y-3">
        {trashedNotes.map(note => (
          <div
            key={note.id}
            className="bg-solarized-base02 border border-solarized-base01 rounded p-4 opacity-75"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-solarized-base1 line-through">
                {note.title}
              </h3>
              <span className="text-xs text-solarized-base0">
                Deleted {note.deletedDate}
              </span>
            </div>
            <p className="text-sm text-solarized-base0 mb-3">{note.preview}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-solarized-base01 text-solarized-base0 rounded">
                From {note.originalNotebook}
              </span>
              <div className="space-x-2">
                <button className="text-xs text-solarized-blue hover:text-solarized-base3 px-2 py-1">
                  Restore
                </button>
                <button className="text-xs text-solarized-red hover:text-solarized-base3 px-2 py-1">
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrashSection
