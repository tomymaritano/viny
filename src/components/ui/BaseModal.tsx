import React, { useEffect, useRef } from 'react'
import { Icons } from '../Icons'
import IconButton from './IconButton'
import { THEME_COLORS, ANIMATIONS } from '../../constants/theme'
import { useStyles } from '../../hooks/useStyles'

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
  const styles = useStyles()

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
      className={styles.cn(styles.modal.overlay(), ANIMATIONS.FADE_IN)}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={styles.cn(styles.modal.container(maxWidth), ANIMATIONS.ZOOM_IN)}
        style={{ backgroundColor: THEME_COLORS.MODAL_BG }}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.modal.header()}>
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
