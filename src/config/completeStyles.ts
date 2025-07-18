/**
 * Complete Styles System - Unified TypeScript Configuration
 * Replaces all CSS files with type-safe, centralized styling
 */

// ==========================================
// THEME SYSTEM - Replaces themes.css
// ==========================================

export const THEME_VARIABLES = {
  dark: {
    // Base colors
    '--color-base03': '#1a1a1a',
    '--color-base02': '#2a2a2a', 
    '--color-base01': '#3a3a3a',
    '--color-base00': '#4a4a4a',
    '--color-base0': '#666666',
    '--color-base1': '#888888',
    '--color-base2': '#cccccc',
    '--color-base3': '#e0e0e0',
    '--color-base4': '#f0f0f0',
    '--color-base5': '#ffffff',
    
    // Accent colors
    '--color-blue': '#4fc3f7',
    '--color-cyan': '#26c6da',
    '--color-green': '#66bb6a',
    '--color-yellow': '#ffca28',
    '--color-orange': '#ff8a65',
    '--color-red': '#ef5350',
    '--color-magenta': '#ba68c8',
    '--color-violet': '#7986cb',
    
    // Sidebar
    '--color-sidebar': '#221f21',
    
    // Typography
    '--font-family-editor': "'SF Mono', 'Monaco', 'Consolas', 'Fira Code', monospace",
    '--font-family-ui': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    '--font-family-markdown': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    '--font-size-editor': '15px',
    '--font-size-ui': '14px',
    '--font-size-markdown': '16px',
    '--line-height': '1.6',
    
    // Interactions
    '--color-hover-bg': '#2d354d',
    '--color-active-bg': '#2d354d',
    '--color-active-text': '#ffffff',
    '--color-active-border': '#fb6514',
  },
  
  light: {
    '--color-base03': '#ffffff',
    '--color-base02': '#f5f5f5',
    '--color-base01': '#e0e0e0',
    '--color-base00': '#cccccc',
    '--color-base0': '#888888',
    '--color-base1': '#666666',
    '--color-base2': '#333333',
    '--color-base3': '#222222',
    '--color-base4': '#111111',
    '--color-base5': '#000000',
    '--color-blue': '#1976d2',
    '--color-cyan': '#00838f',
    '--color-green': '#388e3c',
    '--color-yellow': '#f57c00',
    '--color-orange': '#e64a19',
    '--color-red': '#d32f2f',
    '--color-magenta': '#7b1fa2',
    '--color-violet': '#3949ab',
    '--color-sidebar': '#221f21',
    '--color-hover-bg': '#2d354d',
    '--color-active-bg': '#2d354d',
    '--color-active-text': '#ffffff',
    '--color-active-border': '#fb6514',
  },
  
  solarized: {
    '--color-base03': '#00141a',
    '--color-base02': '#073642',
    '--color-base01': '#103b3d',
    '--color-base00': '#586e75',
    '--color-base0': '#839496',
    '--color-base1': '#93a1a1',
    '--color-base2': '#eee8d5',
    '--color-base3': '#fdf6e3',
    '--color-base4': '#eee8d5',
    '--color-base5': '#fdf6e3',
    '--color-blue': '#268bd2',
    '--color-cyan': '#2aa198',
    '--color-green': '#859900',
    '--color-yellow': '#b58900',
    '--color-orange': '#cb4b16',
    '--color-red': '#dc322f',
    '--color-magenta': '#d33682',
    '--color-violet': '#6c71c4',
    '--color-hover-bg': '#2d354d',
    '--color-active-bg': '#2d354d',
    '--color-active-text': '#ffffff',
    '--color-active-border': '#fb6514',
  }
} as const

// ==========================================
// COMPONENT STYLES - Replaces components.css
// ==========================================

