/**
 * Note Summary Card Component
 * Displays AI-generated summaries for notes
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../Icons'
import type { RAGSystem } from '@/lib/rag'
import { type NoteSummary, type SummaryOptions } from '@/lib/rag'
import type { Note } from '@/types'
import { logger } from '@/utils/logger'

interface NoteSummaryCardProps {
  ragSystem: RAGSystem
  note: Note
  defaultStyle?: SummaryOptions['style']
  autoGenerate?: boolean
}

export const NoteSummaryCard: React.FC<NoteSummaryCardProps> = ({
  ragSystem,
  note,
  defaultStyle = 'brief',
  autoGenerate = false,
}) => {
  const [summary, setSummary] = useState<NoteSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedStyle, setSelectedStyle] =
    useState<SummaryOptions['style']>(defaultStyle)

  useEffect(() => {
    if (autoGenerate) {
      generateSummary()
    }
  }, [note.id, note.updatedAt, autoGenerate])

  const generateSummary = async () => {
    setIsLoading(true)
    setSummary(null)

    try {
      const result = await ragSystem.summarizeNote(note, {
        style: selectedStyle,
      })
      setSummary(result)
    } catch (error) {
      logger.error('Failed to generate summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStyleChange = (style: SummaryOptions['style']) => {
    setSelectedStyle(style)
    if (summary) {
      generateSummary()
    }
  }

  const styleOptions: Array<{
    value: SummaryOptions['style']
    label: string
    icon: any
  }> = [
    { value: 'brief', label: 'Brief', icon: Icons.FileText },
    { value: 'detailed', label: 'Detailed', icon: Icons.FileText },
    { value: 'bullet-points', label: 'Bullets', icon: Icons.List },
    { value: 'key-insights', label: 'Insights', icon: Icons.Lightbulb },
  ]

  if (!summary && !isLoading && !autoGenerate) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <button
          onClick={generateSummary}
          className="w-full flex items-center justify-center gap-2 py-2 px-4
                   text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900
                   dark:hover:text-gray-100 transition-colors"
        >
          <Icons.FileText className="w-4 h-4" />
          Generate Summary
        </button>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 
                    shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            AI Summary
          </h3>

          <div className="flex items-center gap-2">
            {/* Style selector */}
            <div className="flex items-center gap-1">
              {styleOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStyleChange(option.value)}
                  className={`p-1.5 rounded transition-colors ${
                    selectedStyle === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={option.label}
                >
                  <option.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={generateSummary}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Regenerate summary"
            >
              <Icons.RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Expand/collapse button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                       transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icons.ChevronDown
                className={`w-3.5 h-3.5 transform transition-transform
                ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`px-4 py-3 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Icons.Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Generating summary...</span>
          </div>
        ) : summary ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {summary.summary}
            </div>

            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div className="pt-2 border-t dark:border-gray-700">
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Key Points:
                </h4>
                <ul className="space-y-1">
                  {summary.keyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-600 dark:text-gray-400 
                                           flex items-start gap-1"
                    >
                      <Icons.ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {summary && (
        <div
          className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t 
                        dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center justify-between">
            <span>{summary.wordCount} words</span>
            <span>{summary.readingTime} min read</span>
          </div>
        </div>
      )}

      {/* Gradient overlay for collapsed state */}
      {!isExpanded && summary && (
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t 
                        from-white dark:from-gray-800 to-transparent pointer-events-none"
        />
      )}
    </div>
  )
}
