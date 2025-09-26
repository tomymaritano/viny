import React, { useState, useMemo } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { Icons } from '../Icons'
import type { SettingsSchema } from '../../services/settings/types'

interface SettingsSearchProps {
  onNavigate: (category: string, settingKey?: string) => void
  onClose?: () => void
  isModal?: boolean
}

interface SearchResult {
  schema: SettingsSchema
  relevance: number
  matchType: 'label' | 'description' | 'key' | 'category'
}

export const SettingsSearch: React.FC<SettingsSearchProps> = ({
  onNavigate,
  onClose,
  isModal = false,
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { schemas } = useSettings()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const searchQuery = query.toLowerCase().trim()
    const results: SearchResult[] = []

    schemas.forEach(schema => {
      let relevance = 0
      let matchType: SearchResult['matchType'] = 'description'

      // Exact key match (highest priority)
      if (schema.key.toLowerCase() === searchQuery) {
        relevance = 100
        matchType = 'key'
      }
      // Key starts with query
      else if (schema.key.toLowerCase().startsWith(searchQuery)) {
        relevance = 90
        matchType = 'key'
      }
      // Key contains query
      else if (schema.key.toLowerCase().includes(searchQuery)) {
        relevance = 80
        matchType = 'key'
      }
      // Exact label match
      else if (schema.label.toLowerCase() === searchQuery) {
        relevance = 85
        matchType = 'label'
      }
      // Label starts with query
      else if (schema.label.toLowerCase().startsWith(searchQuery)) {
        relevance = 75
        matchType = 'label'
      }
      // Label contains query
      else if (schema.label.toLowerCase().includes(searchQuery)) {
        relevance = 65
        matchType = 'label'
      }
      // Category match
      else if (schema.category.toLowerCase().includes(searchQuery)) {
        relevance = 50
        matchType = 'category'
      }
      // Description contains query
      else if (schema.description?.toLowerCase().includes(searchQuery)) {
        relevance = 40
        matchType = 'description'
      }

      if (relevance > 0) {
        results.push({ schema, relevance, matchType })
      }
    })

    // Sort by relevance (highest first)
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
  }, [query, schemas])

  const highlightMatch = (text: string, query: string): React.ReactElement => {
    if (!query.trim()) return <span>{text}</span>

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    )
    const parts = text.split(regex)

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    )
  }

  const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'key':
        return <Icons.Settings size={12} className="text-blue-500" />
      case 'label':
        return <Icons.Tag size={12} className="text-green-500" />
      case 'category':
        return <Icons.Folder size={12} className="text-orange-500" />
      case 'description':
        return <Icons.FileText size={12} className="text-gray-500" />
      default:
        return null
    }
  }

  const getCategoryDisplayName = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      general: 'General',
      themes: 'Themes',
      editor: 'Editor',
      preview: 'Preview',
      privacy: 'Privacy',
    }
    return categoryMap[categoryId] || categoryId
  }

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.schema.category, result.schema.key)
    setQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (onClose) {
        onClose()
      } else {
        setQuery('')
        setIsOpen(false)
      }
    }
  }

  // Modal mode - full search interface
  if (isModal) {
    return (
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-theme-border-primary">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search settings..."
              className="w-full pl-10 pr-10 py-3 bg-theme-bg-secondary border border-theme-border-primary rounded-lg text-sm text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
              autoFocus
            />
            <Icons.Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary"
              >
                <Icons.X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {query.trim() ? (
            searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map(result => (
                  <button
                    key={`${result.schema.category}-${result.schema.key}`}
                    onClick={() => {
                      handleResultClick(result)
                      onClose?.()
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-theme-bg-secondary rounded-lg transition-colors mb-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getMatchTypeIcon(result.matchType)}
                          <span className="text-sm font-medium text-theme-text-primary">
                            {highlightMatch(result.schema.label, query)}
                          </span>
                          <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-2 py-0.5 rounded">
                            {getCategoryDisplayName(result.schema.category)}
                          </span>
                        </div>

                        {result.schema.description && (
                          <p className="text-xs text-theme-text-muted line-clamp-2">
                            {highlightMatch(result.schema.description, query)}
                          </p>
                        )}
                      </div>

                      <Icons.ChevronRight
                        size={14}
                        className="text-theme-text-muted ml-2 flex-shrink-0"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-12 text-center text-theme-text-muted">
                <Icons.Search size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No settings found for "{query}"</p>
                <p className="text-xs mt-1">
                  Try searching for features like "font", "theme", or "backup"
                </p>
              </div>
            )
          ) : (
            <div className="p-6">
              <h3 className="text-sm font-medium text-theme-text-secondary mb-4">
                Popular Settings
              </h3>
              <div className="grid gap-2">
                {['Theme', 'Font Size', 'Auto Save', 'Privacy', 'Backup'].map(
                  item => (
                    <button
                      key={item}
                      onClick={() => setQuery(item.toLowerCase())}
                      className="text-left px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-lg transition-colors"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Inline mode - original dropdown behavior
  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search settings..."
          className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
        />
        <Icons.Search
          size={16}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted hover:text-theme-text-primary"
          >
            <Icons.X size={16} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-theme-bg-primary border border-theme-border-primary rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.schema.category}-${result.schema.key}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-theme-bg-secondary transition-colors border-b border-theme-border-primary last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getMatchTypeIcon(result.matchType)}
                        <span className="text-sm font-medium text-theme-text-primary truncate">
                          {highlightMatch(result.schema.label, query)}
                        </span>
                        <span className="text-xs text-theme-text-muted bg-theme-bg-tertiary px-2 py-1 rounded">
                          {getCategoryDisplayName(result.schema.category)}
                        </span>
                      </div>

                      {result.schema.description && (
                        <p className="text-xs text-theme-text-muted line-clamp-2">
                          {highlightMatch(result.schema.description, query)}
                        </p>
                      )}

                      {result.matchType === 'key' && (
                        <p className="text-xs text-theme-text-muted mt-1 font-mono">
                          Key: {highlightMatch(result.schema.key, query)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      {result.schema.experimental && (
                        <span className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400 px-2 py-1 rounded">
                          Beta
                        </span>
                      )}
                      <Icons.ChevronRight
                        size={14}
                        className="text-theme-text-muted"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-theme-text-muted">
              <Icons.Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No settings found for "{query}"</p>
              <p className="text-xs mt-1">
                Try searching for features like "font", "theme", or "backup"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

interface QuickSearchProps {
  onNavigate: (category: string, settingKey?: string) => void
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ onNavigate }) => {
  const commonSearches = [
    { label: 'Dark mode', category: 'themes', key: 'theme' },
    { label: 'Font size', category: 'editor', key: 'fontSize' },
    { label: 'Auto save', category: 'editor', key: 'autoSave' },
    { label: 'Privacy settings', category: 'privacy' },
    { label: 'Backup settings', category: 'general' },
    { label: 'Preview theme', category: 'preview', key: 'previewTheme' },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-theme-text-secondary">
        Quick Access
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {commonSearches.map(search => (
          <button
            key={`${search.category}-${search.key || 'all'}`}
            onClick={() => onNavigate(search.category, search.key)}
            className="p-3 text-left bg-theme-bg-secondary border border-theme-border-primary rounded-md hover:bg-theme-bg-tertiary transition-colors"
          >
            <span className="text-sm text-theme-text-primary">
              {search.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
