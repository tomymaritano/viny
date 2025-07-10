// Task progress utilities for markdown content

interface TaskProgress {
  total: number
  completed: number
  progress: number
}

/**
 * Extract tasks from markdown content and calculate progress
 */
export const extractTaskProgress = (content: string): TaskProgress => {
  if (!content || typeof content !== 'string') {
    return { total: 0, completed: 0, progress: 0 }
  }

  // Regex to match task list items: - [ ] or - [x] or - [X]
  const taskRegex = /^[\s]*[-*+]\s*\[([ xX])\]/gm
  const matches = content.match(taskRegex) || []
  
  if (matches.length === 0) {
    return { total: 0, completed: 0, progress: 0 }
  }

  const total = matches.length
  const completed = matches.filter(match => {
    const checkbox = match.match(/\[([xX ])\]/)?.[1]
    return checkbox === 'x' || checkbox === 'X'
  }).length

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, progress }
}

/**
 * Check if content has any tasks
 */
export const hasTasks = (content: string): boolean => {
  const { total } = extractTaskProgress(content)
  return total > 0
}

/**
 * Get progress status color class
 */
export const getProgressColor = (progress: number): string => {
  if (progress === 100) return 'text-theme-accent-green'
  if (progress >= 75) return 'text-theme-accent-blue'
  if (progress >= 50) return 'text-theme-accent-yellow'
  if (progress >= 25) return 'text-theme-accent-orange'
  return 'text-theme-accent-red'
}

/**
 * Format progress text
 */
export const formatProgressText = (completed: number, total: number): string => {
  return `${completed}/${total} tasks`
}