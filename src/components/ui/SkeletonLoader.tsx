// Simplified skeleton loaders for backward compatibility
import React from 'react'

export const NoteSkeleton: React.FC = () => (
  <div className="animate-pulse p-4 border-b border-theme-border-primary">
    <div className="h-4 bg-theme-bg-tertiary rounded mb-2 w-3/4"></div>
    <div className="h-3 bg-theme-bg-tertiary rounded mb-1 w-full"></div>
    <div className="h-3 bg-theme-bg-tertiary rounded w-2/3"></div>
  </div>
)

export const SidebarSkeleton: React.FC = () => (
  <div className="animate-pulse p-4 space-y-3">
    <div className="h-4 bg-theme-bg-tertiary rounded w-1/2"></div>
    <div className="h-4 bg-theme-bg-tertiary rounded w-2/3"></div>
    <div className="h-4 bg-theme-bg-tertiary rounded w-1/3"></div>
  </div>
)

export const EditorSkeleton: React.FC = () => (
  <div className="animate-pulse p-4 space-y-4">
    <div className="h-6 bg-theme-bg-tertiary rounded w-1/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-theme-bg-tertiary rounded w-full"></div>
      <div className="h-4 bg-theme-bg-tertiary rounded w-5/6"></div>
      <div className="h-4 bg-theme-bg-tertiary rounded w-3/4"></div>
    </div>
  </div>
)