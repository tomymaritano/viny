import React from 'react'
import LoadingSpinner from './ui/LoadingSpinner'
import { NoteSkeleton, SidebarSkeleton, EditorSkeleton } from './ui/SkeletonLoader'

// Loading overlay for full screen loading
export const LoadingOverlay: React.FC<{
  message?: string
  transparent?: boolean
}> = ({ 
  message = 'Loading...', 
  transparent = false 
}) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${
    transparent ? 'bg-black/20' : 'bg-theme-bg-primary'
  }`}>
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-theme-text-secondary text-sm">{message}</p>
    </div>
  </div>
)

// Loading state for the notes list
export const NotesListLoading: React.FC = () => (
  <div className="flex-1 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <NoteSkeleton key={i} />
    ))}
  </div>
)

// Loading state for the sidebar
export const SidebarLoading: React.FC = () => (
  <div className="w-64 h-full bg-theme-bg-secondary border-r border-theme-border-primary">
    <SidebarSkeleton />
  </div>
)

// Loading state for the editor
export const EditorLoading: React.FC = () => (
  <div className="flex-1 bg-theme-bg-primary">
    <EditorSkeleton />
  </div>
)

// Inline loading for buttons
export const ButtonLoading: React.FC<{
  text?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ 
  text = 'Loading...', 
  size = 'sm' 
}) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size={size} />
    <span className="text-theme-text-secondary">{text}</span>
  </div>
)

// Loading state for saving notes
export const SavingIndicator: React.FC<{
  visible: boolean
}> = ({ visible }) => {
  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-40 bg-theme-bg-secondary border border-theme-border-primary rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-theme-text-secondary">Saving...</span>
      </div>
    </div>
  )
}

// Loading state for search results
export const SearchLoading: React.FC = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-theme-bg-tertiary rounded-full animate-pulse" />
          <div className="h-4 bg-theme-bg-tertiary rounded animate-pulse flex-1 max-w-xs" />
        </div>
        <div className="h-3 bg-theme-bg-tertiary rounded animate-pulse w-full" />
        <div className="h-3 bg-theme-bg-tertiary rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
)

// Generic content loading
export const ContentLoading: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-theme-bg-tertiary rounded animate-pulse ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
)

export default {
  LoadingOverlay,
  NotesListLoading,
  SidebarLoading,
  EditorLoading,
  ButtonLoading,
  SavingIndicator,
  SearchLoading,
  ContentLoading
}