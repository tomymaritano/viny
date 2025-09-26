import type { ReactNode } from 'react'
import React, { useEffect } from 'react'
import { Icons } from '../Icons'
import IconButton from './IconButton'
import { VisuallyHidden } from './VisuallyHidden'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalOverlay,
} from './Modal'

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'large' | '2xl' | 'full'
type ModalPosition = 'center' | 'top' | 'bottom'

interface StandardModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: ModalSize
  position?: ModalPosition
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  footer?: ReactNode
  className?: string
  preventBodyScroll?: boolean
  icon?: ReactNode
  'data-testid'?: string
}

const StandardModal: React.FC<StandardModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  className = '',
  preventBodyScroll = true,
  icon,
  'data-testid': testId = 'modal',
}) => {
  // Handle body scroll prevention - still needed for additional control
  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, preventBodyScroll])

  // Handle escape key when disabled
  useEffect(() => {
    if (!isOpen || closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleEscape, { capture: true })
    return () =>
      document.removeEventListener('keydown', handleEscape, { capture: true })
  }, [isOpen, closeOnEscape])

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'max-w-xs'
      case 'sm':
        return 'max-w-sm'
      case 'md':
        return 'max-w-md'
      case 'lg':
        return 'max-w-lg'
      case 'xl':
        return 'max-w-xl'
      case 'large':
        return 'max-w-4xl'
      case '2xl':
        return 'max-w-6xl'
      case 'full':
        return 'max-w-full mx-4'
      default:
        return 'max-w-md'
    }
  }

  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'items-start pt-16'
      case 'bottom':
        return 'items-end pb-16'
      case 'center':
      default:
        return 'items-center'
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose()
        }
      }}
    >
      <ModalContent
        size={size as any} // Map our sizes to Radix sizes
        variant="default"
        onEscapeKeyDown={e => {
          if (!closeOnEscape) {
            e.preventDefault()
          }
        }}
        onPointerDownOutside={e => {
          if (!closeOnBackdrop) {
            e.preventDefault()
          }
        }}
        onInteractOutside={e => {
          if (!closeOnBackdrop) {
            e.preventDefault()
          }
        }}
        className={`
          ${getSizeClass()} w-full m-4 max-h-[90vh] flex flex-col
          animate-in zoom-in-95 duration-200 ${className}
        `}
        data-testid={testId}
      >
        {/* Header with title and close button */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {icon && (
                <span className="text-theme-accent-primary flex-shrink-0">
                  {icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                {title ? (
                  <ModalTitle className="text-lg font-semibold text-theme-text-primary">
                    {title}
                  </ModalTitle>
                ) : (
                  <VisuallyHidden>
                    <ModalTitle>Modal dialog</ModalTitle>
                  </VisuallyHidden>
                )}
                {description && (
                  <ModalDescription className="text-sm text-theme-text-secondary mt-1">
                    {description}
                  </ModalDescription>
                )}
              </div>
            </div>
            {showCloseButton && (
              <div className="flex-shrink-0 ml-4">
                <ModalClose asChild>
                  <IconButton
                    icon={Icons.X}
                    onClick={onClose}
                    title="Close"
                    size={16}
                    variant="ghost"
                    aria-label="Close modal"
                    data-testid="modal-close"
                  />
                </ModalClose>
              </div>
            )}
          </div>
        )}

        {/* Hidden title for accessibility when no header is shown */}
        {!title && !showCloseButton && (
          <VisuallyHidden>
            <ModalTitle>Modal dialog</ModalTitle>
          </VisuallyHidden>
        )}

        {/* Hidden description for accessibility if not provided visually */}
        {!description && (
          <ModalDescription className="sr-only">
            {title ? `${title} dialog` : 'Modal dialog'}
          </ModalDescription>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-theme-border-primary p-4">
            {footer}
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

// Compatibility wrapper for BaseModal API
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  icon?: ReactNode
}

export const BaseModal: React.FC<BaseModalProps> = ({
  maxWidth = 'md',
  ...props
}) => {
  return <StandardModal {...props} size={maxWidth} />
}

export { StandardModal }
