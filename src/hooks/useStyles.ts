// Simplified useStyles hook for backward compatibility
export interface StyleVariants {
  button: 'default' | 'primary' | 'secondary' | 'outline'
}

export const useStyles = () => {
  const cn = (...classes: (string | undefined | false)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const button = (variant: StyleVariants['button'] = 'default') => {
    const baseClasses =
      'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none'

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90`
      case 'secondary':
        return `${baseClasses} bg-theme-bg-tertiary text-theme-text-primary hover:bg-theme-bg-tertiary/80`
      case 'outline':
        return `${baseClasses} border border-theme-border-primary text-theme-text-primary hover:bg-theme-bg-tertiary`
      default:
        return `${baseClasses} bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary`
    }
  }

  const modal = {
    overlay: () =>
      'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
    container: (maxWidth = 'md') => {
      const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      }
      return `bg-theme-bg-primary border border-theme-border-primary rounded-lg shadow-xl max-h-[90vh] overflow-hidden ${sizeClasses[maxWidth as keyof typeof sizeClasses] || sizeClasses.md} w-full mx-4`
    },
    header: () =>
      'flex items-center justify-between p-4 border-b border-theme-border-primary bg-theme-bg-secondary',
  }

  return {
    cn,
    button,
    modal,
  }
}

export type { StyleVariants as default }
