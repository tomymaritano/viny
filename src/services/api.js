// API Service for Nototo Backend
const API_BASE_URL = 'http://localhost:3001/api'

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.status = status
    this.details = details
    this.name = 'ApiError'
  }
}

const handleResponse = async response => {
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: 'Network error' }
    }

    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData.details
    )
  }

  return response.json()
}

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error', 0, error.message)
  }
}

// Notes API
export const notesApi = {
  // Get all notes with optional filtering
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/notes?${queryString}` : '/notes'

    const response = await request(endpoint)
    return response.notes // Return just the notes array for compatibility
  },

  // Get specific note by ID
  getById: async id => {
    return await request(`/notes/${id}`)
  },

  // Create new note
  create: async noteData => {
    return await request('/notes', {
      method: 'POST',
      body: noteData,
    })
  },

  // Update existing note
  update: async (id, noteData) => {
    return await request(`/notes/${id}`, {
      method: 'PUT',
      body: noteData,
    })
  },

  // Delete note permanently
  delete: async id => {
    await request(`/notes/${id}`, {
      method: 'DELETE',
    })
    return true
  },

  // Search notes
  search: async (query, filters = {}) => {
    return await notesApi.getAll({ ...filters, search: query })
  },
}

// Tags API
export const tagsApi = {
  getAll: async () => {
    return await request('/tags')
  },

  create: async tagData => {
    return await request('/tags', {
      method: 'POST',
      body: tagData,
    })
  },

  update: async (id, tagData) => {
    return await request(`/tags/${id}`, {
      method: 'PUT',
      body: tagData,
    })
  },

  delete: async id => {
    await request(`/tags/${id}`, {
      method: 'DELETE',
    })
    return true
  },
}

// Notebooks API
export const notebooksApi = {
  getAll: async () => {
    return await request('/notebooks')
  },

  create: async notebookData => {
    return await request('/notebooks', {
      method: 'POST',
      body: notebookData,
    })
  },

  update: async (id, notebookData) => {
    return await request(`/notebooks/${id}`, {
      method: 'PUT',
      body: notebookData,
    })
  },

  delete: async id => {
    await request(`/notebooks/${id}`, {
      method: 'DELETE',
    })
    return true
  },
}

// Migration API
export const migrationApi = {
  // Import notes from localStorage format
  importFromLocalStorage: async notes => {
    return await request('/migration/import', {
      method: 'POST',
      body: { notes },
    })
  },

  // Export all data
  exportAll: async () => {
    return await request('/migration/export')
  },

  // Get database statistics
  getStats: async () => {
    return await request('/migration/stats')
  },

  // Reset database (development only)
  reset: async () => {
    return await request('/migration/reset', {
      method: 'POST',
    })
  },
}

// Health check
export const healthApi = {
  check: async () => {
    return await request('/health', {
      headers: {}, // Override content-type for health check
    }).catch(() => ({ status: 'ERROR' }))
  },
}

// Export the error class for error handling
export { ApiError }

// Default export with all APIs
export default {
  notes: notesApi,
  tags: tagsApi,
  notebooks: notebooksApi,
  migration: migrationApi,
  health: healthApi,
}
