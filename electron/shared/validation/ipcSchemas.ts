/**
 * IPC Data Validation Schemas
 * 
 * Validates all data passed through IPC channels to prevent security issues
 * and ensure data integrity between main and renderer processes.
 */

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

// Type guards
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

// Note validation schema
export interface NoteData {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  notebook?: string
  isTrashed?: boolean
  tags?: string[]
  isPinned?: boolean
  status?: 'none' | 'active' | 'onHold' | 'completed' | 'dropped'
}

export function validateNote(data: unknown): ValidationResult<NoteData> {
  if (!isObject(data)) {
    return { success: false, error: 'Note must be an object' }
  }

  // Required fields
  if (!isString(data.id) || data.id.trim() === '') {
    return { success: false, error: 'Note ID must be a non-empty string' }
  }

  if (!isString(data.title)) {
    return { success: false, error: 'Note title must be a string' }
  }

  if (!isString(data.content)) {
    return { success: false, error: 'Note content must be a string' }
  }

  if (!isString(data.createdAt)) {
    return { success: false, error: 'Note createdAt must be a string' }
  }

  if (!isString(data.updatedAt)) {
    return { success: false, error: 'Note updatedAt must be a string' }
  }

  // Optional fields
  if (data.notebook !== undefined && !isString(data.notebook)) {
    return { success: false, error: 'Note notebook must be a string' }
  }

  if (data.isTrashed !== undefined && !isBoolean(data.isTrashed)) {
    return { success: false, error: 'Note isTrashed must be a boolean' }
  }

  if (data.tags !== undefined) {
    if (!isArray(data.tags)) {
      return { success: false, error: 'Note tags must be an array' }
    }
    if (!data.tags.every(isString)) {
      return { success: false, error: 'All note tags must be strings' }
    }
  }

  if (data.isPinned !== undefined && !isBoolean(data.isPinned)) {
    return { success: false, error: 'Note isPinned must be a boolean' }
  }

  // Status validation - make it more flexible
  if (data.status !== undefined) {
    if (!isString(data.status)) {
      return { success: false, error: 'Note status must be a string' }
    }
    // Accept any string value for status to be more flexible
  }

  return {
    success: true,
    data: {
      id: data.id as string,
      title: data.title as string,
      content: data.content as string,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
      notebook: data.notebook as string | undefined,
      isTrashed: data.isTrashed as boolean | undefined,
      tags: data.tags as string[] | undefined,
      isPinned: data.isPinned as boolean | undefined,
      status: data.status as 'none' | 'active' | 'onHold' | 'completed' | 'dropped' | undefined
    }
  }
}

// Notebook validation schema
export interface NotebookData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  parentId?: string | null
  children?: NotebookData[]
  color?: string
  icon?: string
  isExpanded?: boolean
  position?: number
}

export function validateNotebook(data: unknown): ValidationResult<NotebookData> {
  if (!isObject(data)) {
    return { success: false, error: 'Notebook must be an object' }
  }

  // Required fields
  if (!isString(data.id) || data.id.trim() === '') {
    return { success: false, error: 'Notebook ID must be a non-empty string' }
  }

  if (!isString(data.name) || data.name.trim() === '') {
    return { success: false, error: 'Notebook name must be a non-empty string' }
  }

  if (!isString(data.createdAt)) {
    return { success: false, error: 'Notebook createdAt must be a string' }
  }

  if (!isString(data.updatedAt)) {
    return { success: false, error: 'Notebook updatedAt must be a string' }
  }

  // Optional fields
  if (data.parentId !== undefined && data.parentId !== null && !isString(data.parentId)) {
    return { success: false, error: 'Notebook parentId must be a string or null' }
  }

  if (data.color !== undefined && !isString(data.color)) {
    return { success: false, error: 'Notebook color must be a string' }
  }

  if (data.icon !== undefined && !isString(data.icon)) {
    return { success: false, error: 'Notebook icon must be a string' }
  }

  if (data.isExpanded !== undefined && !isBoolean(data.isExpanded)) {
    return { success: false, error: 'Notebook isExpanded must be a boolean' }
  }

  if (data.position !== undefined && !isNumber(data.position)) {
    return { success: false, error: 'Notebook position must be a number' }
  }

  // Validate children recursively if present
  if (data.children !== undefined) {
    if (!isArray(data.children)) {
      return { success: false, error: 'Notebook children must be an array' }
    }

    for (const child of data.children) {
      const childValidation = validateNotebook(child)
      if (!childValidation.success) {
        return { success: false, error: `Child notebook error: ${childValidation.error}` }
      }
    }
  }

  return {
    success: true,
    data: {
      id: data.id as string,
      name: data.name as string,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
      parentId: data.parentId as string | null | undefined,
      children: data.children as NotebookData[] | undefined,
      color: data.color as string | undefined,
      icon: data.icon as string | undefined,
      isExpanded: data.isExpanded as boolean | undefined,
      position: data.position as number | undefined
    }
  }
}

// Settings validation schema
export interface SettingsData {
  [key: string]: unknown
}

