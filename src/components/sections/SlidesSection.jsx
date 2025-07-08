import './sections.css'

const SlidesSection = () => {
  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">My Slides</h1>
        <p className="section-subtitle">
          Manage all your presentations in one place
        </p>
        <div className="section-actions">
          <button className="primary">+ New Presentation</button>
          <button>Import</button>
        </div>
      </div>

      <div className="slides-toolbar">
        <div className="search-bar">
          <input type="text" placeholder="Search presentations..." />
        </div>
        <div className="view-controls">
          <button className="view-btn active">Grid</button>
          <button className="view-btn">List</button>
        </div>
      </div>

      <div className="empty-state">
        <h3>No presentations yet</h3>
        <p>Create your first presentation to get started</p>
        <button className="primary">Create New Presentation</button>
      </div>
    </div>
  )
}

export default SlidesSection
