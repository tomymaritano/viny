import * as React from 'react'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils'

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-theme-accent-primary focus:text-theme-text-primary data-[state=open]:bg-theme-accent-primary data-[state=open]:text-theme-text-primary',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary p-1 text-theme-text-primary shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary p-1 text-theme-text-primary shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-theme-accent-primary focus:text-theme-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-theme-accent-primary focus:text-theme-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-theme-accent-primary focus:text-theme-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-theme-text-primary',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-theme-border-primary', className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-theme-text-secondary',
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = 'ContextMenuShortcut'

// Enhanced Context Menu components for specific use cases
interface ContextMenuItemData {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'item' | 'checkbox' | 'radio' | 'separator' | 'sub' | 'label'
  checked?: boolean
  value?: string
  items?: ContextMenuItemData[]
}

interface EnhancedContextMenuProps {
  items: ContextMenuItemData[]
  trigger: React.ReactNode
  className?: string
}

/**
 * Enhanced context menu with predefined items
 * Simplifies common context menu use cases
 */
export const EnhancedContextMenu = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  EnhancedContextMenuProps
>(({ items, trigger, className, ...props }, ref) => {
  const renderItem = (item: ContextMenuItemData, index: number) => {
    switch (item.type) {
      case 'separator':
        return <ContextMenuSeparator key={index} />

      case 'label':
        return <ContextMenuLabel key={index}>{item.label}</ContextMenuLabel>

      case 'checkbox':
        return (
          <ContextMenuCheckboxItem
            key={index}
            checked={item.checked}
            disabled={item.disabled}
            onCheckedChange={() => item.onClick?.()}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {item.shortcut && (
              <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
            )}
          </ContextMenuCheckboxItem>
        )

      case 'radio':
        return (
          <ContextMenuRadioItem
            key={index}
            value={item.value || item.label}
            disabled={item.disabled}
            onSelect={() => item.onClick?.()}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {item.shortcut && (
              <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
            )}
          </ContextMenuRadioItem>
        )

      case 'sub':
        return (
          <ContextMenuSub key={index}>
            <ContextMenuSubTrigger disabled={item.disabled}>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {item.items?.map((subItem, subIndex) =>
                renderItem(subItem, subIndex)
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )

      default:
        return (
          <ContextMenuItem
            key={index}
            disabled={item.disabled}
            onSelect={() => item.onClick?.()}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {item.shortcut && (
              <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
            )}
          </ContextMenuItem>
        )
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
      <ContextMenuContent ref={ref} className={className} {...props}>
        {items.map((item, index) => renderItem(item, index))}
      </ContextMenuContent>
    </ContextMenu>
  )
})
EnhancedContextMenu.displayName = 'EnhancedContextMenu'

interface FileContextMenuProps {
  fileName: string
  fileType: 'file' | 'folder'
  onRename?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onCut?: () => void
  onDownload?: () => void
  onShare?: () => void
  onProperties?: () => void
  trigger: React.ReactNode
  disabled?: boolean
}

/**
 * File context menu for file management operations
 * Provides common file operations in a context menu
 */
export const FileContextMenu = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  FileContextMenuProps
>(
  (
    {
      fileName,
      fileType,
      onRename,
      onDelete,
      onCopy,
      onCut,
      onDownload,
      onShare,
      onProperties,
      trigger,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const items: ContextMenuItemData[] = [
      {
        label: 'Open',
        icon: <span>📁</span>,
        onClick: () => console.log('Open', fileName),
        disabled,
      },
      {
        label: 'Open with...',
        icon: <span>🔧</span>,
        type: 'sub',
        disabled,
        items: [
          {
            label: 'Text Editor',
            onClick: () => console.log('Open with Text Editor'),
          },
          {
            label: 'Default App',
            onClick: () => console.log('Open with Default App'),
          },
          { label: 'Choose App...', onClick: () => console.log('Choose App') },
        ],
      },
      { type: 'separator' },
      {
        label: 'Cut',
        icon: <span>✂️</span>,
        shortcut: 'Ctrl+X',
        onClick: onCut,
        disabled,
      },
      {
        label: 'Copy',
        icon: <span>📋</span>,
        shortcut: 'Ctrl+C',
        onClick: onCopy,
        disabled,
      },
      { type: 'separator' },
      {
        label: 'Rename',
        icon: <span>✏️</span>,
        shortcut: 'F2',
        onClick: onRename,
        disabled,
      },
      {
        label: 'Delete',
        icon: <span>🗑️</span>,
        shortcut: 'Del',
        onClick: onDelete,
        disabled,
      },
      { type: 'separator' },
      {
        label: fileType === 'file' ? 'Download' : 'Compress',
        icon: <span>⬇️</span>,
        onClick: onDownload,
        disabled,
      },
      {
        label: 'Share',
        icon: <span>🔗</span>,
        onClick: onShare,
        disabled,
      },
      { type: 'separator' },
      {
        label: 'Properties',
        icon: <span>ℹ️</span>,
        onClick: onProperties,
        disabled,
      },
    ]

    return (
      <EnhancedContextMenu
        ref={ref}
        items={items}
        trigger={trigger}
        {...props}
      />
    )
  }
)
FileContextMenu.displayName = 'FileContextMenu'

interface TableContextMenuProps {
  rowData?: any
  onEdit?: (data: any) => void
  onDelete?: (data: any) => void
  onDuplicate?: (data: any) => void
  onExport?: (data: any) => void
  onViewDetails?: (data: any) => void
  trigger: React.ReactNode
  disabled?: boolean
}

/**
 * Table context menu for table row operations
 * Provides common table operations in a context menu
 */
export const TableContextMenu = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  TableContextMenuProps
>(
  (
    {
      rowData,
      onEdit,
      onDelete,
      onDuplicate,
      onExport,
      onViewDetails,
      trigger,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const items: ContextMenuItemData[] = [
      {
        label: 'View Details',
        icon: <span>👁️</span>,
        onClick: () => onViewDetails?.(rowData),
        disabled,
      },
      {
        label: 'Edit',
        icon: <span>✏️</span>,
        shortcut: 'Ctrl+E',
        onClick: () => onEdit?.(rowData),
        disabled,
      },
      {
        label: 'Duplicate',
        icon: <span>📄</span>,
        shortcut: 'Ctrl+D',
        onClick: () => onDuplicate?.(rowData),
        disabled,
      },
      { type: 'separator' },
      {
        label: 'Export',
        icon: <span>📤</span>,
        type: 'sub',
        disabled,
        items: [
          { label: 'Export as CSV', onClick: () => onExport?.(rowData) },
          { label: 'Export as JSON', onClick: () => onExport?.(rowData) },
          { label: 'Export as PDF', onClick: () => onExport?.(rowData) },
        ],
      },
      { type: 'separator' },
      {
        label: 'Delete',
        icon: <span>🗑️</span>,
        shortcut: 'Del',
        onClick: () => onDelete?.(rowData),
        disabled,
      },
    ]

    return (
      <EnhancedContextMenu
        ref={ref}
        items={items}
        trigger={trigger}
        {...props}
      />
    )
  }
)
TableContextMenu.displayName = 'TableContextMenu'

// Legacy compatibility component
interface LegacyContextMenuProps {
  items: Array<{
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    divider?: boolean
  }>
  trigger: React.ReactNode
  className?: string
}

/**
 * Legacy compatibility wrapper for existing context menu usage
 * @deprecated Use EnhancedContextMenu or the base ContextMenu components instead
 */
export const LegacyContextMenu = React.forwardRef<
  HTMLDivElement,
  LegacyContextMenuProps
>(({ items, trigger, className, ...props }, ref) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
      <ContextMenuContent className={className} {...props}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider && <ContextMenuSeparator />}
            <ContextMenuItem
              disabled={item.disabled}
              onSelect={() => item.onClick?.()}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </ContextMenuItem>
          </React.Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
})
LegacyContextMenu.displayName = 'LegacyContextMenu'

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}

// Default export for backward compatibility
export default ContextMenu
