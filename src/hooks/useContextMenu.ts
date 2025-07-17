import { useEffect, useCallback } from 'react'

export const useContextMenu = (type: string, context?: any) => {
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    
    // If we're in Electron, use native context menu
    if (window.electronAPI?.isElectron) {
      window.electronAPI.showContextMenu(type, context)
    }
    // For web version, we could implement a custom context menu here
  }, [type, context])
  
  return handleContextMenu
}

// Hook to add context menu to any element
export const useElementContextMenu = (
  elementRef: React.RefObject<HTMLElement>,
  type: string,
  context?: any
) => {
  const handleContextMenu = useContextMenu(type, context)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    element.addEventListener('contextmenu', handleContextMenu)
    
    return () => {
      element.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [elementRef, handleContextMenu])
}