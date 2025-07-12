/**
 * Editor Style Configurations
 * Additional editor styles to complement editorThemes.ts
 */

// Typography configurations
export const TYPOGRAPHY_CONFIG = {
  fontFamilies: {
    editor: "'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace",
    ui: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    markdown: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  fontSizes: {
    editor: '15px',
    ui: '14px',
    markdown: '16px',
  },

  lineHeights: {
    default: 1.6,
    tight: 1.4,
    loose: 1.8,
  },
}

// Editor layout and padding configurations
export const EDITOR_LAYOUT = {
  // Consistent padding between editor and preview
  contentPadding: '16px',
  
  // Editor specific dimensions
  minHeight: '100%',
  borderRadius: '8px',
  
  // Focus states
  focusOutline: 'none',
  focusBorderColor: 'var(--color-blue)',
  focusBoxShadow: '0 0 0 3px rgba(79, 195, 247, 0.1)',
}

// Markdown editor specific styles
export const MARKDOWN_EDITOR_CONFIG = {
  container: {
    flex: 1,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    background: 'var(--color-base03)',
    borderRadius: EDITOR_LAYOUT.borderRadius,
    overflow: 'hidden' as const,
    margin: '8px',
    border: '1px solid var(--color-base01)',
  },

  textarea: {
    flex: 1,
    padding: EDITOR_LAYOUT.contentPadding,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--color-base1)',
    fontFamily: TYPOGRAPHY_CONFIG.fontFamilies.editor,
    fontSize: TYPOGRAPHY_CONFIG.fontSizes.editor,
    lineHeight: TYPOGRAPHY_CONFIG.lineHeights.default,
    resize: 'none' as const,
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    transition: 'all 0.2s ease',
  },

  placeholder: {
    color: 'var(--color-base0)',
    opacity: 0.6,
    fontStyle: 'italic' as const,
  },
}

// TODO plugin specific styles
export const TODO_STYLES = {
  checkbox: {
    pending: {
      color: '#888888',
      fontWeight: 'bold' as const,
    },
    completed: {
      color: '#66bb6a',
      fontWeight: 'bold' as const,
    },
  },

  text: {
    pending: {
      color: 'var(--color-base1)',
    },
    completed: {
      color: 'var(--color-base0)',
      textDecoration: 'line-through',
      opacity: 0.7,
    },
  },

  keywords: {
    base: {
      fontWeight: 'bold' as const,
      padding: '1px 4px',
      borderRadius: '2px',
      fontSize: '0.85em',
    },
    
    variants: {
      todo: {
        color: '#4fc3f7',
        backgroundColor: 'rgba(79, 195, 247, 0.1)',
      },
      fixme: {
        color: '#ef5350',
        backgroundColor: 'rgba(239, 83, 80, 0.1)',
      },
      hack: {
        color: '#ff8a65',
        backgroundColor: 'rgba(255, 138, 101, 0.1)',
      },
      note: {
        color: '#ffca28',
        backgroundColor: 'rgba(255, 202, 40, 0.1)',
      },
      bug: {
        color: '#ef5350',
        backgroundColor: 'rgba(239, 83, 80, 0.1)',
      },
      optimize: {
        color: '#66bb6a',
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
      },
      review: {
        color: '#ba68c8',
        backgroundColor: 'rgba(186, 104, 200, 0.1)',
      },
    },
  },

  widget: {
    hover: {
      transform: 'scale(1.1)',
      transition: 'transform 0.1s ease',
    },
    completedHover: {
      color: '#4caf50 !important',
    },
    pendingHover: {
      color: '#aaaaaa !important',
    },
  },
}

// Scrollbar configurations
export const SCROLLBAR_STYLES = {
  thin: {
    width: '6px',
    height: '6px',
  },
  medium: {
    width: '8px',
    height: '8px',
  },
  thick: {
    width: '12px',
    height: '12px',
  },
  
  colors: {
    track: 'transparent',
    thumb: 'var(--color-base01)',
    thumbHover: 'var(--color-base00)',
  },
}

// Utility functions
export const getEditorPadding = () => EDITOR_LAYOUT.contentPadding

export const getTodoKeywordStyle = (keyword: keyof typeof TODO_STYLES.keywords.variants) => {
  const baseStyle = TODO_STYLES.keywords.base
  const variantStyle = TODO_STYLES.keywords.variants[keyword] || TODO_STYLES.keywords.variants.todo
  
  return { ...baseStyle, ...variantStyle }
}

export const generateScrollbarCSS = (size: keyof typeof SCROLLBAR_STYLES = 'medium') => {
  const { width, height } = SCROLLBAR_STYLES[size]
  const { track, thumb, thumbHover } = SCROLLBAR_STYLES.colors
  
  return `
    ::-webkit-scrollbar {
      width: ${width};
      height: ${height};
    }
    
    ::-webkit-scrollbar-track {
      background: ${track};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${thumb};
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${thumbHover};
    }
  `
}
