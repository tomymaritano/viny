import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDocumentRepository } from '../../lib/repositories/RepositoryFactory'
import type { Note, TagInfo } from '../../types'
import { useToast } from '../useToast'
import { logger } from '../../utils/logger'

const tagLogger = logger.child({ module: 'useTagsQuery' })

// Query Keys
const TAGS_QUERY_KEY = ['tags']
const NOTES_QUERY_KEY = ['notes']

// Helper function to extract tags from notes
const extractTagsFromNotes = (notes: Note[]): TagInfo[] => {
  const tagMap = new Map<string, number>()

  notes.forEach(note => {
    if (note.tags && Array.isArray(note.tags)) {
      note.tags.forEach(tag => {
        if (typeof tag === 'string' && tag.trim()) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
        }
      })
    }
  })

  return Array.from(tagMap.entries()).map(([name, count]) => ({
    name,
    count
  }))
}

/**
 * Hook to fetch all tags from notes
 */
export const useTagsQuery = () => {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: async () => {
      const repository = createDocumentRepository()
      await repository.initialize()

      const notes = await repository.getNotes()
      const tags = extractTagsFromNotes(notes)

      tagLogger.debug('Fetched tags', { count: tags.length })
      return tags
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

/**
 * Hook to add a tag to a note
 */
export const useAddTagMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: async ({ noteId, tag }: { noteId: string; tag: string }) => {
      if (!tag.trim()) {
        throw new Error('Tag name cannot be empty')
      }

      const repository = createDocumentRepository()
      await repository.initialize()

      const note = await repository.getNote(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      const updatedTags = [...(note.tags || [])]
      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag)
      }

      const updatedNote = {
        ...note,
        tags: updatedTags,
        updatedAt: new Date().toISOString()
      }

      await repository.saveNote(updatedNote)
      tagLogger.debug('Added tag to note', { noteId, tag })

      return updatedNote
    },
    onMutate: async ({ noteId, tag }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY })

      // Snapshot the previous values
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      const previousTags = queryClient.getQueryData<TagInfo[]>(TAGS_QUERY_KEY)

      // Optimistically update notes
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, old =>
          old?.map(note =>
            note.id === noteId
              ? { ...note, tags: [...(note.tags || []), tag] }
              : note
          ) || []
        )
      }

      // Optimistically update tags
      if (previousTags) {
        const tagExists = previousTags.find(t => t.name === tag)
        if (tagExists) {
          queryClient.setQueryData<TagInfo[]>(TAGS_QUERY_KEY, old =>
            old?.map(t => t.name === tag ? { ...t, count: t.count + 1 } : t) || []
          )
        } else {
          queryClient.setQueryData<TagInfo[]>(TAGS_QUERY_KEY, old =>
            [...(old || []), { name: tag, count: 1 }]
          )
        }
      }

      // Return context with snapshot
      return { previousNotes, previousTags }
    },
    onError: (err, variables, context) => {
      // If mutation fails, use the context to roll back
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes)
      }
      if (context?.previousTags) {
        queryClient.setQueryData(TAGS_QUERY_KEY, context.previousTags)
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to add tag'
      tagLogger.error('Failed to add tag', { error: err, variables })
      showError(errorMessage)
    },
    onSuccess: (_, { tag }) => {
      showSuccess(`Tag "${tag}" added successfully`)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    }
  })
}

/**
 * Hook to remove a tag from a note
 */
export const useRemoveTagMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: async ({ noteId, tag }: { noteId: string; tag: string }) => {
      const repository = createDocumentRepository()
      await repository.initialize()

      const note = await repository.getNote(noteId)
      if (!note) {
        throw new Error('Note not found')
      }

      const updatedTags = (note.tags || []).filter(t => t !== tag)

      const updatedNote = {
        ...note,
        tags: updatedTags,
        updatedAt: new Date().toISOString()
      }

      await repository.saveNote(updatedNote)
      tagLogger.debug('Removed tag from note', { noteId, tag })

      return updatedNote
    },
    onMutate: async ({ noteId, tag }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY })

      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      const previousTags = queryClient.getQueryData<TagInfo[]>(TAGS_QUERY_KEY)

      // Optimistically update notes
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, old =>
          old?.map(note =>
            note.id === noteId
              ? { ...note, tags: (note.tags || []).filter(t => t !== tag) }
              : note
          ) || []
        )
      }

      // Optimistically update tags
      if (previousTags) {
        queryClient.setQueryData<TagInfo[]>(TAGS_QUERY_KEY, old =>
          old?.map(t => {
            if (t.name === tag) {
              const newCount = t.count - 1
              return newCount <= 0 ? null : { ...t, count: newCount }
            }
            return t
          }).filter(Boolean) as TagInfo[] || []
        )
      }

      return { previousNotes, previousTags }
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes)
      }
      if (context?.previousTags) {
        queryClient.setQueryData(TAGS_QUERY_KEY, context.previousTags)
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to remove tag'
      tagLogger.error('Failed to remove tag', { error: err, variables })
      showError(errorMessage)
    },
    onSuccess: (_, { tag }) => {
      showSuccess(`Tag "${tag}" removed successfully`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    }
  })
}

/**
 * Hook to rename a tag across all notes
 */
export const useRenameTagMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: async ({ oldTag, newTag }: { oldTag: string; newTag: string }) => {
      if (!newTag.trim()) {
        throw new Error('New tag name cannot be empty')
      }

      if (oldTag === newTag) {
        return []
      }

      const repository = createDocumentRepository()
      await repository.initialize()

      const notes = await repository.getNotes()
      const updatedNotes: Note[] = []

      // Update all notes that have the old tag
      for (const note of notes) {
        if (note.tags && note.tags.includes(oldTag)) {
          const updatedTags = note.tags.map(t => t === oldTag ? newTag : t)
          const updatedNote = {
            ...note,
            tags: updatedTags,
            updatedAt: new Date().toISOString()
          }
          await repository.saveNote(updatedNote)
          updatedNotes.push(updatedNote)
        }
      }

      tagLogger.debug('Renamed tag across notes', {
        oldTag,
        newTag,
        updatedCount: updatedNotes.length
      })

      return updatedNotes
    },
    onMutate: async ({ oldTag, newTag }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY })

      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      const previousTags = queryClient.getQueryData<TagInfo[]>(TAGS_QUERY_KEY)

      // Optimistically update notes
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, old =>
          old?.map(note => ({
            ...note,
            tags: note.tags?.map(t => t === oldTag ? newTag : t)
          })) || []
        )
      }

      // Optimistically update tags
      if (previousTags) {
        queryClient.setQueryData<TagInfo[]>(TAGS_QUERY_KEY, old =>
          old?.map(t => t.name === oldTag ? { ...t, name: newTag } : t) || []
        )
      }

      return { previousNotes, previousTags }
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes)
      }
      if (context?.previousTags) {
        queryClient.setQueryData(TAGS_QUERY_KEY, context.previousTags)
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to rename tag'
      tagLogger.error('Failed to rename tag', { error: err, variables })
      showError(errorMessage)
    },
    onSuccess: (updatedNotes, { oldTag, newTag }) => {
      showSuccess(`Tag renamed from "${oldTag}" to "${newTag}" in ${updatedNotes.length} notes`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    }
  })
}

/**
 * Hook to remove a tag from all notes
 */
export const useRemoveTagFromAllNotesMutation = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: async (tag: string) => {
      const repository = createDocumentRepository()
      await repository.initialize()

      const notes = await repository.getNotes()
      const updatedNotes: Note[] = []

      // Remove tag from all notes that have it
      for (const note of notes) {
        if (note.tags && note.tags.includes(tag)) {
          const updatedTags = note.tags.filter(t => t !== tag)
          const updatedNote = {
            ...note,
            tags: updatedTags,
            updatedAt: new Date().toISOString()
          }
          await repository.saveNote(updatedNote)
          updatedNotes.push(updatedNote)
        }
      }

      tagLogger.debug('Removed tag from all notes', {
        tag,
        updatedCount: updatedNotes.length
      })

      return updatedNotes
    },
    onMutate: async (tag) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY })

      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      const previousTags = queryClient.getQueryData<TagInfo[]>(TAGS_QUERY_KEY)

      // Optimistically update notes
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, old =>
          old?.map(note => ({
            ...note,
            tags: note.tags?.filter(t => t !== tag)
          })) || []
        )
      }

      // Optimistically remove tag
      if (previousTags) {
        queryClient.setQueryData<TagInfo[]>(TAGS_QUERY_KEY, old =>
          old?.filter(t => t.name !== tag) || []
        )
      }

      return { previousNotes, previousTags }
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes)
      }
      if (context?.previousTags) {
        queryClient.setQueryData(TAGS_QUERY_KEY, context.previousTags)
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to remove tag'
      tagLogger.error('Failed to remove tag from all notes', { error: err, tag: variables })
      showError(errorMessage)
    },
    onSuccess: (updatedNotes, tag) => {
      showSuccess(`Tag "${tag}" removed from ${updatedNotes.length} notes`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    }
  })
}

/**
 * Combined hook for all tag operations
 */
export const useTagsService = () => {
  const tagsQuery = useTagsQuery()
  const addTagMutation = useAddTagMutation()
  const removeTagMutation = useRemoveTagMutation()
  const renameTagMutation = useRenameTagMutation()
  const removeFromAllMutation = useRemoveTagFromAllNotesMutation()

  return {
    // Query state
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,

    // Mutations
    addTag: addTagMutation.mutate,
    removeTag: removeTagMutation.mutate,
    renameTag: renameTagMutation.mutate,
    removeTagFromAll: removeFromAllMutation.mutate,

    // Mutation states
    isAddingTag: addTagMutation.isLoading,
    isRemovingTag: removeTagMutation.isLoading,
    isRenamingTag: renameTagMutation.isLoading,
    isRemovingFromAll: removeFromAllMutation.isLoading,
  }
}