import React, { useState, useCallback } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { SettingsSchema, SettingValue } from '../../services/settings/types'
import { LivePreviewControls } from './LivePreview'
import { Icons } from '../Icons'

interface SettingsPanelProps {
  categoryId?: string
  onClose?: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ categoryId }) => {
  const {
    settings,
    schemas,
    setSetting,
    resetSetting,
    errors,
    loading,
    previewSetting,
    revertPreview
  } = useSettings({ category: categoryId })
  
  // Mock categories data for now
  const categories = [
    { id: 'general', label: 'General', description: 'General settings' },
    { id: 'themes', label: 'Themes', description: 'Theme settings' },
    { id: 'editor', label: 'Editor', description: 'Editor settings' }
  ]

  const [activeCategory, setActiveCategory] = useState(categoryId || categories[0]?.id)
  const [previewingKeys, setPreviewingKeys] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const handleSettingChange = useCallback(async (key: string, value: SettingValue, preview = false) => {
    try {
      if (preview) {
        previewSetting(key, value)
        setPreviewingKeys(prev => new Set(prev).add(key))
      } else {
        setSetting(key, value)
        setPreviewingKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(key)
          return newSet
        })
      }
    } catch (error) {
      console.error(`Failed to ${preview ? 'preview' : 'update'} setting:`, error)
    }
  }, [setSetting, previewSetting])

  const handleApplyPreview = useCallback(async (key: string, value: SettingValue) => {
    setSetting(key, value)
    setPreviewingKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [setSetting])

  const handleRevertPreview = useCallback(async (key: string) => {
    revertPreview(key)
    setPreviewingKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [revertPreview])

  const filteredSchemas = schemas.filter(schema => 
    !searchQuery || 
    schema.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schema.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderSetting = (schema: SettingsSchema) => {
    const value = settings[schema.key]
    const error = errors[schema.key]
    const isPreviewing = previewingKeys.has(schema.key)

    return (
      <div key={schema.key} className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-theme-text-primary">
              {schema.label}
              {schema.experimental && (
                <span className="ml-2 text-xs text-theme-accent-yellow">Experimental</span>
              )}
            </label>
            {schema.description && (
              <p className="text-xs text-theme-text-muted mt-1">{schema.description}</p>
            )}
          </div>
          {schema.defaultValue !== value && (
            <button
              onClick={() => resetSetting(schema.key)}
              className="text-xs text-theme-text-muted hover:text-theme-text-primary"
            >
              Reset
            </button>
          )}
        </div>

        {renderControl(schema, value, isPreviewing)}

        {error && (
          <p className="text-xs text-theme-accent-red mt-1">{error}</p>
        )}

        {isPreviewing && (
          <LivePreviewControls
            isActive={true}
            onApply={() => handleApplyPreview(schema.key, value)}
            onRevert={() => handleRevertPreview(schema.key)}
            className="mt-2"
          />
        )}
      </div>
    )
  }

  const renderControl = (schema: SettingsSchema, value: SettingValue, isPreviewing: boolean) => {
    const shouldPreview = !isPreviewing

    switch (schema.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleSettingChange(schema.key, e.target.checked, shouldPreview)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-theme-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-accent-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-accent-primary"></div>
          </label>
        )

      case 'number':
        return (
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={schema.min}
              max={schema.max}
              step={schema.step}
              value={value as number}
              onChange={(e) => handleSettingChange(schema.key, Number(e.target.value), shouldPreview)}
              className="flex-1 h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium text-theme-text-primary w-12">
              {String(value)}
            </span>
          </div>
        )

      case 'string':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleSettingChange(schema.key, e.target.value, shouldPreview)}
            placeholder={schema.placeholder}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          />
        )

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleSettingChange(schema.key, e.target.value, shouldPreview)}
            className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          >
            {schema.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        return <div className="text-sm text-theme-text-muted">Unsupported setting type</div>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading settings...</div>
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-theme-bg-secondary border-r border-theme-border-primary">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          />
        </div>
        <nav className="px-2">
          {categories.map((category: any) => {
            const Icon = category.icon ? Icons[category.icon as keyof typeof Icons] : null
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeCategory === category.id
                    ? 'bg-theme-bg-active text-theme-text-primary'
                    : 'text-theme-text-secondary hover:bg-theme-bg-hover hover:text-theme-text-primary'
                }`}
              >
                {Icon && <Icon size={16} />}
                <span>{category.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-theme-text-primary">
              {categories.find((c: any) => c.id === activeCategory)?.label}
            </h2>
            <p className="text-sm text-theme-text-muted mt-1">
              {categories.find((c: any) => c.id === activeCategory)?.description}
            </p>
          </div>

          <div className="space-y-6">
            {filteredSchemas
              .filter(schema => schema.category === activeCategory)
              .map(renderSetting)}
          </div>
        </div>
      </div>
    </div>
  )
}