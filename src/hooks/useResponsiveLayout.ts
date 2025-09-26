import { useState, useEffect } from 'react'
import { debounce } from '../utils/debounce'

export const useResponsiveLayout = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, 150)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  const recommendedLayout = isMobile ? 'chat' : isTablet ? 'graph' : 'split'

  const breakpoint = {
    xs: windowSize.width < 640,
    sm: windowSize.width >= 640 && windowSize.width < 768,
    md: windowSize.width >= 768 && windowSize.width < 1024,
    lg: windowSize.width >= 1024 && windowSize.width < 1280,
    xl: windowSize.width >= 1280,
  }

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    recommendedLayout,
    breakpoint,
  }
}
