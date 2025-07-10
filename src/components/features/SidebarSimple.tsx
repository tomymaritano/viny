// Simplified Sidebar component
import React, { memo } from 'react'
import { useSidebarLogic } from '../../hooks/useSimpleLogic'
import { useNoteActions } from '../../hooks/useSimpleLogic'
import Icons from '../Icons'

const SidebarSimple: React.FC = memo(() => {
  const {
    activeSection,
    expandedSections,
    notes,
    mainSections,
    statusSections,
    systemSections,
    notebooksWithCounts,
    tagsWithCounts,
    getColorClass,
    handleSectionClick,
    handleToggleSection
  } = useSidebarLogic()

  const { createNewNote } = useNoteActions()

  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <nav className="w-full sidebar-modern flex flex-col h-full ui-font">
      {/* Main Sections */}
      <section className="space-y-0">
        {mainSections.map(section => (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              activeSection === section.id
                ? 'text-theme-text-primary bg-[#323D4B] relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            onClick={() => handleSectionClick(section.id)}
            style={activeSection === section.id ? {
              boxShadow: 'inset 4px 0 0 #ED6E3F'
            } : {}}
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">{renderIcon(section.icon)}</span>
              <span>{section.label}</span>
            </div>
            <span className="text-xs opacity-75">{section.count}</span>
          </button>
        ))}
      </section>

      {/* Status Section */}
      <section>
        <button
          onClick={() => handleToggleSection('status')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Circle', 14)}
            <span>Status</span>
          </div>
          {renderIcon('ChevronRight', 12)}
        </button>
        
        {expandedSections.status && (
          <div className="space-y-0 mt-1">
            {statusSections.map(status => (
              <button
                key={status.id}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                  activeSection === status.id
                    ? 'text-theme-text-primary bg-theme-bg-tertiary'
                    : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
                onClick={() => handleSectionClick(status.id)}
              >
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`opacity-75 ${status.color || 'text-theme-text-secondary'}`}>
                    {renderIcon(status.icon, 12)}
                  </span>
                  <span className="text-xs">{status.label}</span>
                </div>
                <span className="text-xs opacity-75">{status.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Notebooks Section */}
      <section>
        <button
          onClick={() => handleToggleSection('notebooks')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Book', 14)}
            <span>Notebooks</span>
          </div>
          {renderIcon('ChevronRight', 12)}
        </button>
        
        {expandedSections.notebooks && (
          <div className="space-y-0 mt-1">
            {notebooksWithCounts.length > 0 ? (
              notebooksWithCounts.map((notebook) => (
                <button
                  key={notebook.id}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                    activeSection === `notebook-${notebook.name.toLowerCase()}`
                      ? 'text-theme-text-primary bg-[#323D4B] relative'
                      : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
                  }`}
                  onClick={() => handleSectionClick(`notebook-${notebook.name.toLowerCase()}`)}
                  style={activeSection === `notebook-${notebook.name.toLowerCase()}` ? {
                    boxShadow: 'inset 4px 0 0 #ED6E3F'
                  } : {}}
                >
                  <div className="flex items-center space-x-2 ml-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${getColorClass(notebook.color).replace('text-', 'bg-')}`} />
                    <span className="text-xs">{notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1)}</span>
                  </div>
                  <span className="text-xs opacity-75">{notebook.count}</span>
                </button>
              ))
            ) : (
              <div className="px-7 py-2 text-xs text-theme-text-muted italic">
                No notebooks yet
              </div>
            )}
            
            <button
              onClick={createNewNote}
              className="w-full px-7 py-2 text-xs text-theme-accent-primary hover:text-theme-accent-primary/80 text-left transition-colors"
            >
              + New Note
            </button>
          </div>
        )}
      </section>

      {/* Tags Section */}
      <section>
        <button
          onClick={() => handleToggleSection('tags')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Tag', 14)}
            <span>Tags</span>
          </div>
          {renderIcon('ChevronRight', 12)}
        </button>
        
        {expandedSections.tags && (
          <div className="space-y-0 mt-1">
            {tagsWithCounts.length > 0 ? (
              tagsWithCounts.map((tag) => (
                <button
                  key={tag.tag}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                    activeSection === `tag-${tag.tag.toLowerCase()}`
                      ? 'text-theme-text-primary bg-[#323D4B] relative'
                      : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
                  }`}
                  onClick={() => handleSectionClick(`tag-${tag.tag.toLowerCase()}`)}
                  style={activeSection === `tag-${tag.tag.toLowerCase()}` ? {
                    boxShadow: 'inset 4px 0 0 #ED6E3F'
                  } : {}}
                >
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="opacity-75">
                      {renderIcon('Tag', 12)}
                    </span>
                    <span className="text-xs">#{tag.tag}</span>
                  </div>
                  <span className="text-xs opacity-75">{tag.count}</span>
                </button>
              ))
            ) : (
              <div className="px-7 py-2 text-xs text-theme-text-muted italic">
                No tags yet
              </div>
            )}
          </div>
        )}
      </section>

      {/* System Sections */}
      <section className="space-y-0">
        {systemSections.map(section => (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
              activeSection === section.id
                ? 'text-theme-text-primary bg-[#323D4B] relative'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
            }`}
            onClick={() => handleSectionClick(section.id)}
            style={activeSection === section.id ? {
              boxShadow: 'inset 4px 0 0 #ED6E3F'
            } : {}}
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">{renderIcon(section.icon)}</span>
              <span>{section.label}</span>
            </div>
            {section.count !== undefined && (
              <span className="text-xs opacity-75">
                {section.count === 0 && section.id === 'trash' ? 'Empty' : section.count}
              </span>
            )}
          </button>
        ))}
      </section>

      {/* User Info */}
      <footer className="mt-auto px-3 pb-3 pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-theme-accent-primary rounded-full flex items-center justify-center">
            <span className="text-theme-text-primary text-xs font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-theme-text-secondary font-medium truncate">User</div>
            <div className="text-xs text-theme-text-muted">
              {notes.length} notes
            </div>
          </div>
        </div>
      </footer>
    </nav>
  )
})

SidebarSimple.displayName = 'SidebarSimple'

export default SidebarSimple