import { useState, useEffect } from 'react'

const defaultNotebooks = [
  {
    id: 'personal',
    name: 'Personal',
    color: 'blue',
    description: 'Personal notes and thoughts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'work',
    name: 'Work',
    color: 'green',
    description: 'Work-related notes and projects',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'projects',
    name: 'Projects',
    color: 'orange',
    description: 'Development projects and ideas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const generateId = () => {
  return (
    'notebook_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  )
}

export const useNotebooks = () => {
  const [notebooks, setNotebooks] = useState(() => {
    try {
      const saved = localStorage.getItem('inkrun-notebooks')
      return saved ? JSON.parse(saved) : defaultNotebooks
    } catch (error) {
      console.warn('Failed to load notebooks:', error)
      return defaultNotebooks
    }
  })

  // Save to localStorage whenever notebooks change
  useEffect(() => {
    try {
      localStorage.setItem('inkrun-notebooks', JSON.stringify(notebooks))
    } catch (error) {
      console.warn('Failed to save notebooks:', error)
    }
  }, [notebooks])

  const createNotebook = notebookData => {
    const newNotebook = {
      id: generateId(),
      name: notebookData.name || 'Untitled Notebook',
      color: notebookData.color || 'blue',
      description: notebookData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotebooks(prev => [...prev, newNotebook])
    return newNotebook
  }

  const updateNotebook = (notebookId, updates) => {
    setNotebooks(prev =>
      prev.map(notebook =>
        notebook.id === notebookId
          ? { ...notebook, ...updates, updatedAt: new Date().toISOString() }
          : notebook
      )
    )
  }

  const deleteNotebook = notebookId => {
    // Don't allow deleting if it's the last notebook
    if (notebooks.length <= 1) {
      return false
    }

    setNotebooks(prev => prev.filter(notebook => notebook.id !== notebookId))
    return true
  }

  const getNotebook = notebookId => {
    return notebooks.find(notebook => notebook.id === notebookId)
  }

  const getNotebookByName = name => {
    return notebooks.find(
      notebook => notebook.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Get available colors for notebooks
  const getAvailableColors = () => [
    { value: 'blue', label: 'Blue', class: 'text-solarized-blue' },
    { value: 'green', label: 'Green', class: 'text-solarized-green' },
    { value: 'orange', label: 'Orange', class: 'text-solarized-orange' },
    { value: 'yellow', label: 'Yellow', class: 'text-solarized-yellow' },
    { value: 'red', label: 'Red', class: 'text-solarized-red' },
    { value: 'purple', label: 'Purple', class: 'text-solarized-magenta' },
    { value: 'cyan', label: 'Cyan', class: 'text-solarized-cyan' },
  ]

  const getColorClass = color => {
    const colorMap = {
      blue: 'text-solarized-blue',
      green: 'text-solarized-green',
      orange: 'text-solarized-orange',
      yellow: 'text-solarized-yellow',
      red: 'text-solarized-red',
      purple: 'text-solarized-magenta',
      cyan: 'text-solarized-cyan',
    }
    return colorMap[color] || 'text-solarized-blue'
  }

  return {
    notebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    getNotebook,
    getNotebookByName,
    getAvailableColors,
    getColorClass,
  }
}
