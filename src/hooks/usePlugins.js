import { useState, useEffect, useCallback } from 'react'
import { pluginManager } from '../plugins/PluginManager'

export function usePlugins() {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Refrescar lista de plugins
  const refreshPlugins = useCallback(() => {
    setPlugins(pluginManager.getPlugins())
  }, [])

  // Instalar plugin desde archivo
  const installPlugin = useCallback(
    async (pluginCode, _filename) => {
      setLoading(true)
      setError(null)

      try {
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

        // Registrar el plugin con el código para persistencia
        await pluginManager.registerPlugin(plugin, pluginCode)

        refreshPlugins()
        return plugin
      } catch (err) {
        console.error('Plugin installation failed:', err)
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshPlugins]
  )

  // Instalar plugin desde URL
  const installPluginFromUrl = useCallback(
    async url => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch plugin: ${response.statusText}`)
        }

        const pluginCode = await response.text()
        return await installPlugin(pluginCode, url)
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [installPlugin]
  )

  // Activar plugin
  const activatePlugin = useCallback(
    async pluginId => {
      setLoading(true)
      setError(null)

      try {
        await pluginManager.activatePlugin(pluginId)
        refreshPlugins()
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshPlugins]
  )

  // Desactivar plugin
  const deactivatePlugin = useCallback(
    async pluginId => {
      setLoading(true)
      setError(null)

      try {
        await pluginManager.deactivatePlugin(pluginId)
        refreshPlugins()
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshPlugins]
  )

  // Desinstalar plugin
  const uninstallPlugin = useCallback(
    async pluginId => {
      setLoading(true)
      setError(null)

      try {
        await pluginManager.uninstallPlugin(pluginId)
        refreshPlugins()
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshPlugins]
  )

  // Obtener hooks de un tipo específico
  const getHooks = useCallback(hookType => {
    return pluginManager.getHooks(hookType)
  }, [])

  // Inicializar en el primer render
  useEffect(() => {
    refreshPlugins()
  }, [refreshPlugins])

  return {
    // Estado
    plugins,
    loading,
    error,

    // Acciones
    installPlugin,
    installPluginFromUrl,
    activatePlugin,
    deactivatePlugin,
    uninstallPlugin,
    refreshPlugins,
    getHooks,

    // Utilidades
    clearError: () => setError(null),
  }
}
