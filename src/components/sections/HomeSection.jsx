import './sections.css'

const HomeSection = () => {
  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">Welcome to SlidesApp</h1>
        <p className="section-subtitle">
          Create beautiful presentations with minimal effort
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Recent Slides</h3>
          <p>Your most recent presentations</p>
          <div className="empty-state">
            <p>No slides yet. Create your first presentation!</p>
            <button className="primary">Create New Slide</button>
          </div>
        </div>

        <div className="card">
          <h3>Quick Templates</h3>
          <p>Get started with pre-designed templates</p>
          <div className="template-grid">
            <div className="template-item">
              <div className="template-preview">Business</div>
              <span>Business</span>
            </div>
            <div className="template-item">
              <div className="template-preview">Minimal</div>
              <span>Minimal</span>
            </div>
            <div className="template-item">
              <div className="template-preview">Creative</div>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Presentations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Templates Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Hours Saved</div>
        </div>
      </div>
    </div>
  )
}

export default HomeSection
