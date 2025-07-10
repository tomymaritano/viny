import { useState, memo, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotebooks } from '../hooks/useNotebooks'
import Icons from './Icons'

const Sidebar = memo(
  ({
    activeSection,
    setActiveSection,
    onNewNote,
    notes = [],
    onManageNotebooks,
    storageMode = 'localStorage',
    onToggleStorage,
  }) => {
    const { notebooks, getColorClass } = useNotebooks()

    // Dropdown states
    const [expandedSections, setExpandedSections] = useState({
      notebooks: true,
      status: false,
      tags: false,
    })

    // Memoize expensive calculations - OPTIMIZED
    const {
      totalNotes,
      pinnedNotes,
      trashedNotes,
      notebooksWithCounts,
      tagsWithCounts,
    } = useMemo(() => {
      // Calculate real counts from notes
      const totalNotes = notes.filter(note => !note.isTrashed).length
      const pinnedNotes = notes.filter(
        note => note.isPinned && !note.isTrashed
      ).length
      const trashedNotes = notes.filter(note => note.isTrashed).length || 0

      // Get notebook counts from notes
      const notebookCounts = notes.reduce((acc, note) => {
        if (!note.isTrashed) {
          const notebook = note.notebook
          acc[notebook] = (acc[notebook] || 0) + 1
        }
        return acc
      }, {})

      // Combine with notebook definitions
      const notebooksWithCounts = notebooks
        .map(notebook => ({
          ...notebook,
          count: notebookCounts[notebook.name] || 0,
        }))
        .sort((a, b) => b.count - a.sort)

      // Get all tags with counts
      const tagCounts = notes.reduce((acc, note) => {
        if (!note.isTrashed) {
          if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach(tag => {
              acc[tag] = (acc[tag] || 0) + 1
            })
          }
        }
        return acc
      }, {})

      const tagsWithCounts = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Show only top 10 tags

      return {
        totalNotes,
        pinnedNotes,
        trashedNotes,
        notebooksWithCounts,
        tagsWithCounts,
      }
    }, [notes, notebooks])

    // Use memoized tags directly - STABLE reference
    const sortedTags = useMemo(
      () => tagsWithCounts.map(({ tag, count }) => [tag, count]),
      [tagsWithCounts]
    )

    // Memoize callbacks to prevent re-renders
    const toggleSection = useCallback(section => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section],
      }))
    }, [])

    const handleSectionClick = useCallback(
      sectionId => {
        setActiveSection(sectionId)
      },
      [setActiveSection]
    )

    const handleNewNote = useCallback(() => {
      onNewNote()
    }, [onNewNote])

    const handleManageNotebooks = useCallback(() => {
      onManageNotebooks()
    }, [onManageNotebooks])

    // Memoize status counts - STABLE reference
    const statusCounts = useMemo(() => {
      return notes.reduce((acc, note) => {
        if (!note.isTrashed) {
          const status = note.status || 'active'
          acc[status] = (acc[status] || 0) + 1
        }
        return acc
      }, {})
    }, [notes])

    // Memoize status sections to prevent recreation
    const statusSections = useMemo(
      () => [
        {
          id: 'status-active',
          label: 'Active',
          count: statusCounts.active || 0,
          icon: <Icons.Circle size={16} />,
          color: 'text-theme-accent-green',
        },
        {
          id: 'status-on-hold',
          label: 'On Hold',
          count: statusCounts['on-hold'] || 0,
          icon: <Icons.Clock size={16} />,
          color: 'text-theme-accent-yellow',
        },
        {
          id: 'status-completed',
          label: 'Completed',
          count: statusCounts.completed || 0,
          icon: <Icons.CheckCircle size={16} />,
          color: 'text-theme-accent-green',
        },
        {
          id: 'status-dropped',
          label: 'Dropped',
          count: statusCounts.dropped || 0,
          icon: <Icons.XCircle size={16} />,
          color: 'text-theme-accent-red',
        },
      ],
      [statusCounts]
    )

    // Memoize main sections to prevent recreation
    const mainSections = useMemo(
      () => [
        {
          id: 'all-notes',
          label: 'All Notes',
          count: totalNotes,
          icon: <Icons.FileText size={16} />,
        },
        {
          id: 'pinned',
          label: 'Pinned',
          count: pinnedNotes,
          icon: <Icons.Star size={16} />,
        },
      ],
      [totalNotes, pinnedNotes]
    )

    // Memoize system sections
    const systemSections = useMemo(
      () => [
        {
          id: 'trash',
          label: 'Trash',
          count: trashedNotes,
          icon: <Icons.Trash size={16} />,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Icons.Settings size={16} />,
        },
      ],
      [trashedNotes]
    )

    // Memoize SidebarButton to prevent re-renders
    const SidebarButton = memo(({ section, isActive, onClick, children }) => (
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
        onMouseEnter={e => {
          if (!isActive) {
            e.target.style.backgroundColor = 'var(--color-hover-bg)'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.target.style.backgroundColor = 'transparent'
          }
        }}
        onClick={onClick}
      >
        {children}
      </button>
    ))

    // Memoize CollapsibleSection
    const CollapsibleSection = memo(
      ({ title, icon, isExpanded, onToggle, children }) => (
        <div>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider text-theme-text-muted font-medium hover:text-theme-text-tertiary transition-colors"
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-0 mt-1">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    )

    return (
      <div className="w-full sidebar-modern flex flex-col h-full ui-font">
        {/* Main Sections */}
        <div className="space-y-0">
          {mainSections.map(section => (
            <SidebarButton
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="opacity-75">{section.icon}</span>
                <span>{section.label}</span>
              </div>
              <span className="text-xs opacity-75">{section.count}</span>
            </SidebarButton>
          ))}
        </div>

        {/* Notebooks Section */}
        <div>
          <CollapsibleSection
            title="Notebooks"
            icon={<Icons.Book size={14} />}
            isExpanded={expandedSections.notebooks}
            onToggle={useCallback(
              () => toggleSection('notebooks'),
              [toggleSection]
            )}
          >
            {notebooksWithCounts.length > 0 ? (
              notebooksWithCounts.map(notebook => (
                <div key={notebook.id} className="relative group">
                  <SidebarButton
                    section={notebook}
                    isActive={
                      activeSection ===
                      `notebook-${notebook.name.toLowerCase()}`
                    }
                    onClick={() =>
                      handleSectionClick(
                        `notebook-${notebook.name.toLowerCase()}`
                      )
                    }
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
                    onClick={e => {
                      e.stopPropagation()
                      onManageNotebooks()
                    }}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs border border-theme-text-muted text-theme-text-muted hover:text-theme-text-secondary hover:border-theme-text-secondary rounded"
                    title="Edit notebook"
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
              onClick={handleNewNote}
              className="w-full px-7 py-2 text-xs text-theme-accent-primary hover:text-theme-accent-primary/80 text-left transition-colors"
              onMouseEnter={e => {
                e.target.style.backgroundColor = 'var(--color-hover-bg)'
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              + New Note
            </button>

            <button
              onClick={handleManageNotebooks}
              className="w-full px-7 py-2 text-xs text-theme-text-tertiary hover:text-theme-text-secondary text-left transition-colors"
              onMouseEnter={e => {
                e.target.style.backgroundColor = 'var(--color-hover-bg)'
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              Manage Notebooks
            </button>
          </CollapsibleSection>
        </div>

        {/* System Sections */}
        <div className="space-y-0">
          {systemSections.map(section => (
            <SidebarButton
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="opacity-75">{section.icon}</span>
                <span>{section.label}</span>
              </div>
              {section.count !== undefined && (
                <span className="text-xs opacity-75">
                  {section.count === 0 && section.id === 'trash'
                    ? 'Empty'
                    : section.count}
                </span>
              )}
            </SidebarButton>
          ))}
        </div>

        {/* Status Section */}
        <div>
          <CollapsibleSection
            title="Status"
            icon={<Icons.Circle size={14} />}
            isExpanded={expandedSections.status}
            onToggle={useCallback(
              () => toggleSection('status'),
              [toggleSection]
            )}
          >
            {statusSections.map(status => (
              <SidebarButton
                key={status.id}
                section={status}
                isActive={activeSection === status.id}
                onClick={() => handleSectionClick(status.id)}
              >
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`opacity-75 ${status.color}`}>
                    {status.icon}
                  </span>
                  <span className="text-xs">{status.label}</span>
                </div>
                <span className="text-xs opacity-75">{status.count}</span>
              </SidebarButton>
            ))}
          </CollapsibleSection>
        </div>

        {/* Tags Section */}
        <div>
          <CollapsibleSection
            title="Tags"
            icon={<Icons.Tag size={14} />}
            isExpanded={expandedSections.tags}
            onToggle={useCallback(() => toggleSection('tags'), [toggleSection])}
          >
            <div className="max-h-32 overflow-y-auto">
              {sortedTags.length > 0 ? (
                sortedTags.map(([tag, count]) => (
                  <SidebarButton
                    key={tag}
                    section={{ id: `tag-${tag}` }}
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
        </div>

        {/* User Info */}
        <div className="mt-auto px-3 pb-3 pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-theme-accent-primary rounded-full flex items-center justify-center">
              <span className="text-theme-text-primary text-xs font-medium">
                U
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-theme-text-secondary font-medium truncate">
                User
              </div>
              <div className="text-xs text-theme-text-muted">
                Started{' '}
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default Sidebar
