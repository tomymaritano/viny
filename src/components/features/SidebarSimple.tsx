// Simplified Sidebar component
import React, { memo } from 'react'
import { useSidebarLogic } from '../../hooks/useSimpleLogic'
import { useNoteActions } from '../../hooks/useSimpleLogic'
import { useSimpleStore } from '../../stores/simpleStore'
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
    handleToggleSection,
    handleSettingsClick
  } = useSidebarLogic()

  const { createNewNote } = useNoteActions()
  const { getTagColor } = useSimpleStore()

  // Helper function to extract background color from tag color class
  const getTagCircleColor = (tag: string) => {
    const colorClass = getTagColor(tag)
    // Extract the border color and convert to background
    if (colorClass.includes('border-blue-500')) return 'bg-blue-500'
    if (colorClass.includes('border-green-500')) return 'bg-green-500'
    if (colorClass.includes('border-purple-500')) return 'bg-purple-500'
    if (colorClass.includes('border-pink-500')) return 'bg-pink-500'
    if (colorClass.includes('border-yellow-500')) return 'bg-yellow-500'
    if (colorClass.includes('border-indigo-500')) return 'bg-indigo-500'
    if (colorClass.includes('border-red-500')) return 'bg-red-500'
    if (colorClass.includes('border-cyan-500')) return 'bg-cyan-500'
    if (colorClass.includes('border-orange-500')) return 'bg-orange-500'
    if (colorClass.includes('border-emerald-500')) return 'bg-emerald-500'
    if (colorClass.includes('border-gray-500')) return 'bg-gray-500'
    return 'bg-gray-500' // fallback
  }

  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <nav className="w-full sidebar-modern flex flex-col h-full ui-font">
      {/* Settings Icon - Top Right */}
      <div className="flex justify-end pr-1">
        <button
          onClick={handleSettingsClick}
          className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          title="Settings"
        >
          <Icons.Settings size={20} />
        </button>
      </div>

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
              <span className="opacity-75">
                {renderIcon(section.icon)}
              </span>
              <span>{section.label}</span>
            </div>
            <span className="text-sm opacity-75">{section.count}</span>
          </button>
        ))}
      </section>

      {/* Status Section */}
      <section>
        <button
          onClick={() => handleToggleSection('status')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('FileChartLine', 16)}
            <span>Status</span>
          </div>
          {renderIcon('ChevronRight', 16)}
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
                    {renderIcon(status.icon, 16)}
                  </span>
                  <span className="text-sm">{status.label}</span>
                </div>
                <span className="text-sm opacity-75">{status.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Notebooks Section */}
      <section>
        <button
          onClick={() => handleToggleSection('notebooks')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Book', 16)}
            <span>Notebooks</span>
          </div>
          {renderIcon('ChevronRight', 16)}
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
                  <div className="flex items-center space-x-2 ml-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${getColorClass(notebook.color).replace('text-', 'bg-')}`} />
                    <span className="text-sm">{notebook.name.charAt(0).toUpperCase() + notebook.name.slice(1)}</span>
                  </div>
                  <span className="text-sm opacity-75">{notebook.count}</span>
                </button>
              ))
            ) : (
              <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
                No notebooks yet
              </div>
            )}
            
            <button
              onClick={createNewNote}
              className="w-full px-7 py-2 text-sm text-theme-accent-primary hover:text-theme-accent-primary/80 text-left transition-colors"
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
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {renderIcon('Tag', 16)}
            <span>Tags</span>
          </div>
          {renderIcon('ChevronRight', 16)}
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
                  <div className="flex items-center space-x-2 ml-4">
                    <div className={`w-2 h-2 rounded-full ${getTagCircleColor(tag.tag)}`} />
                    <span className="text-sm">#{tag.tag}</span>
                  </div>
                  <span className="text-sm opacity-75">{tag.count}</span>
                </button>
              ))
            ) : (
              <div className="px-7 py-4 text-sm text-theme-text-muted italic text-center">
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
              <span className="text-sm opacity-75">
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