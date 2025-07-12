/**
 * Component Style Configurations
 * TypeScript definitions for component styling to replace CSS files
 */

// Tag component style configurations
export const TAG_STYLES = {
  // Base tag styles
  base: {
    position: 'relative' as const,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    borderRadius: '0.375rem',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer' as const,
  },

  // Hover effects
  hover: {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Size variants
  sizes: {
    xs: {
      padding: '0.125rem 0.25rem',
      fontSize: '0.65rem',
      lineHeight: '0.9rem',
    },
    sm: {
      padding: '0.125rem 0.375rem',
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    md: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    lg: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  },

  // Color indicator dot
  colorDot: {
    width: '0.375rem',
    height: '0.375rem',
    borderRadius: '50%',
    flexShrink: 0,
  },

  // Remove button
  removeButton: {
    marginLeft: '0.25rem',
    opacity: '0.7',
    transition: 'opacity 0.2s ease-in-out',
    flexShrink: 0,
    width: '0.75rem',
    height: '0.75rem',
  },

  // Context-specific margins
  contexts: {
    list: {
      marginRight: '0.375rem',
      marginBottom: '0.25rem',
    },
    editor: {
      marginRight: '0.25rem',
      marginBottom: '0.125rem',
    },
    sidebar: {
      marginRight: '0.25rem',
      marginBottom: '0.25rem',
      fontSize: '0.6875rem',
    },
  },
}

// Modal and overlay styles
export const MODAL_STYLES = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  modal: {
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '28rem',
    width: '100%',
    margin: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
}

// Color picker specific styles
export const COLOR_PICKER_STYLES = {
  grid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },

  option: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '2px solid',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '0.5rem',
  },

  optionHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },

  previewDot: {
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
  },

  colorName: {
    fontSize: '0.75rem',
    fontWeight: '500',
    textAlign: 'center' as const,
    width: '100%',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
}

// Animation configurations
export const TAG_ANIMATIONS = {
  enter: {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    animate: {
      opacity: 1,
      transform: 'scale(1)',
      transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
    },
  },

  exit: {
    initial: {
      opacity: 1,
      transform: 'scale(1)',
    },
    animate: {
      opacity: 0,
      transform: 'scale(0.8)',
      transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
    },
  },
}

// Utility functions for applying styles
export const getTagSizeStyles = (size: keyof typeof TAG_STYLES.sizes) => {
  return TAG_STYLES.sizes[size] || TAG_STYLES.sizes.md
}

export const getTagContextStyles = (context: keyof typeof TAG_STYLES.contexts) => {
  return TAG_STYLES.contexts[context] || {}
}

// CSS class name generators for components that still need CSS classes
export const generateTagClasses = (size: string, context?: string) => {
  const baseClasses = 'tag-custom'
  const sizeClass = `tag-${size}`
  const contextClass = context ? `${context}-tags` : ''
  
  return [baseClasses, sizeClass, contextClass].filter(Boolean).join(' ')
}
