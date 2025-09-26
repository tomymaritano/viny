/**
 * Tag Suggestions Component
 * AI-powered tag suggestions for notes
 */

import React, { useState, useEffect } from 'react'
import { Icons } from '../Icons'
import type { RAGSystem } from '@/lib/rag'
import { type TagSuggestion } from '@/lib/rag'
import type { Note } from '@/types'
import { logger } from '@/utils/logger'

interface TagSuggestionsProps {
  ragSystem: RAGSystem
  note: Note
  existingTags: string[]
  onApplyTags: (tags: string[]) => void
}

export const TagSuggestions: React.FC<TagSuggestionsProps> = ({
  ragSystem,
  note,
  existingTags,
  onApplyTags,
}) => {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Update RAG system with existing tags
    ragSystem.updateTagsList(existingTags)
  }, [existingTags, ragSystem])

  useEffect(() => {
    loadSuggestions()
  }, [note.id, note.updatedAt])

  const loadSuggestions = async () => {
    setIsLoading(true)
    setSuggestions([])
    setSelectedTags(new Set())

    try {
      const tags = await ragSystem.suggestTags(note, {
        maxTags: 8,
        minConfidence: 0.6,
        useLLM: true,
      })

      setSuggestions(tags)

      // Auto-select high confidence tags
      const autoSelect = new Set(
        tags
          .filter(t => t.confidence >= 0.85 && !note.tags.includes(t.tag))
          .map(t => t.tag)
      )
      setSelectedTags(autoSelect)
    } catch (error) {
      logger.error('Failed to get tag suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags)
    if (newSelected.has(tag)) {
      newSelected.delete(tag)
    } else {
      newSelected.add(tag)
    }
    setSelectedTags(newSelected)
  }

  const applySelectedTags = () => {
    if (selectedTags.size > 0) {
      onApplyTags(Array.from(selectedTags))
      setSelectedTags(new Set())
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.85) return 'High'
    if (confidence >= 0.7) return 'Medium'
    return 'Low'
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Icons.Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Analyzing note for tag suggestions...</span>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  const newSuggestions = suggestions.filter(s => !note.tags.includes(s.tag))

  if (newSuggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icons.Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Suggested Tags
          </h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200"
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>

      <div className="space-y-2">
        {newSuggestions.map(suggestion => (
          <div
            key={suggestion.tag}
            className={`flex items-center justify-between p-2 rounded-lg border
                      ${
                        selectedTags.has(suggestion.tag)
                          ? 'bg-blue-100 dark:bg-blue-800/30 border-blue-300 dark:border-blue-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } cursor-pointer transition-colors`}
            onClick={() => toggleTag(suggestion.tag)}
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={selectedTags.has(suggestion.tag)}
                onChange={() => toggleTag(suggestion.tag)}
                className="rounded text-blue-600 focus:ring-blue-500"
                onClick={e => e.stopPropagation()}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.tag}
                  </span>
                  <span
                    className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                  >
                    {getConfidenceLabel(suggestion.confidence)}
                  </span>
                </div>

                {showDetails && suggestion.reason && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.reason}
                  </p>
                )}
              </div>
            </div>

            {showDetails && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(suggestion.confidence * 100).toFixed(0)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={loadSuggestions}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200"
        >
          Refresh suggestions
        </button>

        <button
          onClick={applySelectedTags}
          disabled={selectedTags.size === 0}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          Apply {selectedTags.size > 0 && `(${selectedTags.size})`}
        </button>
      </div>
    </div>
  )
}
