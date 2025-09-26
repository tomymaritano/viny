/**
 * Shared Repository Pattern Utilities
 * Extracted common patterns from useNotebooks.ts, useNoteActions.ts, and useTagManager.ts
 * Provides standardized error handling, validation, and repository operations
 */

import type { IDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { createDocumentRepository } from '../lib/repositories/RepositoryFactory'
import { logger } from './logger'

/**
 * Generic type for repository operations
 */
export type RepositoryOperation<T> = (
  repository: IDocumentRepository
) => Promise<T>

/**
 * Configuration for repository operations
 */
export interface RepositoryOperationConfig {
  operationName: string
  showUserFeedback?: boolean
  logGroup?: boolean
}

/**
 * Result of a repository operation
 */
export interface RepositoryOperationResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Standardized repository operation wrapper with comprehensive error handling
 * This is the core pattern used across all CRUD hooks
 */
export async function withRepositoryOperation<T>(
  operation: RepositoryOperation<T>,
  config: RepositoryOperationConfig,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): Promise<RepositoryOperationResult<T>> {
  const { operationName, showUserFeedback = true, logGroup = true } = config
  const timerId = `repository-${operationName}-${Date.now()}`

  if (logGroup) {
    logger.group(`Repository ${operationName} Operation`)
    logger.time(timerId)
  }

  try {
    const repository: IDocumentRepository = createDocumentRepository()
    await repository.initialize()

    const result = await operation(repository)

    if (logGroup) {
      logger.timeEnd(timerId)
      logger.info(`Repository ${operationName} completed successfully`)
      logger.groupEnd()
    }

    if (onSuccess) {
      onSuccess(result)
    }

    return {
      success: true,
      data: result,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : `Failed to ${operationName}`

    if (logGroup) {
      logger.error(`Error in repository ${operationName}:`, err)
      logger.timeEnd(timerId)
      logger.groupEnd()
    }

    if (onError) {
      onError(errorMessage)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Frontend validation helper for common scenarios
 */
export class ValidationHelper {
  /**
   * Validates that a string is not empty
   */
  static validateNonEmpty(value: string, fieldName: string): void {
    if (!value || !value.trim()) {
      throw new Error(`${fieldName} cannot be empty`)
    }
  }

  /**
   * Validates that an ID exists
   */
  static validateId(id: string, entityType: string): void {
    if (!id || !id.trim()) {
      throw new Error(`${entityType} ID cannot be empty`)
    }
  }

  /**
   * Validates array index
   */
  static validateIndex(
    index: number,
    arrayLength: number,
    entityType: string
  ): void {
    if (index < 0 || index >= arrayLength) {
      throw new Error(`Invalid ${entityType} index: ${index}`)
    }
  }

  /**
   * Validates uniqueness in array
   */
  static validateUnique<T>(
    items: T[],
    newItem: T,
    getKey: (item: T) => string,
    entityType: string,
    excludeIndex?: number
  ): void {
    const newKey = getKey(newItem).toLowerCase()
    const existingIndex = items.findIndex(
      (item, index) =>
        index !== excludeIndex && getKey(item).toLowerCase() === newKey
    )

    if (existingIndex !== -1) {
      throw new Error(`${entityType} "${getKey(newItem)}" already exists`)
    }
  }
}

/**
 * @deprecated Use TanStack Query hooks instead of forceRefresh pattern
 * Type definitions for force refresh pattern
 * Individual hooks should implement these patterns using React hooks
 */
export interface ForceRefreshHook {
  refreshTrigger: number
  forceRefresh: () => void
}

/**
 * Type definitions for loading error state
 * Individual hooks should implement these patterns using React hooks
 */
export interface LoadingErrorState {
  loading: boolean
  error: string | null
  startOperation: () => void
  completeOperation: () => void
  errorOperation: (errorMessage: string) => void
  setError: (error: string | null) => void
}

/**
 * Bulk operation helper for processing multiple items
 */
export async function processBulkOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  operationName: string
): Promise<{
  results: R[]
  successCount: number
  failureCount: number
  errors: Array<{ item: T; error: string }>
}> {
  logger.group(`Bulk ${operationName} Operation`)
  logger.debug(`Processing ${items.length} items`)

  const results: R[] = []
  const errors: Array<{ item: T; error: string }> = []

  const promises = items.map(async (item, index) => {
    try {
      const result = await operation(item)
      results[index] = result
      logger.debug(`${operationName} success for item ${index}`)
      return { success: true, index, result }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${operationName} item`
      errors.push({ item, error: errorMessage })
      logger.error(`${operationName} failed for item ${index}:`, error)
      return { success: false, index, error: errorMessage }
    }
  })

  const outcomes = await Promise.allSettled(promises)

  const successCount = outcomes.filter(
    outcome => outcome.status === 'fulfilled' && outcome.value.success
  ).length
  const failureCount = outcomes.length - successCount

  logger.debug(
    `Bulk operation completed: ${successCount} success, ${failureCount} failures`
  )
  logger.groupEnd()

  return {
    results: results.filter(r => r !== undefined),
    successCount,
    failureCount,
    errors,
  }
}

/**
 * @deprecated Use TanStack Query mutations instead - they handle cache invalidation automatically
 * Repository operation with automatic force refresh
 * Combines repository operation with UI refresh pattern
 */
export async function withRepositoryOperationAndRefresh<T>(
  operation: RepositoryOperation<T>,
  config: RepositoryOperationConfig,
  forceRefresh: () => void,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): Promise<RepositoryOperationResult<T>> {
  const result = await withRepositoryOperation(
    operation,
    config,
    onSuccess,
    onError
  )

  if (result.success) {
    // Force refresh to update UI
    forceRefresh()
  }

  return result
}

/**
 * @deprecated Use TanStack Query hooks for CRUD operations
 * Common patterns for CRUD operations
 * These patterns are maintained for backward compatibility with legacy hooks
 */
export const CRUDPatterns = {
  /**
   * Standard create operation pattern
   */
  async create<T extends { id: string }>(
    entity: T,
    saveOperation: (repository: IDocumentRepository, entity: T) => Promise<T>,
    entityType: string,
    forceRefresh: () => void,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> {
    const result = await withRepositoryOperationAndRefresh(
      async repository => await saveOperation(repository, entity),
      { operationName: `create ${entityType}` },
      forceRefresh,
      onSuccess,
      onError
    )

    return result.success ? result.data! : null
  },

  /**
   * Standard update operation pattern
   */
  async update<T extends { id: string }>(
    entity: T,
    saveOperation: (repository: IDocumentRepository, entity: T) => Promise<T>,
    entityType: string,
    forceRefresh: () => void,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> {
    // Validate entity has ID
    ValidationHelper.validateId(entity.id, entityType)

    const result = await withRepositoryOperationAndRefresh(
      async repository => await saveOperation(repository, entity),
      { operationName: `update ${entityType}` },
      forceRefresh,
      onSuccess,
      onError
    )

    return result.success ? result.data! : null
  },

  /**
   * Standard delete operation pattern
   */
  async delete(
    id: string,
    deleteOperation: (
      repository: IDocumentRepository,
      id: string
    ) => Promise<void>,
    entityType: string,
    forceRefresh: () => void,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    // Validate ID
    ValidationHelper.validateId(id, entityType)

    const result = await withRepositoryOperationAndRefresh(
      async repository => await deleteOperation(repository, id),
      { operationName: `delete ${entityType}` },
      forceRefresh,
      onSuccess,
      onError
    )

    return result.success
  },
}

/**
 * Note: Force refresh and loading state hooks should be implemented in individual hook files
 * using React hooks. These are utility functions that can be used with those hooks.
 */
