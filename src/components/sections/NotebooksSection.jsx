import './sections.css'

const NotebooksSection = () => {
  const notebooks = [
    { id: 1, name: 'Personal', notesCount: 12, color: '#268bd2' },
    { id: 2, name: 'Work', notesCount: 8, color: '#859900' },
    { id: 3, name: 'Projects', notesCount: 15, color: '#cb4b16' },
    { id: 4, name: 'Learning', notesCount: 6, color: '#d33682' },
  ]

  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">Notebooks</h1>
        <p className="section-subtitle">Organize your notes into notebooks</p>
        <div className="section-actions">
          <button className="primary">+ New Notebook</button>
        </div>
      </div>

      <div className="grid grid-2">
        {notebooks.map(notebook => (
          <div key={notebook.id} className="notebook-card">
            <div className="notebook-header">
              <div
                className="notebook-color"
                style={{ backgroundColor: notebook.color }}
              ></div>
              <h3 className="notebook-name">{notebook.name}</h3>
            </div>
            <p className="notebook-count">{notebook.notesCount} notes</p>
            <div className="notebook-actions">
              <button>Open</button>
              <button>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotebooksSection
