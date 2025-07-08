import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Icons from './Icons'

const PreviewPanel = ({ note, isVisible, onClose }) => {
  if (!note || !isVisible) return null

  const getPreviewHtml = () => {
    if (!note.content)
      return '<p class="text-solarized-base1">This note is empty</p>'

    const html = marked(note.content, {
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
    })

    return DOMPurify.sanitize(html)
  }

  // Get tag color from localStorage or fallback to predefined colors
  const getTagColor = tag => {
    // Get stored tag colors
    const storedColors = localStorage.getItem('inkrun-tag-colors')
    const customColors = storedColors ? JSON.parse(storedColors) : {}

    // Color mapping
    const colorClasses = {
      default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
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
      className="bg-solarized-base03 border-l border-solarized-base01 flex flex-col h-full font-sans w-full"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-solarized-base01 bg-solarized-base02">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {note.isPinned && (
                <span className="text-solarized-yellow">*</span>
              )}
              <h1 className="text-lg font-semibold text-solarized-base5 line-clamp-1">
                {note.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 bg-solarized-base01 text-solarized-base2 rounded">
                {note.notebook}
              </span>
              <span className="text-xs text-solarized-base0">{note.date}</span>
            </div>
          </div>

          <motion.button
            onClick={onClose}
            className="p-1 text-solarized-base1 hover:text-solarized-base3 hover:bg-solarized-base01 rounded transition-colors"
            title="Close preview"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icons.X size={16} />
          </motion.button>
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
        className="flex-1 overflow-y-auto relative bg-solarized-base03"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="p-6 prose prose-invert max-w-none"
          style={{
            color: '#839496',
            lineHeight: '1.7',
          }}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
        />
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        className="px-4 py-2 bg-solarized-base02 border-t border-solarized-base01 text-xs text-solarized-base0 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <span>
            Words:{' '}
            {note.content
              ? note.content.split(/\s+/).filter(word => word.length > 0).length
              : 0}
          </span>
          <span>Characters: {note.content ? note.content.length : 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Preview</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PreviewPanel
