// Modern Sidebar component - purely presentational
import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebarLogic } from '../../hooks/useSidebarLogic'
import { useNoteActions } from '../../hooks/useNoteActions'
import Icons from '../Icons'

interface SidebarSection {
  id: string
  label: string
  count?: number
  icon: string
  color?: string
}

interface SidebarButtonProps {
  section: SidebarSection
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

const SidebarButton = memo<SidebarButtonProps>(({ section, isActive, onClick, children }) => (
  <button
    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
      isActive
        ? 'text-theme-text-primary'
        : 'text-theme-text-tertiary hover:text-theme-text-secondary'
    }`}
    style={{
      backgroundColor: isActive ? 'var(--color-active-bg)' : 'transparent',
      color: isActive ? 'var(--color-active-text)' : undefined,
      borderRight: isActive 
        ? '2px solid var(--color-active-border)' 
        : '2px solid transparent',
    }}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.backgroundColor = 'transparent'
      }
    }}
    onClick={onClick}
    aria-pressed={isActive}
    role="menuitem"
  >
    {children}
  </button>
))

SidebarButton.displayName = 'SidebarButton'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CollapsibleSection = memo<CollapsibleSectionProps>(({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children 
}) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
      aria-expanded={isExpanded}
      aria-controls={`section-${title.toLowerCase()}`}
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      <Icons.ChevronRight
        size={12}
        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
      />
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          id={`section-${title.toLowerCase()}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="space-y-0 mt-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
))

CollapsibleSection.displayName = 'CollapsibleSection'

const SidebarV3: React.FC = memo(() => {
  // All logic extracted to hooks
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
    handleManageNotebooks
  } = useSidebarLogic()

  const { handleCreateNote } = useNoteActions()

  // Helper function to render icon
  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any
    return IconComponent ? <IconComponent size={size} /> : null
  }

  return (
    <nav 
      className="w-full sidebar-modern flex flex-col h-full ui-font"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Sections */}
      <section className="space-y-0" aria-label="Main sections">
        {mainSections.map(section => (
          <SidebarButton
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => handleSectionClick(section.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="opacity-75">{renderIcon(section.icon)}</span>
              <span>{section.label}</span>
            </div>
            <span className="text-xs opacity-75">{section.count}</span>
          </SidebarButton>
        ))}
      </section>

      {/* Notebooks Section */}
      <section aria-label="Notebooks">
        <CollapsibleSection
          title="Notebooks"
          icon={renderIcon('Book', 14)}
          isExpanded={expandedSections.notebooks}
          onToggle={() => handleToggleSection('notebooks')}
        >
          {notebooksWithCounts.length > 0 ? (
            notebooksWithCounts.map((notebook) => (
              <div key={notebook.id} className="relative group">
                <SidebarButton
                  section={notebook}
                  isActive={activeSection === `notebook-${notebook.name.toLowerCase()}`}
                  onClick={() => handleSectionClick(`notebook-${notebook.name.toLowerCase()}`)}
                >
                  <div className="flex items-center space-x-2 ml-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${getColorClass(notebook.color).replace('text-', 'bg-')}`}
                    />
                    <span className="text-xs">{notebook.name}</span>
                  </div>
                  <span className="text-xs opacity-75">{notebook.count}</span>
                </SidebarButton>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleManageNotebooks()
                  }}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs border border-theme-text-muted text-theme-text-muted hover:text-theme-text-secondary hover:border-theme-text-secondary rounded"
                  title="Edit notebook"
                  aria-label={`Edit ${notebook.name} notebook`}
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <div className="px-7 py-2 text-xs text-theme-text-muted italic">
              No notebooks yet
            </div>
          )}
          
          <button
            onClick={handleCreateNote}
            className="w-full px-7 py-2 text-xs text-theme-accent-primary hover:text-theme-accent-primary/80 text-left transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Create new note"
          >
            + New Note
          </button>
          
          <button
            onClick={handleManageNotebooks}
            className="w-full px-7 py-2 text-xs text-theme-text-tertiary hover:text-theme-text-secondary text-left transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Manage notebooks"
          >
            Manage Notebooks
          </button>
        </CollapsibleSection>
      </section>

      {/* System Sections */}
      <section className="space-y-0" aria-label="System sections">
        {systemSections.map(section => (
          <SidebarButton
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => handleSectionClick(section.id)}
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
          </SidebarButton>
        ))}
      </section>

      {/* Status Section */}
      <section aria-label="Status sections">
        <CollapsibleSection
          title="Status"
          icon={renderIcon('Circle', 14)}
          isExpanded={expandedSections.status}
          onToggle={() => handleToggleSection('status')}
        >
          {statusSections.map(status => (
            <SidebarButton
              key={status.id}
              section={status}
              isActive={activeSection === status.id}
              onClick={() => handleSectionClick(status.id)}
            >
              <div className="flex items-center space-x-2 ml-4">
                <span className={`opacity-75 ${status.color}`}>{renderIcon(status.icon)}</span>
                <span className="text-xs">{status.label}</span>
              </div>
              <span className="text-xs opacity-75">{status.count}</span>
            </SidebarButton>
          ))}
        </CollapsibleSection>
      </section>

      {/* Tags Section */}
      <section aria-label="Tags sections">
        <CollapsibleSection
          title="Tags"
          icon={renderIcon('Tag', 14)}
          isExpanded={expandedSections.tags}
          onToggle={() => handleToggleSection('tags')}
        >
          <div className="max-h-32 overflow-y-auto">
            {tagsWithCounts.length > 0 ? (
              tagsWithCounts.map(({ tag, count }) => (
                <SidebarButton
                  key={tag}
                  section={{ id: `tag-${tag}`, label: tag, icon: <></> }}
                  isActive={activeSection === `tag-${tag}`}
                  onClick={() => handleSectionClick(`tag-${tag}`)}
                >
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-theme-text-muted text-xs">#</span>
                    <span className="text-xs">{tag}</span>
                  </div>
                  <span className="text-xs opacity-75">{count}</span>
                </SidebarButton>
              ))
            ) : (
              <div className="px-7 py-2 text-xs text-theme-text-muted italic">
                No tags yet
              </div>
            )}
          </div>
        </CollapsibleSection>
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

SidebarV3.displayName = 'SidebarV3'

export default SidebarV3