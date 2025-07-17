import React, { useEffect, ReactNode } from 'react'
import { Icons } from '../Icons'
import IconButton from './IconButton'

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'large' | 'full'
type ModalPosition = 'center' | 'top' | 'bottom'

interface StandardModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: ModalSize
  position?: ModalPosition
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  footer?: ReactNode
  className?: string
  overlayClassName?: string
  preventBodyScroll?: boolean
  'data-testid'?: string
}

const StandardModal: React.FC<StandardModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  preventBodyScroll = true,
  'data-testid': testId = 'modal'
}) => {
  // Handle body scroll prevention
  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, preventBodyScroll])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'max-w-xs'
      case 'sm': return 'max-w-sm'
      case 'md': return 'max-w-md'
      case 'lg': return 'max-w-lg'
      case 'xl': return 'max-w-xl'
      case 'large': return 'max-w-4xl'
      case 'full': return 'max-w-full mx-4'
      default: return 'max-w-md'
    }
  }

  const getPositionClass = () => {
    switch (position) {
      case 'top': return 'items-start pt-16'
      case 'bottom': return 'items-end pb-16'
      case 'center':
      default: return 'items-center'
    }
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      data-testid="modal-overlay"
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center 
        ${getPositionClass()} transition-all duration-200 animate-in fade-in ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      <div
        data-testid={testId}
        className={`bg-theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl 
          ${getSizeClass()} w-full m-4 max-h-[90vh] flex flex-col
          animate-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-theme-text-primary">
                  {title}
                </h2>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                icon={Icons.X}
                onClick={onClose}
                title="Close"
                size={16}
                variant="ghost"
                aria-label="Close modal"
                data-testid="modal-close"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-theme-border-primary p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { StandardModal }