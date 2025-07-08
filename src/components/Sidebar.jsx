import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotebooks } from '../hooks/useNotebooks'

const Sidebar = ({
  activeSection,
  setActiveSection,
  onNewNote,
  notes = [],
  onManageNotebooks,
}) => {
  const { notebooks, getColorClass } = useNotebooks()
  // Dropdown states
  const [expandedSections, setExpandedSections] = useState({
    notebooks: true,
    tags: false,
    recent: false,
  })

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
    .sort((a, b) => b.count - a.count)

  // Get all tags with counts
  const tagCounts = notes.reduce((acc, note) => {
    if (!note.isTrashed) {
      note.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
    }
    return acc
  }, {})
  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a)

  // Get recent notes (last 5 modified)
  const recentNotes = [...notes]
    .filter(note => !note.isTrashed)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date)
    )
    .slice(0, 5)

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const quickSections = [
    {
      id: 'all-notes',
      label: 'All Notes',
      count: totalNotes,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v8h8V4H4z" />
        </svg>
      ),
    },
    {
      id: 'pinned',
      label: 'Pinned Notes',
      count: pinnedNotes,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L8 2z" />
        </svg>
      ),
    },
  ]

  const systemSections = [
    {
      id: 'trash',
      label: 'Trash',
      count: trashedNotes,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 2V1h4v1h3v1H3V2h3zm1 2v8h2V4H7zm-3 0v8h1V4H4zm6 0v8h1V4h-1z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 002.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 00-1.115 2.692l.319.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 00-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 00-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.318a1.873 1.873 0 00-2.692-1.116l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 002.025 8.91l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 003.141 4.35l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 002.692-1.115l.094-.32z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="w-60 bg-solarized-base02 border-r border-solarized-base01 flex flex-col h-full font-sans">
      {/* Header */}
      <div className="px-2 py-3 border-b border-solarized-base01">
        <h1 className="text-base font-semibold text-solarized-base5">Nototo</h1>
      </div>

      {/* Quick Access */}
      <div className="px-2 py-2">
        <div className="space-y-1">
          {quickSections.map(section => (
            <motion.button
              key={section.id}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded text-left relative overflow-hidden ${
                activeSection === section.id
                  ? 'bg-solarized-blue text-solarized-base5'
                  : 'text-solarized-base1 hover:text-solarized-base3'
              }`}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Active indicator */}
              {activeSection === section.id && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-solarized-cyan"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Hover background */}
              {activeSection !== section.id && (
                <motion.div
                  className="absolute inset-0 bg-solarized-base01 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              <div className="flex items-center space-x-2 relative z-10">
                <motion.span
                  className="opacity-75"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {section.icon}
                </motion.span>
                <span>{section.label}</span>
              </div>
              <span className="text-xs opacity-75 relative z-10">
                {section.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notebooks */}
      <div className="flex-1 px-2">
        <button
          onClick={() => toggleSection('notebooks')}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs uppercase tracking-wider text-solarized-base0 font-medium hover:text-solarized-base1 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v6h10V5H3z" />
            </svg>
            <span>Notebooks</span>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`transition-transform ${expandedSections.notebooks ? 'rotate-90' : ''}`}
          >
            <path
              d="M4.5 2L8.5 6L4.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <AnimatePresence>
          {expandedSections.notebooks && (
            <motion.div
              className="space-y-0.5 mt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {notebooksWithCounts.length > 0 ? (
                notebooksWithCounts.map((notebook, index) => (
                  <motion.button
                    key={notebook.id}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded text-left group relative overflow-hidden ${
                      activeSection ===
                      `notebook-${notebook.name.toLowerCase()}`
                        ? 'bg-solarized-blue text-solarized-base5'
                        : 'text-solarized-base1 hover:text-solarized-base3'
                    }`}
                    onClick={() =>
                      setActiveSection(
                        `notebook-${notebook.name.toLowerCase()}`
                      )
                    }
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active indicator */}
                    {activeSection ===
                      `notebook-${notebook.name.toLowerCase()}` && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-solarized-cyan"
                        layoutId="notebookActiveIndicator"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover background */}
                    {activeSection !==
                      `notebook-${notebook.name.toLowerCase()}` && (
                      <motion.div
                        className="absolute inset-0 bg-solarized-base01 opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <div className="flex items-center space-x-2 relative z-10">
                      <motion.div
                        className={`w-1.5 h-1.5 rounded-full ${getColorClass(notebook.color).replace('text-', 'bg-')}`}
                        whileHover={{ scale: 1.3 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      />
                      <span>{notebook.name}</span>
                    </div>
                    <span className="text-xs opacity-75 relative z-10">
                      {notebook.count}
                    </span>
                  </motion.button>
                ))
              ) : (
                <motion.div
                  className="px-2 py-1.5 text-xs text-solarized-base0 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  No notebooks yet
                </motion.div>
              )}

              <motion.button
                onClick={onNewNote}
                className="w-full px-2 py-1.5 text-sm text-solarized-blue hover:text-solarized-base3 text-left mt-1 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: notebooksWithCounts.length * 0.05 + 0.1 }}
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                + New Note
              </motion.button>

              <motion.button
                onClick={onManageNotebooks}
                className="w-full px-2 py-1.5 text-sm text-solarized-base1 hover:text-solarized-base3 text-left transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: notebooksWithCounts.length * 0.05 + 0.15 }}
                whileHover={{ scale: 1.05, x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                Manage Notebooks
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags */}
      <div className="px-3 mb-3">
        <button
          onClick={() => toggleSection('tags')}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs uppercase tracking-wider text-solarized-base0 font-medium hover:text-solarized-base1 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 1l6 6-6 6L2 7.5 8.5 1zm0 2L4 8.5l4.5 4.5L13 8.5 8.5 3z" />
            </svg>
            <span>Tags</span>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`transition-transform ${expandedSections.tags ? 'rotate-90' : ''}`}
          >
            <path
              d="M4.5 2L8.5 6L4.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {expandedSections.tags && (
          <div className="space-y-0.5 mt-1 max-h-28 overflow-y-auto">
            {sortedTags.length > 0 ? (
              sortedTags.map(([tag, count]) => (
                <button
                  key={tag}
                  className={`w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors text-left ${
                    activeSection === `tag-${tag}`
                      ? 'bg-solarized-blue text-solarized-base5'
                      : 'text-solarized-base1 hover:bg-solarized-base01 hover:text-solarized-base3'
                  }`}
                  onClick={() => setActiveSection(`tag-${tag}`)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-solarized-base0 text-xs">#</span>
                    <span>{tag}</span>
                  </div>
                  <span className="text-xs opacity-75">{count}</span>
                </button>
              ))
            ) : (
              <div className="px-2 py-1.5 text-xs text-solarized-base0 italic">
                No tags yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Notes */}
      <div className="px-3 mb-3">
        <button
          onClick={() => toggleSection('recent')}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs uppercase tracking-wider text-solarized-base0 font-medium hover:text-solarized-base1 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3zm0 1v4l3 2-.5 1L7 9V4h1z" />
            </svg>
            <span>Recent</span>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`transition-transform ${expandedSections.recent ? 'rotate-90' : ''}`}
          >
            <path
              d="M4.5 2L8.5 6L4.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {expandedSections.recent && (
          <div className="space-y-0.5 mt-1">
            {recentNotes.length > 0 ? (
              <>
                {recentNotes.map(note => (
                  <button
                    key={note.id}
                    className="w-full px-2 py-1.5 text-left rounded transition-colors hover:bg-solarized-base01 group"
                    onClick={() => {
                      setActiveSection('all-notes')
                      // Could add onSelectNote callback here if needed
                    }}
                    title={note.title}
                  >
                    <div className="text-sm text-solarized-base3 line-clamp-1">
                      {note.title}
                    </div>
                    <div className="text-xs text-solarized-base0 mt-0.5">
                      {note.updatedAt
                        ? new Date(note.updatedAt).toLocaleDateString()
                        : note.date}
                    </div>
                  </button>
                ))}
                <motion.button
                  onClick={() => setActiveSection('recent')}
                  className="w-full px-2 py-1.5 text-sm text-solarized-blue hover:text-solarized-base3 text-left mt-1 transition-colors"
                  whileHover={{ scale: 1.05, x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Recent (⌘+R)
                </motion.button>
              </>
            ) : (
              <div className="px-2 py-1.5 text-xs text-solarized-base0 italic">
                No recent notes
              </div>
            )}
          </div>
        )}
      </div>

      {/* System */}
      <div className="px-3 py-2 border-t border-solarized-base01 space-y-0.5">
        {systemSections.map((section, index) => (
          <motion.button
            key={section.id}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded text-left relative overflow-hidden ${
              activeSection === section.id
                ? 'bg-solarized-blue text-solarized-base5'
                : 'text-solarized-base1 hover:text-solarized-base3'
            }`}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* Active indicator */}
            {activeSection === section.id && (
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-solarized-cyan"
                layoutId="systemActiveIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            {/* Hover background */}
            {activeSection !== section.id && (
              <motion.div
                className="absolute inset-0 bg-solarized-base01 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            <div className="flex items-center space-x-2 relative z-10">
              <motion.span
                className="opacity-75"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {section.icon}
              </motion.span>
              <span>{section.label}</span>
            </div>
            {section.count !== undefined && (
              <span className="text-xs opacity-75 relative z-10">
                {section.count === 0 && section.id === 'trash'
                  ? 'Empty'
                  : section.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-solarized-base01">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-solarized-blue rounded-full flex items-center justify-center">
            <span className="text-solarized-base5 text-xs font-medium">U</span>
          </div>
          <div className="flex-1">
            <div className="text-sm text-solarized-base3 font-medium">User</div>
            <div className="text-xs text-solarized-base0">
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

export default Sidebar
