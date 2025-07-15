/**
 * Web Worker for search operations
 * Handles heavy search operations off the main thread
 */

// Import Fuse.js for fuzzy search
// Note: In production, you might want to bundle this differently
importScripts('https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js')

// Search configuration
const SEARCH_OPTIONS = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {
      name: 'title',
      weight: 0.7,
    },
    {
      name: 'content',
      weight: 0.3,
    },
    {
      name: 'tags',
      weight: 0.5,
    },
  ],
}

let fuseInstance = null
let notesData = []

// Message handling
self.onmessage = function (e) {
  const { type, data } = e.data

  switch (type) {
    case 'INITIALIZE':
      handleInitialize(data)
      break
    case 'SEARCH':
      handleSearch(data)
      break
    case 'UPDATE_NOTES':
      handleUpdateNotes(data)
      break
    case 'FILTER':
      handleFilter(data)
      break
    default:
      console.warn('Unknown message type:', type)
  }
}

function handleInitialize(data) {
  try {
    notesData = data.notes || []
    fuseInstance = new Fuse(notesData, SEARCH_OPTIONS)

    self.postMessage({
      type: 'INITIALIZED',
      success: true,
      notesCount: notesData.length,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    })
  }
}

function handleSearch(data) {
  try {
    const { query, limit = 50 } = data

    if (!fuseInstance) {
      throw new Error('Search not initialized')
    }

    if (!query || query.trim().length === 0) {
      self.postMessage({
        type: 'SEARCH_RESULTS',
        results: [],
        query: query,
        totalResults: 0,
      })
      return
    }

    const startTime = performance.now()
    const results = fuseInstance.search(query, { limit })
    const endTime = performance.now()

    // Process results to include highlighting
    const processedResults = results.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches,
    }))

    self.postMessage({
      type: 'SEARCH_RESULTS',
      results: processedResults,
      query: query,
      totalResults: results.length,
      searchTime: endTime - startTime,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    })
  }
}

function handleUpdateNotes(data) {
  try {
    notesData = data.notes || []
    fuseInstance = new Fuse(notesData, SEARCH_OPTIONS)

    self.postMessage({
      type: 'NOTES_UPDATED',
      success: true,
      notesCount: notesData.length,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    })
  }
}

function handleFilter(data) {
  try {
    const { filters } = data
    let filteredNotes = [...notesData]

    // Apply filters
    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.tags.some(tag => note.tags.includes(tag))
      )
    }

    if (filters.notebook) {
      filteredNotes = filteredNotes.filter(
        note => note.notebookId === filters.notebook
      )
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filteredNotes = filteredNotes.filter(note => {
        const noteDate = new Date(note.updatedAt)
        return noteDate >= start && noteDate <= end
      })
    }

    self.postMessage({
      type: 'FILTER_RESULTS',
      results: filteredNotes,
      filters: filters,
      totalResults: filteredNotes.length,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    })
  }
}

// Error handling
self.onerror = function (error) {
  self.postMessage({
    type: 'ERROR',
    error: error.message || 'Unknown worker error',
  })
}
