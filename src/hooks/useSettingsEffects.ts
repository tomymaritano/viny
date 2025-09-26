import { useEffect } from 'react'
import { useAppStore } from '../stores/newSimpleStore'
import { useSettings } from './useSettings'
import { i18nService, type SupportedLanguage } from '../services/i18nService'
import { settingsLogger } from '../utils/logger'
import {
  applyThemeToDOM,
  applyCustomCSS,
  applyTypographySettings,
  type ThemeValue,
} from '../utils/themeUtils'

/**
 * Hook que aplica los efectos de los settings en tiempo real
 * Conecta las configuraciones de settings con los sistemas existentes
 */
export const useSettingsEffects = () => {
  const { isInitialized } = useAppStore()
  const { settings } = useSettings()

  // Aplicar cambios de tema - reactivo a cambios de settings
  // Este es ahora el punto principal de inicialización del tema
  useEffect(() => {
    const applyTheme = () => {
      try {
        const theme = settings.theme
        settingsLogger.info(
          '🎨 useSettingsEffects applying theme:',
          theme,
          'from settings:',
          settings.theme
        )

        // Only apply theme to DOM, don't call setTheme to avoid overwriting user's choice
        applyThemeToDOM(theme as ThemeValue)

        settingsLogger.info('✅ Theme applied successfully:', theme)
      } catch (error) {
        settingsLogger.error('❌ Failed to apply theme:', error)
      }
    }

    // Only apply if settings have been initialized from storage
    if (isInitialized && settings && Object.keys(settings).length > 0) {
      applyTheme()
    }
  }, [settings.theme, isInitialized])

  // Aplicar cambios de idioma - reactivo a cambios de settings
  useEffect(() => {
    const applyLanguage = () => {
      try {
        if (settings.language) {
          i18nService.applyLanguage(settings.language as SupportedLanguage)
        }
      } catch (error) {
        settingsLogger.error('Failed to apply language:', error)
      }
    }
    applyLanguage()
  }, [settings.language])

  // Aplicar CSS personalizado - reactivo a cambios de settings
  useEffect(() => {
    const applyCustomCSSEffect = () => {
      try {
        applyCustomCSS(
          settings.customCSS || '',
          settings.customCSSEnabled || false
        )
      } catch (error) {
        settingsLogger.error('Failed to apply custom CSS:', error)
      }
    }
    applyCustomCSSEffect()
  }, [settings.customCSSEnabled, settings.customCSS])

  // Basic typography settings - reactivo a cambios de settings
  useEffect(() => {
    const applyTypography = () => {
      try {
        applyTypographySettings({
          editorFontSize: settings.fontSize || settings.editorFontSize,
          previewFontSize: settings.previewFontSize,
          markdownFontSize: settings.previewFontSize || settings.fontSize,
          lineHeight: settings.lineHeight,
          previewLineHeight: settings.lineHeight, // Can be made separate if needed
          fontFamily: settings.fontFamily,
          syntaxTheme: settings.syntaxTheme,
          previewTheme: settings.previewTheme,
        })
      } catch (error) {
        settingsLogger.error('Failed to apply typography settings:', error)
      }
    }
    applyTypography()
  }, [
    settings.fontSize,
    settings.editorFontSize,
    settings.previewFontSize,
    settings.lineHeight,
    settings.fontFamily,
    settings.syntaxTheme,
    settings.previewTheme,
  ])
}
