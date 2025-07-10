import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Notes Store - Maneja todo el estado de las notas
const useNotesStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        notes: [],
        currentNote: null,
        selectedNoteId: null,
        isLoading: false,
        error: null,
        searchQuery: '',

        // Filtros y vistas
        activeSection: 'all-notes',
        viewMode: 'preview',

        // Estados del editor
        isEditorOpen: false,
        editorContent: '',

        // Acciones para notas
        setNotes: notes => set({ notes }, false, 'setNotes'),

        addNote: note =>
          set(
            state => ({
              notes: [note, ...state.notes],
            }),
            false,
            'addNote'
          ),

        updateNote: updatedNote =>
          set(
            state => ({
              notes: state.notes.map(note =>
                note.id === updatedNote.id ? updatedNote : note
              ),
              currentNote:
                state.currentNote?.id === updatedNote.id
                  ? updatedNote
                  : state.currentNote,
            }),
            false,
            'updateNote'
          ),

        deleteNote: noteId =>
          set(
            state => ({
              notes: state.notes.filter(note => note.id !== noteId),
              currentNote:
                state.currentNote?.id === noteId ? null : state.currentNote,
              selectedNoteId:
                state.selectedNoteId === noteId ? null : state.selectedNoteId,
            }),
            false,
            'deleteNote'
          ),

        // Acciones para la nota actual
        setCurrentNote: note =>
          set({ currentNote: note }, false, 'setCurrentNote'),

        setSelectedNoteId: noteId =>
          set({ selectedNoteId: noteId }, false, 'setSelectedNoteId'),

        // Acciones del editor
        openEditor: noteId =>
          set(
            state => {
              const note = state.notes.find(n => n.id === noteId)
              return {
                isEditorOpen: true,
                currentNote: note,
                selectedNoteId: noteId,
                editorContent: note?.content || '',
              }
            },
            false,
            'openEditor'
          ),

        closeEditor: () =>
          set(
            {
              isEditorOpen: false,
              currentNote: null,
              editorContent: '',
            },
            false,
            'closeEditor'
          ),

        updateEditorContent: content =>
          set({ editorContent: content }, false, 'updateEditorContent'),

        // Acciones de navegación
        setActiveSection: section =>
          set({ activeSection: section }, false, 'setActiveSection'),

        setViewMode: mode => set({ viewMode: mode }, false, 'setViewMode'),

        // Búsqueda
        setSearchQuery: query =>
          set({ searchQuery: query }, false, 'setSearchQuery'),

        // Estados de loading y error
        setLoading: loading => set({ isLoading: loading }, false, 'setLoading'),

        setError: error => set({ error }, false, 'setError'),

        // Acciones compuestas
        createNewNote: () => {
          const newNote = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            notebook: 'Personal',
            tags: [],
            status: 'active',
            isPinned: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set(
            state => ({
              notes: [newNote, ...state.notes],
              isEditorOpen: true,
              currentNote: newNote,
              selectedNoteId: newNote.id,
              editorContent: '',
            }),
            false,
            'createNewNote'
          )

          return newNote
        },

        saveCurrentNote: async () => {
          const { currentNote, editorContent } = get()
          if (!currentNote) return

          const updatedNote = {
            ...currentNote,
            content: editorContent,
            updatedAt: new Date().toISOString(),
          }

          get().updateNote(updatedNote)
          return updatedNote
        },

        // Getters computados
        getFilteredNotes: () => {
          const { notes, activeSection, searchQuery } = get()

          let filtered = notes.filter(note => !note.isTrashed)

          // Aplicar filtro de sección
          switch (activeSection) {
            case 'all-notes':
              break
            case 'pinned':
              filtered = filtered.filter(note => note.isPinned)
              break
            case 'recent':
              filtered = filtered
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 10)
              break
            case 'trash':
              filtered = notes.filter(note => note.isTrashed)
              break
            default:
              if (activeSection.startsWith('status-')) {
                const status = activeSection.replace('status-', '')
                filtered = filtered.filter(
                  note => (note.status || 'active') === status
                )
              } else if (activeSection.startsWith('notebook-')) {
                const notebook = activeSection.replace('notebook-', '')
                filtered = filtered.filter(
                  note => note.notebook.toLowerCase() === notebook
                )
              } else if (activeSection.startsWith('tag-')) {
                const tag = activeSection.replace('tag-', '')
                filtered = filtered.filter(note => note.tags?.includes(tag))
              }
          }

          // Aplicar búsqueda
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
              note =>
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags?.some(tag => tag.toLowerCase().includes(query))
            )
          }

          return filtered
        },

        // Stats para sidebar
        getStats: () => {
          const { notes } = get()
          const activeNotes = notes.filter(note => !note.isTrashed)

          return {
            total: activeNotes.length,
            pinned: activeNotes.filter(note => note.isPinned).length,
            trashed: notes.filter(note => note.isTrashed).length,
            byStatus: {
              active: activeNotes.filter(
                note => (note.status || 'active') === 'active'
              ).length,
              'on-hold': activeNotes.filter(note => note.status === 'on-hold')
                .length,
              completed: activeNotes.filter(note => note.status === 'completed')
                .length,
              dropped: activeNotes.filter(note => note.status === 'dropped')
                .length,
            },
          }
        },

        // Resetear store
        reset: () =>
          set(
            {
              notes: [],
              currentNote: null,
              selectedNoteId: null,
              isLoading: false,
              error: null,
              searchQuery: '',
              activeSection: 'all-notes',
              viewMode: 'preview',
              isEditorOpen: false,
              editorContent: '',
            },
            false,
            'reset'
          ),
      }),
      {
        name: 'notes-store',
        partialize: state => ({
          notes: state.notes,
          activeSection: state.activeSection,
          viewMode: state.viewMode,
        }),
      }
    ),
    {
      name: 'notes-store',
    }
  )
)

export default useNotesStore
