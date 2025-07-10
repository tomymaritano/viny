import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

const ContextMenu = ({ isVisible, position, items, onClose }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-50 min-w-48 theme-bg-primary border border-theme-border-primary rounded-lg shadow-lg py-1"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {items.map((item, index) => (
          <div key={index}>
            {item.type === 'separator' ? (
              <div className="my-1 border-t border-theme-border-primary" />
            ) : (
              <button
                className="w-full px-3 py-2 text-left text-sm text-theme-text-secondary hover:text-theme-text-primary transition-colors flex items-center space-x-2"
                onClick={e => {
                  e.stopPropagation()
                  item.onClick()
                  onClose()
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'var(--color-hover-bg)'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent'
                }}
                disabled={item.disabled}
              >
                {item.icon && <span className="opacity-75">{item.icon}</span>}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-theme-text-muted">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

ContextMenu.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['item', 'separator']),
      label: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      shortcut: PropTypes.string,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ContextMenu