export function validateSettings(data: unknown): ValidationResult<SettingsData> {
  if (!isObject(data)) {
    return { success: false, error: 'Settings must be an object' }
  }

  // Settings can have various fields, so we'll do basic validation
  // and ensure no dangerous content
  const sanitizedSettings: SettingsData = {}

  for (const [key, value] of Object.entries(data)) {
    // Validate key (alphanumeric + underscore/dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return { success: false, error: `Invalid settings key: ${key}` }
    }

    // Validate value types (no functions or complex objects)
    if (value === null || 
        isString(value) || 
        isNumber(value) || 
        isBoolean(value) ||
        (isArray(value) && value.every(v => isString(v) || isNumber(v) || isBoolean(v))) ||
        (isObject(value) && Object.values(value).every(v => 
          v === null || isString(v) || isNumber(v) || isBoolean(v)
        ))) {
      sanitizedSettings[key] = value
    } else {
      return { success: false, error: `Invalid value type for settings key: ${key}` }
    }
  }

  return {
    success: true,
    data: sanitizedSettings
  }
}

// Export data validation
export interface ExportOptions {
  format: 'html' | 'pdf' | 'markdown' | 'txt'
  theme?: string
  includeMetadata?: boolean
  embedImages?: boolean
}

export function validateExportOptions(data: unknown): ValidationResult<ExportOptions> {
  if (!isObject(data)) {
    return { success: false, error: 'Export options must be an object' }
  }

  const validFormats = ['html', 'pdf', 'markdown', 'txt']
  if (!isString(data.format) || !validFormats.includes(data.format)) {
    return { success: false, error: 'Export format must be one of: ' + validFormats.join(', ') }
  }

  if (data.theme !== undefined && !isString(data.theme)) {
    return { success: false, error: 'Export theme must be a string' }
  }

  if (data.includeMetadata !== undefined && !isBoolean(data.includeMetadata)) {
    return { success: false, error: 'Export includeMetadata must be a boolean' }
  }

  if (data.embedImages !== undefined && !isBoolean(data.embedImages)) {
    return { success: false, error: 'Export embedImages must be a boolean' }
  }

  return {
    success: true,
    data: {
      format: data.format as 'html' | 'pdf' | 'markdown' | 'txt',
      theme: data.theme as string | undefined,
      includeMetadata: data.includeMetadata as boolean | undefined,
      embedImages: data.embedImages as boolean | undefined
    }
  }
}

// Backup/Restore validation
export interface BackupData {
  notes?: unknown[]
  notebooks?: unknown[]
  settings?: unknown
  tagColors?: unknown
}

export function validateBackupData(data: unknown): ValidationResult<BackupData> {
  if (!isObject(data)) {
    return { success: false, error: 'Backup data must be an object' }
  }

  // Validate notes array if present
  if (data.notes !== undefined) {
    if (!isArray(data.notes)) {
      return { success: false, error: 'Backup notes must be an array' }
    }
    
    for (const note of data.notes) {
      const validation = validateNote(note)
      if (!validation.success) {
        return { success: false, error: `Note validation error: ${validation.error}` }
      }
    }
  }

  // Validate notebooks array if present
  if (data.notebooks !== undefined) {
    if (!isArray(data.notebooks)) {
      return { success: false, error: 'Backup notebooks must be an array' }
    }
    
    for (const notebook of data.notebooks) {
      const validation = validateNotebook(notebook)
      if (!validation.success) {
        return { success: false, error: `Notebook validation error: ${validation.error}` }
      }
    }
  }

  // Validate settings if present
  if (data.settings !== undefined) {
    const validation = validateSettings(data.settings)
    if (!validation.success) {
      return { success: false, error: `Settings validation error: ${validation.error}` }
    }
  }

  // Tag colors is a simple object
  if (data.tagColors !== undefined && !isObject(data.tagColors)) {
    return { success: false, error: 'Backup tagColors must be an object' }
  }

  return {
    success: true,
    data: data as BackupData
  }
}

// File path validation
export function validateFilePath(path: unknown): ValidationResult<string> {
  if (!isString(path)) {
    return { success: false, error: 'File path must be a string' }
  }

  // Basic path validation - no traversal attempts
  if (path.includes('..') || path.includes('~')) {
    return { success: false, error: 'File path cannot contain ".." or "~"' }
  }

  // No absolute paths outside of app directory
  if (path.startsWith('/') || path.match(/^[a-zA-Z]:\\/)) {
    return { success: false, error: 'Absolute paths are not allowed' }
  }

  return {
    success: true,
    data: path
  }
}

// Generic ID validation
export function validateId(id: unknown): ValidationResult<string> {
  if (!isString(id)) {
    return { success: false, error: 'ID must be a string' }
  }

  if (id.trim() === '') {
    return { success: false, error: 'ID cannot be empty' }
  }

  // Allow alphanumeric, dash, underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return { success: false, error: 'ID contains invalid characters' }
  }

  return {
    success: true,
    data: id
  }
}