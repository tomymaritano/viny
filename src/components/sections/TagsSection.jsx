import './sections.css'

const TagsSection = () => {
  const tags = [
    { name: 'welcome', count: 1, color: '#268bd2' },
    { name: 'ideas', count: 5, color: '#859900' },
    { name: 'work', count: 8, color: '#cb4b16' },
    { name: 'personal', count: 12, color: '#d33682' },
    { name: 'learning', count: 6, color: '#6c71c4' },
    { name: 'projects', count: 15, color: '#2aa198' },
  ]

  return (
    <div className="section">
      <div className="section-header">
        <h1 className="section-title">Tags</h1>
        <p className="section-subtitle">Browse notes by tags</p>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search tags..." />
      </div>

      <div className="tags-grid">
        {tags.map(tag => (
          <div key={tag.name} className="tag-item">
            <div
              className="tag-color"
              style={{ backgroundColor: tag.color }}
            ></div>
            <div className="tag-info">
              <span className="tag-name">#{tag.name}</span>
              <span className="tag-count">{tag.count} notes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TagsSection
