import './sections.css'

const TemplatesSection = () => {
  const templates = [
    { id: 1, name: 'Business Pitch', category: 'Business' },
    { id: 2, name: 'Minimal Clean', category: 'Minimal' },
    { id: 3, name: 'Creative Portfolio', category: 'Creative' },
    { id: 4, name: 'Academic Report', category: 'Academic' },
    { id: 5, name: 'Marketing Slides', category: 'Marketing' },
    { id: 6, name: 'Team Meeting', category: 'Corporate' },
  ]

  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">Templates</h1>
        <p className="section-subtitle">
          Professional templates to jumpstart your presentations
        </p>
      </div>

      <div className="templates-filter">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Business</button>
        <button className="filter-btn">Minimal</button>
        <button className="filter-btn">Creative</button>
        <button className="filter-btn">Academic</button>
      </div>

      <div className="grid grid-3">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-preview-large">
              <span className="template-letter">{template.category[0]}</span>
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p className="template-category">{template.category}</p>
              <button className="template-use-btn primary">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TemplatesSection
