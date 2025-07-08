const NotebookSection = ({ notebookId }) => {
  const notebooks = {
    personal: { name: 'Personal', color: 'text-solarized-blue' },
    work: { name: 'Work', color: 'text-solarized-green' },
    projects: { name: 'Projects', color: 'text-solarized-orange' },
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
        <p className="text-sm text-solarized-base1">
          {notes.length} notes in this notebook
        </p>
      </div>

      <div className="space-y-3">
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-solarized-base02 border border-solarized-base01 rounded p-4 hover:bg-solarized-base01 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-solarized-base4">{note.title}</h3>
              <span className="text-xs text-solarized-base0">{note.date}</span>
            </div>
            <p className="text-sm text-solarized-base1">{note.preview}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotebookSection
