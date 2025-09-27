/**
 * TanStack Query Hooks
 * 
 * Central export for all React Query hooks
 * These hooks replace the forceRefresh pattern with automatic
 * background refetching and optimistic updates
 */

// Notes queries and mutations
export {
  useNotesQuery,
  useNoteQuery,
  useNotesSearchQuery,
  useSaveNoteMutation,
  useDeleteNoteMutation,
  useTogglePinMutation,
  useEmptyTrashMutation,
} from './useNotesQuery'

// Notebooks queries and mutations
export {
  useNotebooksQuery,
  useNotebookQuery,
  useCreateNotebookMutation,
  useUpdateNotebookMutation,
  useDeleteNotebookMutation,
  useNotebookTree,
} from './useNotebooksQuery'

// Settings queries and mutations
export {
  useSettingsQuery,
  useUpdateSettingsMutation,
  useResetSettingsMutation,
  useSettingValue,
  useUpdateSetting,
} from './useSettingsQuery'

// Prefetching hooks
export {
  usePrefetchNote,
  usePrefetchNotesByNotebook,
  usePrefetchNotesByTag,
  usePrefetchSearch,
  usePrefetchRelatedNotes,
  useSmartPrefetch,
  useInitialPrefetch,
} from './usePrefetch'

export { useSidebarPrefetch } from './useSidebarPrefetch'

// Tags queries and mutations
export {
  useTagsQuery,
  useAddTagMutation,
  useRemoveTagMutation,
  useRenameTagMutation,
} from './useTagsQuery'

// Re-export query keys for manual cache manipulation if needed
export { queryKeys } from '../../lib/queryClient'