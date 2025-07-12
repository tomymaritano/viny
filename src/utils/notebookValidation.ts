import { Notebook, NOTEBOOK_VALIDATION } from '../types/notebook'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateNotebookName = (
  name: string, 
  existingNotebooks: Notebook[] = [],
  currentNotebookId?: string
): ValidationResult => {
  const trimmed = name.trim()
  
  // Check empty
  if (!trimmed) {
    return { isValid: false, error: 'Category name is required' }
  }
  
  // Check minimum length
  if (trimmed.length < NOTEBOOK_VALIDATION.minLength) {
    return { isValid: false, error: `Category name must be at least ${NOTEBOOK_VALIDATION.minLength} characters` }
  }
  
  // Check maximum length
  if (trimmed.length > NOTEBOOK_VALIDATION.maxLength) {
    return { isValid: false, error: `Category name must be less than ${NOTEBOOK_VALIDATION.maxLength} characters` }
  }
  
  // Check allowed characters
  if (!NOTEBOOK_VALIDATION.allowedChars.test(trimmed)) {
    return { isValid: false, error: 'Category name can only contain letters, numbers, spaces, hyphens, and underscores' }
  }
  
  // Check reserved names
  if (NOTEBOOK_VALIDATION.reservedNames.some(reserved => 
    reserved.toLowerCase() === trimmed.toLowerCase()
  )) {
    return { isValid: false, error: 'This is a reserved name. Please choose a different name' }
  }
  
  // Check duplicates (exclude current notebook when editing)
  const duplicateExists = existingNotebooks.some(notebook => 
    notebook.name.toLowerCase() === trimmed.toLowerCase() && 
    notebook.id !== currentNotebookId
  )
  
  if (duplicateExists) {
    return { isValid: false, error: 'A category with this name already exists' }
  }
  
  return { isValid: true }
}

export const validateNotebookNesting = (
  parentId: string | null,
  notebooks: Notebook[]
): ValidationResult => {
  if (!parentId) return { isValid: true } // Root level is always valid
  
  const parent = notebooks.find(n => n.id === parentId)
  if (!parent) {
    return { isValid: false, error: 'Parent category not found' }
  }
  
  if (parent.level >= NOTEBOOK_VALIDATION.maxNestingLevel) {
    return { isValid: false, error: `Maximum nesting level is ${NOTEBOOK_VALIDATION.maxNestingLevel}` }
  }
  
  return { isValid: true }
}

export const validateNotebookMove = (
  notebookId: string,
  newParentId: string | null,
  notebooks: Notebook[]
): ValidationResult => {
  const notebook = notebooks.find(n => n.id === notebookId)
  if (!notebook) {
    return { isValid: false, error: 'Notebook not found' }
  }
  
  // Can't move to itself
  if (notebookId === newParentId) {
    return { isValid: false, error: 'Cannot move category to itself' }
  }
  
  // Can't move to one of its own children (prevent cycles)
  const isMovingToChild = (parentId: string | null): boolean => {
    if (!parentId) return false
    if (parentId === notebookId) return true
    
    const parent = notebooks.find(n => n.id === parentId)
    return parent ? isMovingToChild(parent.parentId) : false
  }
  
  if (isMovingToChild(newParentId)) {
    return { isValid: false, error: 'Cannot move category to one of its subcategories' }
  }
  
  // Check nesting level
  return validateNotebookNesting(newParentId, notebooks)
}
