import { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from './Icons'
import { useSettings } from '../hooks/useSettings'
import { renderMarkdownToHtml } from '../utils/markdownRenderer'

const PreviewPanel = ({ note, isVisible, onClose }) => {
  const { settings } = useSettings()
  if (!note || !isVisible) return null

  const getPreviewHtml = () => {
    return renderMarkdownToHtml(note.content)
  }

  // Get tag color from localStorage or fallback to predefined colors
  const getTagColor = tag => {
    // Get stored tag colors
    const storedColors = localStorage.getItem('inkrun-tag-colors')
    const customColors = storedColors ? JSON.parse(storedColors) : {}

    // Color mapping
    const colorClasses = {
      default: 'theme-tag-default',
      blue: 'theme-tag-blue',
      green: 'theme-tag-green',
      purple: 'theme-tag-purple',
      cyan: 'theme-tag-cyan',
      orange: 'theme-tag-orange',
      pink: 'theme-tag-pink',
      indigo: 'theme-tag-indigo',
      amber: 'theme-tag-amber',
      emerald: 'theme-tag-emerald',
      red: 'theme-tag-red',
      violet: 'theme-tag-violet',
    }

    // Predefined tag colors for common tags
    const predefinedColors = {
      project: 'blue',
      planning: 'green',
      documentation: 'purple',
      architecture: 'cyan',
      api: 'orange',
      reference: 'pink',
      'user-guide': 'indigo',
      help: 'amber',
      setup: 'emerald',
      development: 'red',
      learning: 'violet',
      vim: 'default',
    }

    // Check custom colors first, then predefined, then default
    const colorKey = customColors[tag] || predefinedColors[tag] || 'default'
    return colorClasses[colorKey] || colorClasses.default
  }

  return (
    <motion.div
      className="bg-theme-bg-primary border-l border-theme-border-primary flex flex-col h-full markdown-font w-full"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-theme-border-primary bg-theme-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {note.isPinned && (
                <span className="text-theme-accent-yellow">*</span>
              )}
              <h1 className="text-lg font-semibold text-theme-text-primary line-clamp-1">
                {note.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-theme-bg-tertiary text-theme-text-secondary rounded">
                {note.notebook}
              </span>
              <span className="text-xs text-theme-text-muted">{note.date}</span>
            </div>
          </div>

          {/* Close button removed - panel should be toggled via toolbar */}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <motion.div
            className="flex items-center space-x-2 mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {note.tags.map((tag, index) => (
              <motion.span
                key={tag}
                className={`text-xs px-2 py-1 rounded border ${getTagColor(tag)}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                #{tag}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 overflow-y-auto relative bg-theme-bg-primary custom-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          key={settings.theme}
          className="p-6 markdown-content"
          style={{
            color: 'var(--color-base0)',
            lineHeight: '1.4',
            maxWidth: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
        />
        <style jsx>{`
          .markdown-content {
            /* Links */
            :global(a) {
              color: #587EC6 !important;
              text-decoration: none;
              border-bottom: 1px solid #587EC6;
            }
            
            /* Code inline */
            :global(code) {
              color: #ffffff !important;
              background-color: #2A2929 !important;
              padding: 0.15em 0.35em;
              border-radius: 6px;
              font-size: 0.9em;
              border: none !important;
            }
            
            /* Kbd elements */
            :global(kbd) {
              background-color: #292828 !important;
              color: #ffffff !important;
              padding: 0.1em 0.4em;
              border-radius: 4px;
              border: 1px solid #1a1a1a !important;
              font-size: 0.85em;
              font-family: monospace;
            }
            
            /* Headers */
            :global(h1), :global(h2), :global(h3), :global(h4), :global(h5), :global(h6) {
              border-bottom: 0.5px solid #444444 !important;
              padding-bottom: 0.3em;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            
            /* Lists */
            :global(ul), :global(ol) {
              padding-left: 1.5em !important;
              margin: 0.5em 0 !important;
            }
            
            :global(li) {
              margin: 0.25em 0 !important;
              line-height: 1.5 !important;
            }
            
            /* Nested lists */
            :global(li ul), :global(li ol) {
              padding-left: 1em !important;
              margin: 0.25em 0 !important;
            }
          }
        `}</style>
      </motion.div>

      {/* Date Information */}
      <motion.div
        className="p-4 border-t border-theme-border-primary bg-theme-bg-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-2 text-sm">
          {/* Created At */}
          <div className="flex items-center space-x-2 text-theme-text-muted">
            <Icons.Clock4 size={14} />
            <span className="font-medium">CREATED AT</span>
          </div>
          <div className="text-theme-text-secondary ml-6">
            {note.createdAt || note.date}
          </div>
          
          {/* Updated At */}
          <div className="flex items-center space-x-2 text-theme-text-muted mt-3">
            <Icons.SquarePen size={14} />
            <span className="font-medium">UPDATED AT</span>
          </div>
          <div className="text-theme-text-secondary ml-6">
            {note.updatedAt}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PreviewPanel, (prevProps, nextProps) => {
  return (
    prevProps.note?.id === nextProps.note?.id &&
    prevProps.note?.content === nextProps.note?.content &&
    prevProps.isVisible === nextProps.isVisible
  )
})
