/**
 * Servicio básico de internacionalización
 * Maneja el cambio de idioma y configuraciones regionales
 */

export type SupportedLanguage = 'en' | 'en-gb' | 'es' | 'es-mx' | 'fr' | 'de' | 'it' | 'pt-br' | 'zh-cn' | 'ja' | 'ko'

interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
  dateFormat: string
  numberFormat: string
}

const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  'en': {
    code: 'en',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: 'en-US'
  },
  'en-gb': {
    code: 'en-gb',
    name: 'English (UK)', 
    nativeName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'en-GB'
  },
  'es': {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'es-ES'
  },
  'es-mx': {
    code: 'es-mx',
    name: 'Español (México)',
    nativeName: 'Español',
    flag: '🇲🇽',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'es-MX'
  },
  'fr': {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'fr-FR'
  },
  'de': {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: 'de-DE'
  },
  'it': {
    code: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'it-IT'
  },
  'pt-br': {
    code: 'pt-br',
    name: 'Português (Brasil)',
    nativeName: 'Português',
    flag: '🇧🇷',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'pt-BR'
  },
  'zh-cn': {
    code: 'zh-cn',
    name: '中文 (简体)',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'zh-CN'
  },
  'ja': {
    code: 'ja',
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'ja-JP'
  },
  'ko': {
    code: 'ko',
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    dateFormat: 'yyyy. MM. dd.',
    numberFormat: 'ko-KR'
  }
}

class I18nService {
  private currentLanguage: SupportedLanguage = 'en'

  /**
   * Aplica el idioma especificado
   */
  applyLanguage(language: SupportedLanguage): void {
    const config = LANGUAGE_CONFIGS[language]
    if (!config) {
      console.warn(`Language ${language} not supported, falling back to English`)
      return
    }

    this.currentLanguage = language

    // Aplicar configuración del idioma al documento
    document.documentElement.lang = language
    document.documentElement.dir = config.dir

    // Guardar en localStorage para persistencia
    localStorage.setItem('language', language)

    // Aplicar configuraciones regionales
    this.applyRegionalSettings(config)

    console.log(`Language changed to: ${config.name}`)
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  /**
   * Obtiene la configuración del idioma actual
   */
  getCurrentLanguageConfig(): LanguageConfig {
    return LANGUAGE_CONFIGS[this.currentLanguage]
  }

  /**
   * Inicializa el servicio con el idioma guardado o detectado
   */
  initialize(): void {
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage
    const detectedLanguage = this.detectBrowserLanguage()
    const defaultLanguage = savedLanguage || detectedLanguage || 'en'

    this.applyLanguage(defaultLanguage)
  }

  /**
   * Detecta el idioma del navegador
   */
  private detectBrowserLanguage(): SupportedLanguage | null {
    const browserLang = navigator.language.toLowerCase()
    
    // Buscar coincidencia exacta
    if (browserLang in LANGUAGE_CONFIGS) {
      return browserLang as SupportedLanguage
    }

    // Buscar coincidencia por código de idioma base
    const langCode = browserLang.split('-')[0]
    const match = Object.keys(LANGUAGE_CONFIGS).find(key => 
      key.startsWith(langCode)
    )

    return match as SupportedLanguage || null
  }

  /**
   * Aplica configuraciones regionales específicas del idioma
   */
  private applyRegionalSettings(config: LanguageConfig): void {
    // Configurar formatos de fecha y número globalmente
    // Esto se puede usar para formatear fechas y números en la UI
    
    // Ejemplo: Configurar meta tags para SEO
    const metaLang = document.querySelector('meta[http-equiv="Content-Language"]')
    if (metaLang) {
      metaLang.setAttribute('content', config.code)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('http-equiv', 'Content-Language')
      meta.setAttribute('content', config.code)
      document.head.appendChild(meta)
    }
  }

  /**
   * Formatea una fecha según el idioma actual
   */
  formatDate(date: Date): string {
    const config = this.getCurrentLanguageConfig()
    return new Intl.DateTimeFormat(config.numberFormat).format(date)
  }

  /**
   * Formatea un número según el idioma actual
   */
  formatNumber(number: number): string {
    const config = this.getCurrentLanguageConfig()
    return new Intl.NumberFormat(config.numberFormat).format(number)
  }

  /**
   * Obtiene todos los idiomas disponibles
   */
  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS)
  }
}

// Exportar instancia singleton
export const i18nService = new I18nService()

// Exportar tipos y configuraciones
export { LANGUAGE_CONFIGS, type LanguageConfig }