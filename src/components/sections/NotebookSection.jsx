const NotebookSection = ({ notebookId }) => {
  const notebooks = {
    personal: { name: 'Personal', color: 'text-theme-accent-primary' },
    work: { name: 'Work', color: 'text-theme-accent-green' },
    projects: { name: 'Projects', color: 'text-theme-accent-orange' },
  }

  const notebookNotes = {
    personal: [
      {
        id: 2,
        title: 'Learning Neovim',
        preview: 'Key bindings and configuration tips...',
        date: '2024-01-14',
      },
      {
        id: 5,
        title: 'Book Notes: Clean Code',
        preview: 'Key principles and takeaways...',
        date: '2024-01-11',
      },
    ],
    work: [
      {
        id: 1,
        title: 'Project Planning Notes',
        preview: 'Outline for the new markdown editor...',
        date: '2024-01-15',
      },
      {
        id: 3,
        title: 'Meeting Notes - Q1 Review',
        preview: 'Quarterly goals and achievements...',
        date: '2024-01-13',
      },
    ],
    projects: [
      {
        id: 4,
        title: 'Code Snippets Collection',
        preview: 'Useful JavaScript and React snippets...',
        date: '2024-01-12',
      },
    ],
  }

  const notebook = notebooks[notebookId]
  const notes = notebookNotes[notebookId] || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-semibold mb-2 ${notebook.color}`}>
          {notebook.name}
        </h1>
        <p className="text-sm text-theme-text-tertiary">
          {notes.length} notes in this notebook
        </p>
      </div>

      <div className="space-y-3">
        {notes.map(note => (
          <div
            key={note.id}
            className="theme-bg-secondary border border-theme-border-primary rounded p-4 hover:theme-bg-tertiary transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-theme-text-secondary">
                {note.title}
              </h3>
              <span className="text-xs text-theme-text-muted">{note.date}</span>
            </div>
            <p className="text-sm text-theme-text-tertiary">{note.preview}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotebookSection
