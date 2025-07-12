/**
 * useStyles Hook - Easy access to the complete styles system
 */

import { useMemo } from 'react'
import { COMPLETE_STYLES } from '../config/completeStyles'

export const useStyles = () => {
  return useMemo(() => ({
    // Direct access to all style categories
    theme: COMPLETE_STYLES.theme,
    components: COMPLETE_STYLES.components,
    sidebar: COMPLETE_STYLES.sidebar,
    search: COMPLETE_STYLES.search,
    scrollbar: COMPLETE_STYLES.scrollbar,
    typography: COMPLETE_STYLES.typography,
    editor: COMPLETE_STYLES.editor,
    utils: COMPLETE_STYLES.utils,
    
    // Helper methods for common operations
    button: (variant: keyof typeof COMPLETE_STYLES.components.button.variants = 'default') => {
      return `${COMPLETE_STYLES.components.button.base} ${COMPLETE_STYLES.components.button.variants[variant]}`
    },
    
    modal: {
      overlay: () => COMPLETE_STYLES.components.modal.overlay,
      container: (maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
        const widthClasses = {
          sm: 'max-w-sm',
          md: 'max-w-md', 
          lg: 'max-w-lg',
          xl: 'max-w-xl'
        }
        return `${COMPLETE_STYLES.components.modal.container} ${widthClasses[maxWidth]}`
      },
      header: () => COMPLETE_STYLES.components.modal.header,
      content: () => COMPLETE_STYLES.components.modal.content,
      footer: () => COMPLETE_STYLES.components.modal.footer
    },
    
    input: (variant: 'default' = 'default') => {
      return COMPLETE_STYLES.components.input.base
    },
    
    card: () => COMPLETE_STYLES.components.card.base,
    
    // Theme utilities
    applyTheme: COMPLETE_STYLES.utils.applyTheme,
    cn: COMPLETE_STYLES.utils.cn,
    getVariant: COMPLETE_STYLES.utils.getVariant,
    
    // Typography helpers
    heading: (level: 'h1' | 'h2' | 'h3') => COMPLETE_STYLES.typography.headings[level],
    prose: {
      base: () => COMPLETE_STYLES.typography.prose.base,
      heading: (level: keyof typeof COMPLETE_STYLES.typography.prose.headings) => 
        COMPLETE_STYLES.typography.prose.headings[level],
      paragraph: () => COMPLETE_STYLES.typography.prose.paragraph,
      links: () => COMPLETE_STYLES.typography.prose.links,
      strong: () => COMPLETE_STYLES.typography.prose.formatting.strong,
      em: () => COMPLETE_STYLES.typography.prose.formatting.em,
      del: () => COMPLETE_STYLES.typography.prose.formatting.del,
      mark: () => COMPLETE_STYLES.typography.prose.formatting.mark
    },
    
    // Sidebar helpers
    sidebarItem: (isActive: boolean = false) => {
      return isActive 
        ? `${COMPLETE_STYLES.sidebar.item.base} ${COMPLETE_STYLES.sidebar.item.active}`
        : COMPLETE_STYLES.sidebar.item.base
    },
    
    // Search helpers  
    searchInput: () => ({
      wrapper: COMPLETE_STYLES.search.inputWrapper,
      icon: COMPLETE_STYLES.search.inputIcon,
      input: COMPLETE_STYLES.search.input
    }),
    
    // Editor helpers
    todoKeyword: (type: keyof typeof COMPLETE_STYLES.editor.todo.keywords) => {
      if (type === 'base') return COMPLETE_STYLES.editor.todo.keywords.base
      return `${COMPLETE_STYLES.editor.todo.keywords.base} ${COMPLETE_STYLES.editor.todo.keywords[type]}`
    }
    
  }), [])
}

// Theme management hook
export const useTheme = () => {
  const { applyTheme } = useStyles()
  
  const setTheme = (theme: 'dark' | 'light' | 'solarized') => {
    applyTheme(theme)
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }
  
  const getCurrentTheme = (): 'dark' | 'light' | 'solarized' => {
    return (localStorage.getItem('theme') as 'dark' | 'light' | 'solarized') || 'dark'
  }
  
  return {
    setTheme,
    getCurrentTheme,
    applyTheme
  }
}

// Type exports for better DX
export type StyleVariants = {
  button: keyof typeof COMPLETE_STYLES.components.button.variants
  modalWidth: 'sm' | 'md' | 'lg' | 'xl'
  theme: keyof typeof COMPLETE_STYLES.theme
  proseHeading: keyof typeof COMPLETE_STYLES.typography.prose.headings
  todoKeyword: keyof typeof COMPLETE_STYLES.editor.todo.keywords
}
