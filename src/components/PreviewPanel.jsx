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
      className="theme-bg-primary border-l border-theme-border-primary flex flex-col h-full markdown-font w-full"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-theme-border-primary theme-bg-secondary">
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
              <span className="text-xs px-2 py-1 theme-bg-tertiary text-theme-text-secondary rounded">
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
        className="flex-1 overflow-y-auto relative theme-bg-primary custom-scrollbar"
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
      </motion.div>

      {/* Footer removed - stats shown in main editor status bar */}
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
