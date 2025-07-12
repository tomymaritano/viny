import React, { useEffect, useRef } from 'react'
import Icons from '../Icons'
import IconButton from './IconButton'
import { THEME_COLORS, ANIMATIONS } from '../../constants/theme'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  icon?: React.ReactNode
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl'
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  icon
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${ANIMATIONS.FADE_IN}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`border border-theme-border-primary rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} mx-4 ${ANIMATIONS.ZOOM_IN}`}
        style={{ backgroundColor: THEME_COLORS.MODAL_BG }}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border-primary">
          <div className="flex items-center gap-2">
            {icon && <span className="text-theme-accent-primary">{icon}</span>}
            <h3 id="modal-title" className="text-lg font-semibold text-theme-text-primary">
              {title}
            </h3>
          </div>
          {showCloseButton && (
            <IconButton
              icon={Icons.X}
              onClick={onClose}
              title="Close"
              size={16}
              variant="default"
              aria-label={`Close ${title} modal`}
            />
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

export default BaseModal