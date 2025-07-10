import { useEffect } from 'react'
import useNotesStore from '../stores/notesStore'
import { useNotes } from './useNotes'
import { useNotesApi } from './useNotesApi'

/**
 * Hook que integra el store de Zustand con los hooks existentes
 * Migración gradual del estado legacy
 */
export const useNotesWithStore = (useApi = false) => {
  // Store de Zustand
  const store = useNotesStore()

  // Hook legacy (para migración gradual)
  const legacyHook = useApi ? useNotesApi() : useNotes()

  // Sincronizar datos legacy con store
  useEffect(() => {
    if (legacyHook.notes && legacyHook.notes.length > 0) {
      // Solo sincronizar si el store está vacío (primera carga)
      if (store.notes.length === 0) {
        store.setNotes(legacyHook.notes)
      }
    }
  }, [legacyHook.notes, store])

  // Sincronizar currentNote
  useEffect(() => {
    if (
      legacyHook.currentNote &&
      legacyHook.currentNote !== store.currentNote
    ) {
      store.setCurrentNote(legacyHook.currentNote)
      store.setSelectedNoteId(legacyHook.currentNote.id)
    }
  }, [legacyHook.currentNote, store])

  // Funciones que utilizan tanto store como legacy
  const saveNote = async note => {
    try {
      store.setLoading(true)

      // Guardar en legacy system
      if (legacyHook.saveNote) {
        await legacyHook.saveNote(note)
      }

      // Actualizar store
      store.updateNote(note)

      return note
    } catch (error) {
      store.setError(error.message)
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  const createNewNote = () => {
    // Crear en store
    const newNote = store.createNewNote()

    // Crear en legacy system
    if (legacyHook.createNewNote) {
      legacyHook.createNewNote()
    }

    return newNote
  }

  const deleteNote = async noteId => {
    try {
      store.setLoading(true)

      // Eliminar en legacy system
      if (legacyHook.deleteNote) {
        await legacyHook.deleteNote(noteId)
      }

      // Eliminar en store
      store.deleteNote(noteId)
    } catch (error) {
      store.setError(error.message)
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  const openNoteForEdit = noteId => {
    // Abrir en store
    store.openEditor(noteId)

    // Abrir en legacy system
    if (legacyHook.openNoteForEdit) {
      legacyHook.openNoteForEdit(noteId)
    }
  }

  const closeEditor = () => {
    // Cerrar en store
    store.closeEditor()

    // Cerrar en legacy system
    if (legacyHook.closeEditor) {
      legacyHook.closeEditor()
    }
  }

  // Retornar API unificada
  return {
    // Estado del store
    notes: store.notes,
    currentNote: store.currentNote,
    selectedNoteId: store.selectedNoteId,
    isEditorOpen: store.isEditorOpen,
    isLoading: store.isLoading || legacyHook.isLoading,
    error: store.error || legacyHook.error,

    // Navegación
    activeSection: store.activeSection,
    viewMode: store.viewMode,

    // Acciones principales
    saveNote,
    createNewNote,
    deleteNote,
    openNoteForEdit,
    closeEditor,

    // Acciones de store
    setCurrentNote: store.setCurrentNote,
    setSelectedNoteId: store.setSelectedNoteId,
    setActiveSection: store.setActiveSection,
    updateEditorContent: store.updateEditorContent,

    // Getters
    getFilteredNotes: store.getFilteredNotes,
    getStats: store.getStats,

    // Legacy compatibility (para componentes que aún no migramos)
    ...legacyHook,

    // Store directo (para casos especiales)
    store,
  }
}