export const COMPONENT_STYLES = {
  // Button System
  button: {
    base: [
      'transition-all duration-150 ease-in-out',
      'font-weight-400',
      'font-family-inherit',
      'cursor-pointer',
      'border',
      'rounded-sm'
    ].join(' '),
    
    variants: {
      default: [
        'bg-transparent text-theme-text-muted',
        'border-theme-border-primary',
        'px-3 py-1.5 text-sm',
        'hover:bg-theme-bg-tertiary hover:border-theme-border-secondary hover:text-theme-text-secondary',
        'active:bg-theme-bg-secondary'
      ].join(' '),
      
      primary: [
        'bg-theme-bg-tertiary text-theme-text-primary',
        'border-theme-accent-primary',
        'px-3 py-1.5 text-sm',
        'hover:bg-theme-accent-green hover:border-theme-accent-green hover:text-white',
        'active:bg-theme-bg-secondary'
      ].join(' '),
      
      icon: [
        'p-2 rounded-md transition-colors',
        'hover:bg-theme-bg-secondary',
        'text-theme-text-secondary hover:text-theme-text-primary'
      ].join(' '),
    }
  },

  // Card System
  card: {
    base: [
      'bg-theme-bg-tertiary',
      'border border-theme-border-primary',
      'rounded-sm p-4',
      'transition-all duration-150',
      'hover:bg-theme-bg-secondary hover:border-theme-border-secondary'
    ].join(' ')
  },

  // Input System
  input: {
    base: [
      'w-full px-3 py-2',
      'bg-theme-bg-secondary',
      'border border-theme-border-primary',
      'rounded-md text-sm',
      'text-theme-text-primary',
      'placeholder:text-theme-text-muted',
      'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary',
      'focus:border-theme-accent-primary',
      'transition-colors'
    ].join(' ')
  },

  // Modal System
  modal: {
    overlay: [
      'fixed inset-0',
      'bg-black/60 backdrop-blur-sm',
      'flex items-center justify-center',
      'z-50'
    ].join(' '),
    
    container: [
      'border border-theme-border-primary',
      'rounded-lg shadow-xl',
      'w-full mx-4',
      'animate-in fade-in zoom-in-95 duration-300'
    ].join(' '),
    
    header: [
      'flex items-center justify-between',
      'p-4 border-b border-theme-border-primary'
    ].join(' '),
    
    content: 'p-4',
    
    footer: [
      'flex items-center justify-end gap-2',
      'p-4 border-t border-theme-border-primary'
    ].join(' ')
  }
}

// ==========================================
// SIDEBAR STYLES - Replaces sidebar.css
// ==========================================

export const SIDEBAR_STYLES = {
  container: [
    'relative h-full',
    'bg-[var(--color-sidebar)]',
    'backdrop-blur-[10px]',
    'border-r border-theme-border-primary',
    'flex flex-col overflow-hidden'
  ].join(' '),

  // Modern sidebar overrides
  modern: {
    base: '!border-none [&_*]:!border-none [&_*]:!rounded-none',
    roundedElements: '[&_.rounded-full]:!rounded-full',
    textColors: {
      primary: '[&_.text-theme-text-primary]:!text-white',
      secondary: '[&_.text-theme-text-secondary]:!text-gray-100',
      tertiary: '[&_.text-theme-text-tertiary]:!text-gray-300',
      muted: '[&_.text-theme-text-muted]:!text-gray-400'
    }
  },

  header: [
    'p-4 border-b border-theme-border-primary',
    'flex items-center justify-between'
  ].join(' '),

  nav: 'flex-1 overflow-y-auto p-2',

  section: {
    container: 'mb-4',
    header: [
      'flex items-center justify-between',
      'px-3 py-2 text-sm font-medium',
      'text-theme-text-muted cursor-pointer',
      'transition-colors select-none',
      'hover:text-theme-text-secondary'
    ].join(' '),
    content: 'mt-1'
  },

  item: {
    base: [
      'flex items-center justify-between',
      'px-3 py-2 text-sm w-full',
      'text-theme-text-secondary cursor-pointer',
      'transition-all text-left bg-transparent border-none',
      'hover:bg-theme-bg-secondary hover:text-theme-text-primary',
      'relative'
    ].join(' '),
    
    active: [
      'bg-theme-bg-secondary text-theme-text-primary',
      'before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0',
      'before:w-1 before:bg-theme-accent-orange'
    ].join(' '),
    
    content: 'flex items-center gap-2 min-w-0 flex-1',
    icon: 'flex-shrink-0 opacity-75',
    label: 'overflow-hidden text-ellipsis whitespace-nowrap',
    count: 'text-xs opacity-75 flex-shrink-0'
  },

  footer: [
    'mt-auto p-2',
    'border-t border-theme-border-primary'
  ].join(' ')
}

