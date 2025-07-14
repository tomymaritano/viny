import { useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { i18nService, type SupportedLanguage } from '../services/i18nService'

/**
 * Hook que aplica los efectos de los settings en tiempo real
 * Conecta las configuraciones de settings con los sistemas existentes
 */
export const useSettingsEffects = () => {
  const { settings, setTheme } = useAppStore()

  // Aplicar cambios de tema
  useEffect(() => {
    if (settings.uiTheme) {
      setTheme(settings.uiTheme)
      
      // Resolver tema 'system' basado en preferencias del OS
      let resolvedTheme = settings.uiTheme
      if (settings.uiTheme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      
      // Aplicar al DOM - el tema dark es el :root por defecto, así que no necesita data-theme
      if (resolvedTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme')
        document.body.removeAttribute('data-theme')
      } else {
        document.documentElement.setAttribute('data-theme', resolvedTheme)
        document.body.setAttribute('data-theme', resolvedTheme)
      }
      
      // Actualizar meta theme-color para mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        let color = '#1a1a1a' // default dark
        switch (resolvedTheme) {
          case 'light':
            color = '#ffffff'
            break
          case 'solarized':
            color = '#00141a'
            break
          case 'dark':
          default:
            color = '#1a1a1a'
            break
        }
        metaThemeColor.setAttribute('content', color)
      }
    }
  }, [settings.uiTheme, setTheme])

  // Aplicar cambios de idioma
  useEffect(() => {
    if (settings.language) {
      i18nService.applyLanguage(settings.language as SupportedLanguage)
    }
  }, [settings.language])

  // Aplicar CSS personalizado
  useEffect(() => {
    const customCSSElement = document.getElementById('custom-css')
    
    if (settings.customCSSEnabled && settings.customCSS) {
      if (customCSSElement) {
        customCSSElement.textContent = settings.customCSS
      } else {
        const style = document.createElement('style')
        style.id = 'custom-css'
        style.textContent = settings.customCSS
        document.head.appendChild(style)
      }
    } else {
      if (customCSSElement) {
        customCSSElement.remove()
      }
    }
  }, [settings.customCSSEnabled, settings.customCSS])

  // Aplicar configuraciones de tipografía
  useEffect(() => {
    const root = document.documentElement
    
    if (settings.fontSize) {
      root.style.setProperty('--font-size-base', `${settings.fontSize}px`)
    }
    
    if (settings.lineHeight) {
      root.style.setProperty('--line-height-base', settings.lineHeight.toString())
    }
    
    if (settings.fontFamily) {
      root.style.setProperty('--font-family-base', settings.fontFamily)
    }
  }, [settings.fontSize, settings.lineHeight, settings.fontFamily])

  // Aplicar configuraciones del editor
  useEffect(() => {
    const root = document.documentElement
    
    if (settings.editorFontSize) {
      root.style.setProperty('--editor-font-size', `${settings.editorFontSize}px`)
    }
    
    if (settings.indentSize) {
      root.style.setProperty('--editor-indent-size', settings.indentSize.toString())
    }
  }, [settings.editorFontSize, settings.indentSize])

  // Aplicar configuraciones de preview
  useEffect(() => {
    const root = document.documentElement
    
    if (settings.previewFontSize) {
      root.style.setProperty('--preview-font-size', `${settings.previewFontSize}px`)
    }
    
    if (settings.previewLineHeight) {
      root.style.setProperty('--preview-line-height', settings.previewLineHeight.toString())
    }
    
    if (settings.previewMaxWidth) {
      root.style.setProperty('--preview-max-width', `${settings.previewMaxWidth}px`)
    }
  }, [settings.previewFontSize, settings.previewLineHeight, settings.previewMaxWidth])
}