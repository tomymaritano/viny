// Debug helper for revision history
export const debugRevisionHistory = {
  logModalState: (modals: any, currentNote: any) => {
    console.log('[DEBUG] Revision History Modal State:', {
      isOpen: modals?.revisionHistory,
      hasCurrentNote: !!currentNote,
      currentNoteId: currentNote?.id,
      currentNoteTitle: currentNote?.title,
      modals
    })
  },
  
  logRevisionService: (note: any, revisions: any[]) => {
    console.log('[DEBUG] Revision Service:', {
      noteId: note?.id,
      revisionCount: revisions?.length || 0,
      revisions: revisions?.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        changeType: r.changeType
      }))
    })
  },
  
  logRevisionClick: (source: string, noteId?: string) => {
    console.log('[DEBUG] View History clicked from:', source, {
      noteId,
      timestamp: new Date().toISOString()
    })
  }
}

// Make it available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).debugRevision = debugRevisionHistory
}