import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'
import { radixStyles } from '../../lib/radix-theme'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(radixStyles.tabs.list, className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(radixStyles.tabs.trigger, className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(radixStyles.tabs.content, className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Enhanced components for specific use cases
interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

interface VerticalTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

/**
 * Vertical tabs component specifically designed for settings and navigation
 * Provides better accessibility and keyboard navigation than the legacy implementation
 */
export const VerticalTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  VerticalTabsProps
>(({ tabs, activeTab, onTabChange, className, children, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      value={activeTab}
      onValueChange={onTabChange}
      orientation="vertical"
      className={cn('flex w-full', className)}
      {...props}
    >
      <TabsList className="flex flex-col h-full w-56 bg-theme-bg-secondary border-r border-theme-border-primary p-2 space-y-1">
        {tabs.map(tab => (
          <React.Fragment key={tab.id}>
            {/* Add separators for logical groupings */}
            {(tab.id === 'plugins' ||
              tab.id === 'tags' ||
              tab.id === 'about') && (
              <div className="my-2 mx-2 border-t border-theme-border-primary" />
            )}
            <TabsTrigger
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200',
                'data-[state=active]:text-theme-text-primary data-[state=active]:bg-theme-bg-tertiary',
                'data-[state=active]:shadow-[inset_3px_0_0_var(--color-active-border)]',
                'data-[state=inactive]:text-theme-text-tertiary data-[state=inactive]:hover:text-theme-text-secondary',
                'data-[state=inactive]:hover:bg-theme-bg-tertiary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2',
                'focus:ring-offset-theme-bg-secondary'
              )}
            >
              <div className="flex items-center space-x-3">
                {tab.icon && (
                  <div className="w-4 h-4 flex-shrink-0 text-theme-text-muted data-[state=active]:text-theme-accent-primary">
                    {tab.icon}
                  </div>
                )}
                <span className="text-sm">{tab.label}</span>
              </div>
              {tab.badge && (
                <span className="bg-theme-accent-primary text-theme-text-on-accent text-xs px-2 py-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          </React.Fragment>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
})
VerticalTabs.displayName = 'VerticalTabs'

interface HorizontalTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

/**
 * Horizontal tabs component for general use cases
 * Provides better accessibility and keyboard navigation
 */
export const HorizontalTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  HorizontalTabsProps
>(({ tabs, activeTab, onTabChange, className, children, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      value={activeTab}
      onValueChange={onTabChange}
      orientation="horizontal"
      className={cn('w-full', className)}
      {...props}
    >
      <TabsList className="flex bg-theme-bg-secondary border-b border-theme-border-primary">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200',
              'data-[state=active]:text-theme-text-primary data-[state=active]:bg-theme-bg-tertiary',
              'data-[state=active]:border-b-2 data-[state=active]:border-theme-accent-primary',
              'data-[state=inactive]:text-theme-text-tertiary data-[state=inactive]:hover:text-theme-text-secondary',
              'data-[state=inactive]:hover:bg-theme-bg-tertiary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2',
              'focus:ring-offset-theme-bg-secondary'
            )}
          >
            {tab.icon && (
              <div className="w-4 h-4 flex-shrink-0 text-theme-text-muted data-[state=active]:text-theme-accent-primary">
                {tab.icon}
              </div>
            )}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-theme-accent-primary text-theme-text-on-accent text-xs px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
})
HorizontalTabs.displayName = 'HorizontalTabs'

// Legacy compatibility component
interface LegacyTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon: string
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

/**
 * Legacy compatibility wrapper for existing tabs usage
 * @deprecated Use VerticalTabs or HorizontalTabs instead
 */
export const LegacyTabs = React.forwardRef<HTMLDivElement, LegacyTabsProps>(
  ({ tabs, activeTab, onTabChange, className }, ref) => {
    return (
      <div ref={ref} className={cn('py-2', className)}>
        {tabs.map(tab => (
          <div key={tab.id}>
            {/* Add separators for logical groupings */}
            {(tab.id === 'plugins' ||
              tab.id === 'tags' ||
              tab.id === 'about') && (
              <div className="my-2 mx-4 border-t border-theme-border-primary" />
            )}
            <button
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-theme-text-primary relative'
                  : 'text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-bg-tertiary'
              }`}
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: 'var(--color-active-bg)',
                      boxShadow: 'inset 3px 0 0 var(--color-active-border)',
                    }
                  : {}
              }
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'text-theme-accent-primary'
                      : 'text-theme-text-muted'
                  }`}
                >
                  {/* Legacy icon handling would go here */}
                </div>
                <span className="text-sm">{tab.label}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    )
  }
)
LegacyTabs.displayName = 'LegacyTabs'

export { Tabs, TabsList, TabsTrigger, TabsContent }

// Default export for backward compatibility
export default Tabs
