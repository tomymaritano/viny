import React from 'react'

interface SkeletonLoaderProps {
  className?: string
  animate?: boolean
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  animate = true
}) => {
  return (
    <div
      className={`bg-theme-bg-tertiary rounded ${
        animate ? 'animate-pulse' : ''
      } ${className}`}
    />
  )
}

// Pre-built skeleton components for common use cases
export const NoteSkeleton: React.FC = () => (
  <div className="p-3 border-b border-theme-border-primary">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 flex-1">
        <SkeletonLoader className="w-2 h-2 rounded-full" />
        <SkeletonLoader className="h-4 flex-1 max-w-xs" />
      </div>
      <div className="flex gap-1">
        <SkeletonLoader className="w-6 h-6 rounded" />
        <SkeletonLoader className="w-6 h-6 rounded" />
      </div>
    </div>
    <SkeletonLoader className="h-3 w-full mb-1" />
    <SkeletonLoader className="h-3 w-3/4 mb-2" />
    <div className="flex items-center justify-between">
      <div className="flex gap-1">
        <SkeletonLoader className="h-5 w-12 rounded-full" />
        <SkeletonLoader className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonLoader className="h-3 w-20" />
    </div>
  </div>
)

export const SidebarSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    {/* Settings button */}
    <SkeletonLoader className="h-8 w-8 rounded" />
    
    {/* Navigation section */}
    <div className="space-y-2">
      <SkeletonLoader className="h-6 w-20" />
      <div className="space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-8 w-full rounded" />
        ))}
      </div>
    </div>

    {/* Notebooks section */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-6 w-24" />
        <SkeletonLoader className="h-6 w-6 rounded" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-8 w-full rounded" />
        ))}
      </div>
    </div>

    {/* Tags section */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-6 w-16" />
        <SkeletonLoader className="h-6 w-6 rounded" />
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </div>
  </div>
)

export const EditorSkeleton: React.FC = () => (
  <div className="flex-1 p-4 space-y-4">
    {/* Editor toolbar */}
    <div className="flex items-center justify-between border-b border-theme-border-primary pb-2">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      <SkeletonLoader className="h-8 w-20 rounded" />
    </div>

    {/* Editor content */}
    <div className="space-y-3">
      <SkeletonLoader className="h-8 w-1/2" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
      <SkeletonLoader className="h-4 w-4/5" />
      <div className="py-2" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-4 w-5/6" />
    </div>
  </div>
)

export default SkeletonLoader