import { useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useSettingsService } from './useSettingsService'
import { i18nService, type SupportedLanguage } from '../services/i18nService'

/**
 * Hook que aplica los efectos de los settings en tiempo real
 * Conecta las configuraciones de settings con los sistemas existentes
 */
export const useSettingsEffects = () => {
  const { setTheme } = useAppStore()
  const { settings } = useSettingsService()

  // Aplicar cambios de tema
  useEffect(() => {
    const theme = settings.theme || 'system'
    if (theme) {
      setTheme(theme)
      
      // Resolver tema 'system' basado en preferencias del OS
      let resolvedTheme = theme
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      
      // Aplicar al DOM - siempre aplicar data-theme para consistencia CSS
      document.documentElement.setAttribute('data-theme', resolvedTheme)
      document.body.setAttribute('data-theme', resolvedTheme)
      
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
          case 'hacklab':
            color = '#0a0a0a'
            break
          case 'dark':
          default:
            color = '#1a1a1a'
            break
        }
        metaThemeColor.setAttribute('content', color)
      }
    }
  }, [settings.theme, setTheme])

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
    
    // Aplicar font size del editor (con valor por defecto)
    const editorFontSize = settings.editorFontSize || 14
    root.style.setProperty('--font-size-editor', `${editorFontSize}px`)
    
    // Aplicar font size de la interfaz (con valor por defecto)
    const interfaceFontSize = settings.interfaceFontSize || 14
    root.style.setProperty('--font-size-ui', `${interfaceFontSize}px`)
    
    // Usar editorFontSize para markdown también (son el mismo contexto)
    const markdownFontSize = settings.editorFontSize || 14
    root.style.setProperty('--font-size-markdown', `${markdownFontSize}px`)
    
    // Aplicar line height (con valor por defecto)
    const lineHeight = settings.lineHeight || 1.6
    root.style.setProperty('--line-height', lineHeight.toString())
    
    // Aplicar font family (con valor por defecto)
    const fontFamily = settings.fontFamily || 'default'
    
    // Mapear font family values a CSS
    const fontFamilyMap = {
      'default': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      'sf-mono': '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      'fira-code': '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      'jetbrains-mono': '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      'consolas': 'Consolas, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace',
      'monaco': 'Monaco, "SF Mono", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
    }
    
    const resolvedFontFamily = fontFamilyMap[fontFamily] || fontFamilyMap['default']
    root.style.setProperty('--font-family-editor', resolvedFontFamily)
  }, [settings.interfaceFontSize, settings.editorFontSize, settings.lineHeight, settings.fontFamily])

  // Aplicar configuraciones adicionales del editor
  useEffect(() => {
    const root = document.documentElement
    
    if (settings.tabSize) {
      root.style.setProperty('--editor-indent-size', settings.tabSize.toString())
    }
  }, [settings.tabSize])

  // Aplicar configuraciones de preview  
  useEffect(() => {
    const root = document.documentElement
    
    const previewWidth = settings.previewWidth || 50
    root.style.setProperty('--preview-width', `${previewWidth}%`)
  }, [settings.previewWidth])

  // Aplicar configuraciones de syntax highlighting
  useEffect(() => {
    let syntaxTheme = settings.syntaxTheme || 'default'
    
    // Si es "default", usar el tema basado en el tema principal
    if (syntaxTheme === 'default') {
      const mainTheme = settings.theme || 'dark'
      const resolvedMainTheme = mainTheme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mainTheme
      
      syntaxTheme = resolvedMainTheme === 'light' ? 'default-light' : 'default-dark'
    }
    
    // Aplicar el tema de syntax highlighting al DOM
    document.documentElement.setAttribute('data-syntax-theme', syntaxTheme)
    console.log('Applied syntax theme:', syntaxTheme)
  }, [settings.syntaxTheme, settings.theme])

  // Aplicar configuraciones del preview theme
  useEffect(() => {
    let previewTheme = settings.previewTheme || 'default'
    
    // Si es "default", usar el tema basado en el tema principal
    if (previewTheme === 'default') {
      const mainTheme = settings.theme || 'dark'
      const resolvedMainTheme = mainTheme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mainTheme
      
      // Para preview, usar los temas default específicos
      previewTheme = resolvedMainTheme === 'light' ? 'default-light' : 'default-dark'
    }
    
    // Aplicar el tema de preview al DOM
    document.documentElement.setAttribute('data-preview-theme', previewTheme)
    console.log('Applied preview theme:', previewTheme)
  }, [settings.previewTheme, settings.theme])
}