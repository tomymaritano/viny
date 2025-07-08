import { create } from 'zustand'
import { pluginManager } from '../plugins/PluginManager'

// Para mostrar toasts desde el store
let toastFunction = null
export const setToastFunction = toast => {
  toastFunction = toast
}

export const usePluginStore = create((set, get) => ({
  // State
  plugins: [],
  loading: false,
  error: null,
  showPluginManager: false,
  showPluginStore: false,

  // Actions
  setPlugins: plugins => set({ plugins }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),
  clearError: () => set({ error: null }),

  // UI Actions
  openPluginManager: () => set({ showPluginManager: true }),
  closePluginManager: () => set({ showPluginManager: false }),
  openPluginStore: () => set({ showPluginStore: true }),
  closePluginStore: () => set({ showPluginStore: false }),

  // Plugin Management
  refreshPlugins: () => {
    const plugins = pluginManager.getPlugins()
    set({ plugins })
  },

  installPlugin: async (pluginCode, filename) => {
    set({ loading: true, error: null })

    try {
      console.log('Installing plugin from file:', filename)
      console.log('Plugin code length:', pluginCode.length)

      // Método más seguro: evaluar el código en un contexto controlado
      let plugin

      try {
        // Crear función que exporta el plugin
        const moduleCode = pluginCode.includes('export default')
          ? pluginCode
          : `export default ${pluginCode}`

        // Usar data URL en lugar de blob URL para mejor compatibilidad
        const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(moduleCode)}`

        try {
          // Intentar import dinámico primero
          const module = await import(/* @vite-ignore */ dataUrl)
          plugin = module.default || module
        } catch (importError) {
          console.warn(
            'Dynamic import failed, trying eval method:',
            importError
          )

          // Fallback: usar eval de forma segura
          const cleanCode = pluginCode
            .replace(/export\s+default\s+/, '')
            .replace(/export\s*\{\s*\w+\s+as\s+default\s*\}/, '')

          // Evaluar en un contexto aislado
          const func = new Function('return ' + cleanCode)
          plugin = func()
        }
      } catch (parseError) {
        console.error('Plugin parsing failed:', parseError)
        throw new Error(`Invalid plugin format: ${parseError.message}`)
      }

      if (!plugin || typeof plugin !== 'object') {
        throw new Error('Plugin must export a valid object')
      }

      // Validar estructura básica del plugin
      if (!plugin.name || !plugin.version || !plugin.activate) {
        throw new Error(
          'Plugin missing required fields: name, version, or activate function'
        )
      }

      console.log('Plugin parsed successfully:', plugin.name)

      // Registrar el plugin con el código para persistencia
      await pluginManager.registerPlugin(plugin, pluginCode)

      // Actualizar estado
      get().refreshPlugins()
      console.log('Plugin installed successfully:', plugin.name)

      // Mostrar toast de éxito
      if (toastFunction) {
        toastFunction.success(`Plugin "${plugin.name}" installed successfully!`)
      }

      return plugin
    } catch (err) {
      console.error('Plugin installation failed:', err)
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  installPluginFromUrl: async url => {
    set({ loading: true, error: null })

    try {
      console.log('🚀 Fetching plugin from URL:', url)

      // Construir URL completa
      const fullUrl = url.startsWith('http')
        ? url
        : `${window.location.origin}/${url}`
      console.log('📡 Full URL:', fullUrl)

      const response = await fetch(fullUrl)
      console.log('📊 Response status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch plugin (${response.status}): ${response.statusText}`
        )
      }

      const pluginCode = await response.text()
      console.log('📄 Plugin code fetched, length:', pluginCode.length)
      console.log('📄 First 200 chars:', pluginCode.substring(0, 200))

      const result = await get().installPlugin(pluginCode, url)
      console.log('✅ Plugin installed from URL successfully')

      // Mostrar toast de éxito
      if (toastFunction) {
        toastFunction.success(`Plugin installed from URL successfully!`)
      }

      return result
    } catch (err) {
      console.error('❌ Plugin installation from URL failed:', err)
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  activatePlugin: async pluginId => {
    set({ loading: true, error: null })

    try {
      await pluginManager.activatePlugin(pluginId)
      get().refreshPlugins()
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  deactivatePlugin: async pluginId => {
    set({ loading: true, error: null })

    try {
      await pluginManager.deactivatePlugin(pluginId)
      get().refreshPlugins()
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  uninstallPlugin: async pluginId => {
    set({ loading: true, error: null })

    try {
      await pluginManager.uninstallPlugin(pluginId)
      get().refreshPlugins()
    } catch (err) {
      set({ error: err.message })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  // Initialize plugins on app start
  initializePlugins: () => {
    get().refreshPlugins()
  },
}))
