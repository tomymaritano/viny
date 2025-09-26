/**
 * SettingsModalV2 - Clean Architecture Implementation
 * Uses Service Layer + TanStack Query V2 + UI-only Store
 */

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useSettingsUI, useModalStore } from '../../stores/cleanUIStore'
import { 
  useSettingsQueryV2, 
  useUpdateSettingsMutationV2,
  useResetSettingsMutationV2,
  useExportSettingsMutationV2,
  useImportSettingsMutationV2,
} from '../../hooks/queries/useSettingsServiceQueryV2'
import SettingsTabs from './SettingsTabs'
import { SettingsSearch } from './SettingsSearch'
import LoadingSpinner from '../LoadingSpinner'
import { Button } from '../ui/Button'
import type { AppSettings } from '../../types/settings'

interface SettingsModalV2Props {
  isOpen: boolean
  onClose: () => void
  initialTab?: string
}

const SettingsModalV2: React.FC<SettingsModalV2Props> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'general' 
}) => {
  // UI State
  const {
    activeSettingsTab,
    setActiveSettingsTab,
    settingsSearchQuery,
    setSettingsSearchQuery,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useSettingsUI()
  
  // Data
  const { data: settings, isLoading } = useSettingsQueryV2()
  const updateSettingsMutation = useUpdateSettingsMutationV2()
  const resetSettingsMutation = useResetSettingsMutationV2()
  const exportSettingsMutation = useExportSettingsMutationV2()
  const importSettingsMutation = useImportSettingsMutationV2()
  
  // Local state for form
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null)
  
  // Initialize local settings when data loads
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])
  
  // Set initial tab
  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveSettingsTab(initialTab)
    }
  }, [initialTab, isOpen, setActiveSettingsTab])
  
  // Handle settings change
  const handleSettingChange = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!localSettings) return
    
    setLocalSettings({
      ...localSettings,
      [key]: value,
    })
    setHasUnsavedChanges(true)
  }, [localSettings, setHasUnsavedChanges])
  
  // Handle nested settings change
  const handleNestedSettingChange = useCallback(<K extends keyof AppSettings>(
    section: K,
    key: keyof AppSettings[K],
    value: any
  ) => {
    if (!localSettings) return
    
    setLocalSettings({
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [key]: value,
      },
    })
    setHasUnsavedChanges(true)
  }, [localSettings, setHasUnsavedChanges])
  
  // Save settings
  const handleSave = useCallback(async () => {
    if (!localSettings || !hasUnsavedChanges) return
    
    await updateSettingsMutation.mutateAsync(localSettings)
    setHasUnsavedChanges(false)
  }, [localSettings, hasUnsavedChanges, updateSettingsMutation, setHasUnsavedChanges])
  
  // Reset settings
  const handleReset = useCallback(async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaults = await resetSettingsMutation.mutateAsync()
      setLocalSettings(defaults)
      setHasUnsavedChanges(false)
    }
  }, [resetSettingsMutation, setHasUnsavedChanges])
  
  // Export settings
  const handleExport = useCallback(() => {
    exportSettingsMutation.mutate()
  }, [exportSettingsMutation])
  
  // Import settings
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const text = await file.text()
      const result = await importSettingsMutation.mutateAsync(text)
      if (result.success) {
        setLocalSettings(result.settings)
        setHasUnsavedChanges(false)
      }
    }
    input.click()
  }, [importSettingsMutation, setHasUnsavedChanges])
  
  // Handle close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setHasUnsavedChanges(false)
        onClose()
      }
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, setHasUnsavedChanges, onClose])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleSave, handleClose])
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-theme-bg-primary rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold">Settings</h2>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-sm text-theme-warning">
                    Unsaved changes
                  </span>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="px-6 py-3 border-b border-theme-border">
              <SettingsSearch
                value={settingsSearchQuery}
                onChange={setSettingsSearchQuery}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner text="Loading settings..." />
                </div>
              ) : localSettings ? (
                <SettingsTabs
                  settings={localSettings}
                  onSettingChange={handleSettingChange}
                  onNestedSettingChange={handleNestedSettingChange}
                  searchQuery={settingsSearchQuery}
                  activeTab={activeSettingsTab}
                  onTabChange={setActiveSettingsTab}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-theme-text-secondary">
                    Failed to load settings
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-theme-border flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  disabled={updateSettingsMutation.isPending}
                >
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImport}
                  disabled={updateSettingsMutation.isPending}
                >
                  Import
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={updateSettingsMutation.isPending}
                >
                  Reset to Defaults
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={updateSettingsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SettingsModalV2