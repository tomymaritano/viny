// 🎨 THEME CONFIGURATION - No más hardcoding!

export const theme = {
  // Editor Colors
  colors: {
    // Headers
    header: '#EEC951',

    // Syntax highlighting
    bold: '#ED6E3F',
    emphasis: '#B0BEC5',
    link: '#488076',
    code: '#DA5677',
    strikethrough: '#78909C',

    // UI Colors
    primary: '#4FC3F7',
    secondary: '#26C6DA',
    accent: '#00BCD4',

    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Backgrounds
    background: {
      primary: 'var(--color-base03)',
      secondary: 'var(--color-base02)',
      tertiary: 'var(--color-base01)',
    },

    // Text
    text: {
      primary: 'var(--color-base2)',
      secondary: 'var(--color-base1)',
      tertiary: 'var(--color-base0)',
      muted: 'var(--color-base00)',
    },

    // Borders
    border: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
    },
  },

  // Typography
  typography: {
    // Base font size
    baseFontSize: '12px',

    // Font families
    fontFamily: {
      ui: 'var(--font-family-ui)',
      markdown: 'var(--font-family-markdown)',
      code: 'SF Mono, Monaco, Consolas, monospace',
    },

    // Line heights
    lineHeight: {
      tight: '1.3',
      normal: '1.6',
      relaxed: '1.8',
    },

    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Header sizes (relative to base)
    headers: {
      h1: '1.15em',
      h2: '1.1em',
      h3: '1.05em',
      h4: '1.02em',
      h5: '1em',
      h6: '1em',
    },
  },

  // Spacing
  spacing: {
    // Content padding
    content: '24px',
    contentMobile: '16px',

    // Margins
    margin: {
      small: '0.1em',
      medium: '0.2em',
      large: '0.3em',
    },

    // Gutters
    gutter: {
      width: '24px',
      widthMobile: '20px',
      padding: '4px',
    },
  },

  // Editor specific
  editor: {
    // Line numbers
    lineNumbers: {
      minWidth: '24px',
      fontSize: '0.85em',
      color: 'var(--color-base0, #546E7A)',
    },

    // Cursor
    cursor: {
      color: 'var(--color-cyan, #4FC3F7)',
    },

    // Selection
    selection: {
      background: 'rgba(255, 255, 255, 0.1)',
    },

    // Active line
    activeLine: {
      background: 'var(--color-base03, rgba(79, 195, 247, 0.1))',
    },
  },

  // Animations
  animations: {
    // Transition durations
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },

    // Easing functions
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

// 🎯 Theme utilities
export const getThemeValue = path => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme)
}

export const applyTheme = element => {
  if (!element) return

  // Apply CSS custom properties from theme
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      element.style.setProperty(`--theme-${key}`, value)
    }
  })
}

// 📱 Responsive utilities
export const mediaQueries = {
  mobile: `@media (max-width: ${theme.breakpoints.mobile})`,
  tablet: `@media (max-width: ${theme.breakpoints.tablet})`,
  desktop: `@media (min-width: ${theme.breakpoints.desktop})`,
}

// 🌈 Color utilities
export const rgba = (color, alpha) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}

export default theme
