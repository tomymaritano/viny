/**
 * AppPresentationV2 - Clean Architecture Presentation Component
 * Uses lazy loaded components for better performance
 */

import React, { Suspense } from 'react'
import type { Note, Notebook, Settings } from '../../types'
import { AppLoading } from '../LoadingStates'
import LoadingSpinner from '../LoadingSpinner'
import { ErrorBoundary } from '../ErrorBoundary'
import StorageErrorBoundary from '../errors/StorageErrorBoundary'
import AppLayout from './AppLayout'
import { OfflineIndicator } from '../OfflineIndicator'

// Lazy loaded modals
import { 
  SettingsModalV2, 
  SearchModalV2, 
  ExportDialogV2, 
  PluginManagerV2,
  AIOnboardingModal,
  RevisionHistoryModal 
} from '../LazyComponentsV2'

interface AppPresentationV2Props {
  // Data
  notes: Note[]
  notebooks: Notebook[]
  currentNote: Note | null
  selectedNote: Note | null
  editorContent: string
  isEditorOpen: boolean
  isLoading: boolean
  
  // Handlers
  onCreateNote: () => Promise<Note>
  onSaveNote: (id: string, updates: Partial<Note>) => Promise<void>
  onDeleteNote: (id: string, permanent?: boolean) => Promise<void>
  onTogglePin: (id: string) => Promise<void>
  onDuplicateNote: (id: string) => Promise<void>
  onRestoreNote: (id: string) => Promise<void>
  onPermanentDelete: (id: string) => Promise<void>
  onOpenInNewWindow: (id: string) => void
  onViewHistory: (id: string) => void
  onSelectNote: (id: string | null) => void
  onEditorChange: (content: string) => void
  onCloseEditor: () => void
  
  // UI State
  modals: Record<string, boolean>
  toasts: any[]
  activeSection: string
  selectedNotebookId: string | null
  searchQuery: string
  onModalChange: (modal: string, open: boolean) => void
  onToastRemove: (id: string) => void
  
  // Settings
  settings: Partial<Settings> | null
  
  // Refs
  editorRef: React.RefObject<any>
  unsavedChangesRef: React.MutableRefObject<boolean>
}

const AppPresentationV2: React.FC<AppPresentationV2Props> = ({
  // Data
  notes,
  notebooks,
  currentNote,
  selectedNote,
  editorContent,
  isEditorOpen,
  isLoading,
  
  // Handlers
  onCreateNote,
  onSaveNote,
  onDeleteNote,
  onTogglePin,
  onDuplicateNote,
  onRestoreNote,
  onPermanentDelete,
  onOpenInNewWindow,
  onViewHistory,
  onSelectNote,
  onEditorChange,
  onCloseEditor,
  
  // UI State
  modals,
  toasts,
  activeSection,
  selectedNotebookId,
  searchQuery,
  onModalChange,
  onToastRemove,
  
  // Settings
  settings,
  
  // Refs
  editorRef,
  unsavedChangesRef,
}) => {
  // Loading state
  if (isLoading) {
    return <AppLoading message="Loading Viny..." />
  }
  
  // Debug effect for modal state changes
  React.useEffect(() => {
    console.log('[AppPresentationV2] Modal state changed:', {
      revisionHistory: modals.revisionHistory,
      allModals: modals
    })
  }, [modals.revisionHistory])

  return (
    <div data-testid="app-container">
      <ErrorBoundary>
        <StorageErrorBoundary
          clearStorageOnRetry={true}
          onError={error => {
            // Error is handled by ErrorBoundary
          }}
          onRetry={() => {
            window.location.reload()
          }}
        >
          <AppLayout
            // Data
            currentNote={currentNote}
            selectedNote={selectedNote}
            filteredNotes={notes}
            notebooks={notebooks}
            settings={settings || {}}
            // UI State
            isEditorOpen={isEditorOpen}
            activeSection={activeSection}
            editorContent={editorContent}
            // Handlers
            handleOpenNote={onSelectNote}
            handleContentChange={onEditorChange}
            handleNotebookChange={(notebookName: string) => {
              // Handle notebook change
            }}
            handleMetadataChange={async (noteOrUpdates: Note | Partial<Note>) => {
              // Handle both full note and partial updates
              if ('id' in noteOrUpdates && noteOrUpdates.id) {
                // If it has an id, use it to save
                const { id, ...updates } = noteOrUpdates
                await onSaveNote(id, updates)
              } else if (currentNote) {
                // Otherwise use current note id with the updates
                await onSaveNote(currentNote.id, noteOrUpdates)
              }
            }}
            createNewNote={onCreateNote}
            handleDeleteNote={async (note: Note) => {
              await onDeleteNote(note.id)
            }}
            handleTogglePin={async (note: Note) => {
              await onTogglePin(note.id)
            }}
            handleDuplicateNote={async (note: Note) => {
              await onDuplicateNote(note.id)
            }}
            handleRestoreNote={async (note: Note) => {
              await onRestoreNote(note.id)
            }}
            handlePermanentDelete={async (note: Note) => {
              await onPermanentDelete(note.id)
            }}
            handleOpenInNewWindow={(note: Note) => {
              onOpenInNewWindow(note.id)
            }}
            handleViewHistory={(note: Note) => {
              onViewHistory(note.id)
            }}
            setModal={onModalChange}
            sortNotes={(sortBy: string) => {
              // Handle sort
            }}
          />

          {/* Lazy loaded modals */}
          <Suspense fallback={<LoadingSpinner />}>
            {/* Search Modal */}
            {modals.search && <SearchModalV2 />}
            
            {/* Settings Modal */}
            {modals.settings && <SettingsModalV2 />}
            
            {/* Export Dialog */}
            {modals.export && <ExportDialogV2 />}
            
            {/* Plugin Manager */}
            {modals.plugins && <PluginManagerV2 />}
            
            {/* AI Onboarding */}
            {modals.aiOnboarding && <AIOnboardingModal />}
            
            {/* Revision History */}
            {modals.revisionHistory && (
              <>
                {console.log('[AppPresentationV2] Rendering RevisionHistoryModal:', {
                  isOpen: modals.revisionHistory,
                  hasCurrentNote: !!currentNote,
                  currentNoteId: currentNote?.id,
                  currentNoteTitle: currentNote?.title
                })}
                <RevisionHistoryModal 
                  isOpen={modals.revisionHistory}
                  onClose={() => onModalChange('revisionHistory', false)}
                  note={currentNote}
                  onRestoreRevision={async (note) => {
                    await onSaveNote(note.id, note)
                  }}
                />
              </>
            )}
          </Suspense>
        </StorageErrorBoundary>
      </ErrorBoundary>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}

export default AppPresentationV2