// ==========================================
// SEARCH STYLES - Replaces search.css  
// ==========================================

export const SEARCH_STYLES = {
  bar: 'relative w-full',
  
  inputContainer: 'relative w-full',
  
  inputWrapper: [
    'relative flex items-center',
    'bg-theme-bg-secondary',
    'border border-theme-border-primary',
    'rounded-md transition-all',
    'focus-within:border-theme-accent-primary',
    'focus-within:bg-theme-bg-tertiary',
    'focus-within:ring-2 focus-within:ring-theme-accent-primary/10'
  ].join(' '),
  
  inputIcon: [
    'absolute left-3 w-4 h-4',
    'text-theme-text-muted pointer-events-none z-10'
  ].join(' '),
  
  input: [
    'w-full py-2.5 pl-10 pr-3',
    'bg-transparent border-none outline-none',
    'text-theme-text-primary text-sm',
    'placeholder:text-theme-text-muted'
  ].join(' '),
  
  results: {
    container: [
      'absolute top-full left-0 right-0 z-50',
      'mt-1 bg-theme-bg-secondary',
      'border border-theme-border-primary',
      'rounded-md shadow-lg max-h-96 overflow-y-auto'
    ].join(' '),
    
    item: [
      'px-4 py-3 cursor-pointer transition-colors',
      'border-b border-theme-border-primary last:border-b-0',
      'hover:bg-theme-bg-tertiary'
    ].join(' '),
    
    empty: [
      'px-4 py-8 text-center',
      'text-theme-text-muted text-sm'
    ].join(' ')
  }
}

// ==========================================
// SCROLLBAR SYSTEM - Replaces scrollbar.css
// ==========================================

export const SCROLLBAR_STYLES = {
  base: 'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-theme-border-primary hover:scrollbar-thumb-theme-border-secondary',
  thin: 'scrollbar-thin',
  hidden: 'scrollbar-none',
  hover: 'hover:scrollbar-thin'
}

// ==========================================
// TYPOGRAPHY SYSTEM - Replaces typography.css
// ==========================================

export const TYPOGRAPHY_STYLES = {
  // Global styles
  global: {
    body: [
      'font-[var(--font-family-ui)]',
      'text-[var(--font-size-ui)]',
      'leading-[var(--line-height)]',
      'bg-[var(--color-base03)]',
      'text-[var(--color-base2)]',
      'overflow-hidden font-normal m-0 p-0',
      'select-none'
    ].join(' '),
    
    app: [
      'h-screen flex',
      'bg-[var(--color-base03)]',
      'relative w-screen overflow-hidden'
    ].join(' ')
  },

  // Selection control
  noSelect: 'select-none',
  textSelect: 'select-text',

  // Heading hierarchy  
  headings: {
    h1: 'text-2xl font-semibold mb-2 text-theme-text-primary',
    h2: 'text-xl font-medium mb-3 text-theme-text-secondary',
    h3: 'text-lg font-medium mb-2 text-theme-text-tertiary'
  },

  // Paragraph
  paragraph: 'text-sm leading-6 text-theme-text-secondary mb-3',

  // Prose styles for markdown content
  prose: {
    base: [
      'max-w-none text-theme-text-secondary',
      'font-[var(--font-family-markdown)]',
      'text-[var(--font-size-markdown)]',
      'leading-[var(--line-height)]',
      'font-feature-settings-["liga"_1,"kern"_1]',
      'antialiased'
    ].join(' '),
    
    headings: {
      h1: [
        'text-theme-accent-primary text-4xl font-semibold',
        'my-5 leading-tight',
        'border-b border-theme-border-primary pb-2'
      ].join(' '),
      
      h2: [
        'text-theme-accent-secondary text-3xl font-semibold', 
        'my-4 leading-tight',
        'border-b border-theme-border-primary pb-1'
      ].join(' '),
      
      h3: 'text-theme-accent-violet text-2xl font-semibold my-4 leading-snug',
      h4: 'text-theme-accent-green text-xl font-semibold my-3 leading-snug',
      h5: 'text-theme-accent-yellow text-lg font-semibold my-3 leading-normal uppercase tracking-wide',
      h6: 'text-theme-accent-orange text-base font-semibold my-2 leading-normal uppercase tracking-wider opacity-90'
    },
    
    paragraph: 'my-5 leading-7 text-theme-text-primary',
    
    links: [
      'text-theme-accent-primary underline',
      'underline-offset-2 transition-colors',
      'hover:text-theme-accent-secondary'
    ].join(' '),
    
    formatting: {
      strong: 'text-theme-text-tertiary font-bold',
      em: 'text-theme-accent-violet italic',
      del: 'text-theme-text-muted line-through',
      mark: 'bg-theme-accent-yellow text-[var(--color-base03)] px-1 py-0.5 rounded-sm'
    }
  },

  // Line clamp utilities
  lineClamp: {
    1: 'line-clamp-1',
    2: 'line-clamp-2', 
    3: 'line-clamp-3'
  }
}

