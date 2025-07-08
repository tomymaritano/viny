import './sections.css'

const NotesSection = () => {
  const notes = [
    {
      id: 1,
      title: 'Welcome to Inkrun',
      preview: 'Getting started with markdown...',
      date: '2024-01-15',
      tag: 'welcome',
    },
    {
      id: 2,
      title: 'Project Ideas',
      preview: 'List of project ideas for...',
      date: '2024-01-14',
      tag: 'ideas',
    },
    {
      id: 3,
      title: 'Meeting Notes',
      preview: 'Discussed the new features...',
      date: '2024-01-13',
      tag: 'work',
    },
  ]

  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">Notes</h1>
        <p className="section-subtitle">All your markdown notes in one place</p>
        <div className="section-actions">
          <button className="primary">+ New Note</button>
          <button>Import</button>
        </div>
      </div>

      <div className="notes-toolbar">
        <div className="search-bar">
          <input type="text" placeholder="Search notes..." />
        </div>
        <div className="view-controls">
          <button className="view-btn active">List</button>
          <button className="view-btn">Grid</button>
        </div>
      </div>

      <div className="notes-list">
        {notes.map(note => (
          <div key={note.id} className="note-item">
            <div className="note-content">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-preview">{note.preview}</p>
              <div className="note-meta">
                <span className="note-date">{note.date}</span>
                <span className="note-tag">#{note.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotesSection
