import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100',
      'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2',
      'disabled:pointer-events-none data-[state=open]:bg-theme-bg-tertiary data-[state=open]:text-theme-text-secondary',
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </PopoverPrimitive.Close>
))
PopoverClose.displayName = PopoverPrimitive.Close.displayName

// Enhanced Popover components for specific use cases
interface PopoverWithTitleProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  title: string
  description?: string
  showCloseButton?: boolean
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Popover with title and optional description
 * Provides a complete popover solution with title bar
 */
export const PopoverWithTitle = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverWithTitleProps
>(
  (
    {
      className,
      title,
      description,
      showCloseButton = true,
      trigger,
      open,
      onOpenChange,
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-64',
      md: 'w-72',
      lg: 'w-80',
      xl: 'w-96',
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            className={cn(
              'z-50 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              sizeClasses[size],
              className
            )}
            {...props}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-text-primary">
                  {title}
                </h3>
                {showCloseButton && (
                  <PopoverPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </PopoverPrimitive.Close>
                )}
              </div>
              {description && (
                <p className="text-sm text-theme-text-secondary">
                  {description}
                </p>
              )}
              <div className="text-sm">{children}</div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)
PopoverWithTitle.displayName = 'PopoverWithTitle'

interface ConfirmationPopoverProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive' | 'warning'
}

/**
 * Confirmation popover for destructive actions
 * Provides a confirmation dialog in popover form
 */
export const ConfirmationPopover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  ConfirmationPopoverProps
>(
  (
    {
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
      trigger,
      open,
      onOpenChange,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false)

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    const handleConfirm = () => {
      onConfirm()
      setIsOpen(false)
    }

    const handleCancel = () => {
      onCancel?.()
      setIsOpen(false)
    }

    const variantClasses = {
      default:
        'bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    }

    return (
      <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            className="z-50 w-80 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            {...props}
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary">
                  {title}
                </h3>
                <p className="text-sm text-theme-text-secondary mt-1">
                  {description}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-theme-bg-tertiary hover:bg-theme-bg-quaternary rounded-md transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    variantClasses[variant]
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)
ConfirmationPopover.displayName = 'ConfirmationPopover'

interface FormPopoverProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  title: string
  trigger: React.ReactNode
  submitText?: string
  cancelText?: string
  onSubmit: (data: any) => void
  onCancel?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

/**
 * Form popover for quick data entry
 * Provides a form interface within a popover
 */
export const FormPopover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  FormPopoverProps
>(
  (
    {
      title,
      trigger,
      submitText = 'Submit',
      cancelText = 'Cancel',
      onSubmit,
      onCancel,
      open,
      onOpenChange,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false)

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      const data = Object.fromEntries(formData.entries())
      onSubmit(data)
      setIsOpen(false)
    }

    const handleCancel = () => {
      onCancel?.()
      setIsOpen(false)
    }

    return (
      <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            className="z-50 w-80 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            {...props}
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <h3 className="text-lg font-semibold text-theme-text-primary">
                {title}
              </h3>
              <div className="space-y-3">{children}</div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-theme-text-primary bg-theme-bg-tertiary hover:bg-theme-bg-quaternary rounded-md transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-theme-accent-primary hover:bg-theme-accent-primary/90 rounded-md transition-colors"
                >
                  {submitText}
                </button>
              </div>
            </form>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)
FormPopover.displayName = 'FormPopover'

interface InfoPopoverProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  content: React.ReactNode
  trigger: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

/**
 * Info popover for showing additional information
 * Provides hover or click-triggered information display
 */
export const InfoPopover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  InfoPopoverProps
>(
  (
    { content, trigger, size = 'md', side = 'top', align = 'center', ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-48',
      md: 'w-64',
      lg: 'w-80',
    }

    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            side={side}
            align={align}
            className={cn(
              'z-50 rounded-md border bg-theme-bg-secondary p-3 text-theme-text-primary shadow-md outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              sizeClasses[size]
            )}
            {...props}
          >
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)
InfoPopover.displayName = 'InfoPopover'

// Legacy compatibility component
interface LegacyPopoverProps {
  content: React.ReactNode
  trigger: React.ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left'
  onVisibilityChange?: (visible: boolean) => void
  className?: string
}

/**
 * Legacy compatibility wrapper for existing popover usage
 * @deprecated Use PopoverWithTitle or the base Popover components instead
 */
export const LegacyPopover = React.forwardRef<
  HTMLDivElement,
  LegacyPopoverProps
>(
  (
    {
      content,
      trigger,
      placement = 'top',
      onVisibilityChange,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <PopoverPrimitive.Root onOpenChange={onVisibilityChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={placement}
            className={cn(
              'z-50 w-64 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              className
            )}
            {...props}
          >
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)
LegacyPopover.displayName = 'LegacyPopover'

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }

// Default export for backward compatibility
export default Popover