// ==========================================
// EDITOR STYLES - Enhanced from existing configs
// ==========================================

export const EDITOR_STYLES = {
  // Content padding (consistent between editor and preview)
  contentPadding: '16px',
  
  // Editor container
  container: [
    'flex-1 flex flex-col',
    'bg-[var(--color-base03)]',
    'rounded-lg overflow-hidden',
    'my-2 border border-theme-border-primary'
  ].join(' '),
  
  // CodeMirror specific (for programmatic application)
  codemirror: {
    base: {
      color: 'var(--color-base2)',
      backgroundColor: 'var(--color-base03)',
      fontSize: '12px',
      fontFamily: 'var(--font-family-editor)',
      height: '100%'
    },
    content: {
      padding: '16px',
      caretColor: 'var(--color-blue)',
      minHeight: '100%',
      lineHeight: '1.5',
      backgroundColor: 'var(--color-base03)',
      fontSize: '12px'
    }
  },
  
  todo: {
    checkbox: {
      pending: 'text-gray-500 font-bold',
      completed: 'text-green-400 font-bold'
    },
    text: {
      pending: 'text-theme-text-secondary',
      completed: 'text-theme-text-muted line-through opacity-70'
    },
    keywords: {
      base: 'font-bold px-1 py-0.5 rounded-sm text-xs',
      todo: 'text-blue-400 bg-blue-400/10',
      fixme: 'text-red-400 bg-red-400/10',
      hack: 'text-orange-400 bg-orange-400/10',
      note: 'text-yellow-400 bg-yellow-400/10',
      bug: 'text-red-400 bg-red-400/10',
      optimize: 'text-green-400 bg-green-400/10',
      review: 'text-purple-400 bg-purple-400/10'
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const STYLE_UTILS = {
  // Apply theme variables to document root
  applyTheme: (theme: keyof typeof THEME_VARIABLES) => {
    const root = document.documentElement
    const variables = THEME_VARIABLES[theme]
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  },
  
  // Combine class names
  cn: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ')
  },
  
  // Get component style variant
  getVariant: <T extends Record<string, any>>(
    variants: T, 
    variant: keyof T, 
    defaultVariant: keyof T
  ): T[keyof T] => {
    return variants[variant] || variants[defaultVariant]
  }
}

// Export everything for easy importing
export const COMPLETE_STYLES = {
  theme: THEME_VARIABLES,
  components: COMPONENT_STYLES,
  sidebar: SIDEBAR_STYLES,
  search: SEARCH_STYLES,
  scrollbar: SCROLLBAR_STYLES,
  typography: TYPOGRAPHY_STYLES,
  editor: EDITOR_STYLES,
  utils: STYLE_UTILS
} as const
