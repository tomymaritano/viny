/**
 * Diff Service - Calculates differences between note revisions
 * Uses a simple line-based diff algorithm
 */

import type { RevisionDiff, RevisionCompareResult, NoteRevision } from '../../types/revision'

export interface IDiffService {
  compareRevisions(oldRevision: NoteRevision, newRevision: NoteRevision): RevisionCompareResult
  calculateDiff(oldText: string, newText: string): RevisionDiff
  calculateSimilarity(oldText: string, newText: string): number
}

export class DiffService implements IDiffService {
  /**
   * Compare two revisions and return detailed comparison
   */
  compareRevisions(oldRevision: NoteRevision, newRevision: NoteRevision): RevisionCompareResult {
    const diff = this.calculateDiff(oldRevision.content, newRevision.content)
    const similarity = this.calculateSimilarity(oldRevision.content, newRevision.content)

    return {
      oldRevision,
      newRevision,
      diff,
      similarity,
    }
  }

  /**
   * Calculate line-by-line differences between two texts
   */
  calculateDiff(oldText: string, newText: string): RevisionDiff {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    
    const added: string[] = []
    const removed: string[] = []
    const modified: string[] = []
    let unchanged = 0

    // Simple diff algorithm - compare line by line
    const maxLength = Math.max(oldLines.length, newLines.length)
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i]
      const newLine = newLines[i]

      if (oldLine === undefined && newLine !== undefined) {
        // Line was added
        added.push(`+${i + 1}: ${newLine}`)
      } else if (oldLine !== undefined && newLine === undefined) {
        // Line was removed
        removed.push(`-${i + 1}: ${oldLine}`)
      } else if (oldLine !== newLine) {
        // Line was modified
        modified.push(`~${i + 1}: ${oldLine} → ${newLine}`)
      } else {
        // Line unchanged
        unchanged++
      }
    }

    return {
      added,
      removed,
      modified,
      unchanged,
    }
  }

  /**
   * Calculate similarity percentage between two texts
   * Uses Levenshtein distance for more accurate comparison
   */
  calculateSimilarity(oldText: string, newText: string): number {
    if (oldText === newText) return 100
    if (!oldText || !newText) return 0

    const distance = this.levenshteinDistance(oldText, newText)
    const maxLength = Math.max(oldText.length, newText.length)
    const similarity = ((maxLength - distance) / maxLength) * 100

    return Math.round(similarity)
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    // Initialize first column
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    // Initialize first row
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    // Fill the matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Format diff for display
   */
  formatDiff(diff: RevisionDiff): string {
    const lines: string[] = []

    if (diff.added.length > 0) {
      lines.push('Added lines:')
      lines.push(...diff.added)
      lines.push('')
    }

    if (diff.removed.length > 0) {
      lines.push('Removed lines:')
      lines.push(...diff.removed)
      lines.push('')
    }

    if (diff.modified.length > 0) {
      lines.push('Modified lines:')
      lines.push(...diff.modified)
      lines.push('')
    }

    lines.push(`Unchanged lines: ${diff.unchanged}`)

    return lines.join('\n')
  }
}