import React from 'react'
import LoadingSpinner from './ui/LoadingSpinner'

// Loading overlay for full screen loading
export const LoadingOverlay: React.FC<{
  message?: string
  transparent?: boolean
  variant?: 'spinner' | 'dots' | 'pulse' | 'gradient'
}> = ({ 
  message = 'Loading...', 
  transparent = false,
  variant = 'spinner'
}) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${
    transparent ? 'bg-black/20 backdrop-blur-sm' : 'bg-theme-bg-primary'
  }`}>
    <div className="flex flex-col items-center gap-6 px-8 py-6 rounded-2xl bg-theme-bg-secondary/90 backdrop-blur-md border border-theme-border-primary/50 shadow-2xl">
      <LoadingSpinner size="xl" variant={variant} />
      <div className="text-center space-y-2">
        <p className="text-theme-text-primary font-medium">{message}</p>
        <div className="flex justify-center">
          <LoadingSpinner size="sm" variant="dots" color="muted" />
        </div>
      </div>
    </div>
  </div>
)

// Loading state for the notes list
export const NotesListLoading: React.FC = () => (
  <div className="flex-1 overflow-hidden p-4 space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-theme-bg-tertiary rounded h-4 mb-2" style={{ width: `${Math.random() * 40 + 60}%` }} />
      </div>
    ))}
  </div>
)

// Loading state for the sidebar
export const SidebarLoading: React.FC = () => (
  <div className="w-64 h-full bg-theme-bg-secondary border-r border-theme-border-primary p-4">
    <div className="animate-pulse space-y-2">
      <div className="bg-theme-bg-tertiary rounded h-4" style={{ width: '80%' }} />
      <div className="bg-theme-bg-tertiary rounded h-4" style={{ width: '60%' }} />
    </div>
  </div>
)

// Loading state for the editor
export const EditorLoading: React.FC = () => (
  <div className="flex-1 bg-theme-bg-primary p-4">
    <div className="animate-pulse space-y-2">
      <div className="bg-theme-bg-tertiary rounded h-4" style={{ width: '90%' }} />
      <div className="bg-theme-bg-tertiary rounded h-4" style={{ width: '70%' }} />
    </div>
  </div>
)

// Inline loading for buttons
export const ButtonLoading: React.FC<{
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots'
}> = ({ 
  text = 'Loading...', 
  size = 'sm',
  variant = 'spinner'
}) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size={size} variant={variant} />
    <span className="text-theme-text-secondary">{text}</span>
  </div>
)

// Loading state for saving notes
export const SavingIndicator: React.FC<{
  visible: boolean
  variant?: 'spinner' | 'dots' | 'pulse'
}> = ({ visible, variant = 'dots' }) => {
  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-40 bg-theme-bg-secondary/95 backdrop-blur-sm border border-theme-border-primary/50 rounded-xl px-4 py-3 shadow-xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" variant={variant} />
        <span className="text-sm text-theme-text-primary font-medium">Saving...</span>
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

// App initialization loading
export const AppLoading: React.FC<{
  message?: string
}> = ({ message = 'Initializing Viny...' }) => (
  <div className="fixed inset-0 bg-theme-bg-primary flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 p-6">
      <LoadingSpinner size="xl" variant="gradient" />
      <span className="text-theme-text-primary">{message}</span>
    </div>
  </div>
)

// Empty state with loading option
export const EmptyStateLoading: React.FC<{
  title?: string
  description?: string
  icon?: React.ReactNode
}> = ({ 
  title = 'Getting things ready', 
  description = 'Please wait while we load your content.',
  icon 
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    {icon}
    <LoadingSpinner size="lg" variant="pulse" />
    <div className="text-center space-y-2">
      <h3 className="text-theme-text-primary font-medium">{title}</h3>
      <p className="text-theme-text-secondary text-sm">{description}</p>
    </div>
  </div>
)

// Default export for backwards compatibility
export default {
  LoadingOverlay,
  AppLoading,
  EmptyStateLoading,
  NotesListLoading,
  SidebarLoading,
  EditorLoading,
  ButtonLoading,
  SavingIndicator,
  SearchLoading,
  ContentLoading
}