/**
 * Base Application Styles
 * TypeScript configurations for core application styling
 */

// Global reset and base styles
export const GLOBAL_STYLES = {
  reset: {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box' as const,
  },

  body: {
    fontFamily: 'var(--font-family-ui)',
    fontSize: 'var(--font-size-ui)',
    lineHeight: 'var(--line-height)',
    background: 'var(--color-base03)',
    color: 'var(--color-base2)',
    overflow: 'hidden' as const,
    fontWeight: 400,
    margin: 0,
    padding: 0,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    userSelect: 'none' as const,
  },
}

// App container styles
export const APP_LAYOUT = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex' as const,
    background: 'var(--color-base03)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },

  // Draggable title bar for native app feel
  titleBar: {
    content: "''",
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '28px',
    background: 'transparent',
    zIndex: 1000,
    WebkitAppRegion: 'drag' as any,
    pointerEvents: 'none' as const,
  },
}

// User selection control
export const USER_SELECT_STYLES = {
  noSelect: {
    userSelect: 'none' as const,
  },
  textSelect: {
    userSelect: 'text' as const,
  },
}

// Typography hierarchy
export const TYPOGRAPHY = {
  headings: {
    h1: {
      fontSize: '1.6rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: 'var(--color-base5)',
    },
    h2: {
      fontSize: '1.4rem',
      fontWeight: 500,
      marginBottom: '0.75rem',
      color: 'var(--color-base4)',
    },
    h3: {
      fontSize: '1.1rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
      color: 'var(--color-base3)',
    },
  },

  paragraph: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: 'var(--color-base1)',
    marginBottom: '0.75rem',
  },

  // Enhanced typography for prose content
  prose: {
    base: {
      fontFeatureSettings: "'liga' 1, 'kern' 1",
      textRendering: 'optimizeLegibility' as const,
      WebkitFontSmoothing: 'antialiased' as const,
      MozOsxFontSmoothing: 'grayscale' as const,
      maxWidth: 'none',
      color: 'var(--color-base1)',
      fontFamily: 'var(--font-family-markdown)',
      fontSize: 'var(--font-size-markdown)',
      lineHeight: 'var(--line-height)',
    },

    headings: {
      h1: {
        color: 'var(--color-blue)',
        fontSize: '2.2em',
        fontWeight: 600,
        margin: '1.2em 0 0.8em 0',
        lineHeight: 1.2,
        borderBottom: '0.5px solid var(--color-base01)',
        paddingBottom: '0.3em',
      },
      h2: {
        color: 'var(--color-cyan)',
        fontSize: '1.8em',
        fontWeight: 600,
        margin: '1em 0 0.6em 0',
        lineHeight: 1.3,
        borderBottom: '0.5px solid var(--color-base01)',
        paddingBottom: '0.2em',
      },
      h3: {
        color: 'var(--color-violet)',
        fontSize: '1.4em',
        fontWeight: 600,
        margin: '0.9em 0 0.5em 0',
        lineHeight: 1.4,
      },
      h4: {
        color: 'var(--color-green)',
        fontSize: '1.2em',
        fontWeight: 600,
        margin: '0.8em 0 0.4em 0',
        lineHeight: 1.4,
      },
      h5: {
        color: 'var(--color-yellow)',
        fontSize: '1.1em',
        fontWeight: 600,
        margin: '0.7em 0 0.3em 0',
        lineHeight: 1.5,
      },
      h6: {
        color: 'var(--color-orange)',
        fontSize: '1em',
        fontWeight: 600,
        margin: '0.6em 0 0.2em 0',
        lineHeight: 1.5,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
      },
    },

    paragraph: {
      margin: '1.2em 0',
      lineHeight: 1.7,
      color: 'var(--color-base2)',
      fontSize: '1rem',
    },

    links: {
      color: 'var(--color-blue)',
      textDecoration: 'underline',
      textDecorationColor: 'var(--color-blue)',
      textUnderlineOffset: '3px',
      transition: 'all 0.2s ease',
    },

    textFormatting: {
      strong: {
        color: 'var(--color-base3)',
        fontWeight: 700,
      },
      emphasis: {
        color: 'var(--color-violet)',
        fontStyle: 'italic' as const,
      },
      deleted: {
        color: 'var(--color-base0)',
        textDecoration: 'line-through',
      },
      mark: {
        backgroundColor: 'var(--color-yellow)',
        color: 'var(--color-base03)',
        padding: '0.1em 0.2em',
        borderRadius: '2px',
      },
    },
  },
}

// Utility classes for line clamping
export const LINE_CLAMP = {
  1: {
    display: '-webkit-box' as const,
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
  },
  2: {
    display: '-webkit-box' as const,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
  },
  3: {
    display: '-webkit-box' as const,
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
  },
}

// Mobile responsive styles
export const MOBILE_STYLES = {
  mediaQuery: '@media (max-width: 768px)',
  
  styles: {
    app: {
      overflow: 'hidden' as const,
    },
    
    resizeHandle: {
      display: 'none',
    },
    
    editorToolbar: {
      flexWrap: 'wrap' as const,
      padding: '8px 12px',
    },
    
    button: {
      minHeight: '44px',
    },
    
    modalContent: {
      margin: '16px',
      maxWidth: 'calc(100vw - 32px)',
    },
  },
}

// Preview white text override utility
export const PREVIEW_WHITE_TEXT = {
  base: {
    color: '#ffffff !important',
  },
  
  headings: {
    color: '#ffffff !important',
    borderBottom: '1px solid #ffffff !important',
  },
  
  elements: {
    color: '#ffffff !important',
  },
  
  lists: {
    color: '#ffffff !important',
    listStyleType: 'disc !important',
    display: 'list-item !important',
  },
}

// Utility functions
export const getTypographyStyle = (element: keyof typeof TYPOGRAPHY.headings | 'paragraph') => {
  if (element === 'paragraph') {
    return TYPOGRAPHY.paragraph
  }
  return TYPOGRAPHY.headings[element]
}

export const getProseHeadingStyle = (level: keyof typeof TYPOGRAPHY.prose.headings) => {
  return TYPOGRAPHY.prose.headings[level]
}

export const getLineClampStyle = (lines: keyof typeof LINE_CLAMP) => {
  return LINE_CLAMP[lines]
}
