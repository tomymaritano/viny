class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.activePlugins = new Set()
    this.hooks = new Map()
    this.api = null
  }

  // Inicializar el manager con la API de la aplicación
  initialize(api) {
    this.api = api
    this.loadStoredPlugins()
  }

  // Registrar un plugin
  async registerPlugin(pluginData, code = null) {
    try {
      // Validar estructura del plugin
      if (!this.validatePlugin(pluginData)) {
        const missingFields = [
          'name',
          'version',
          'description',
          'activate',
        ].filter(field => !pluginData[field])
        throw new Error(
          `Invalid plugin structure. Missing fields: ${missingFields.join(', ')}`
        )
      }

      const plugin = {
        ...pluginData,
        id: pluginData.name,
        isActive: false,
        instance: null,
        registeredAt: new Date().toISOString(),
        code: code, // Guardar código para persistencia
      }

      this.plugins.set(plugin.id, plugin)

      // Guardar en localStorage
      this.savePluginsToStorage()

      return plugin
    } catch (error) {
      console.error('Failed to register plugin:', error)
      throw error
    }
  }

  // Activar un plugin
  async activatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (plugin.isActive) {
      return // Ya está activo
    }

    try {
      // Crear instancia del plugin con la API
      const pluginAPI = this.createPluginAPI(pluginId)

      if (typeof plugin.activate === 'function') {
        await plugin.activate(pluginAPI)
      }

      plugin.isActive = true
      plugin.instance = pluginAPI
      this.activePlugins.add(pluginId)

      this.savePluginsToStorage()
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error)
      throw error
    }
  }

  // Desactivar un plugin
  async deactivatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !plugin.isActive) {
      return
    }

    try {
      if (typeof plugin.deactivate === 'function') {
        await plugin.deactivate()
      }

      // Limpiar hooks registrados por este plugin
      this.clearPluginHooks(pluginId)

      plugin.isActive = false
      plugin.instance = null
      this.activePlugins.delete(pluginId)

      this.savePluginsToStorage()
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error)
      throw error
    }
  }

  // Desinstalar un plugin
  async uninstallPlugin(pluginId) {
    await this.deactivatePlugin(pluginId)
    this.plugins.delete(pluginId)
    this.savePluginsToStorage()
  }

  // Crear API contextual para un plugin
  createPluginAPI(pluginId) {
    return {
      // Acceso a notas
      notes: {
        getAll: () => this.api.notes.getAll(),
        getById: id => this.api.notes.getById(id),
        create: noteData => this.api.notes.create(noteData),
        update: (id, data) => this.api.notes.update(id, data),
        delete: id => this.api.notes.delete(id),
        search: query => this.api.notes.search(query),
      },

      // UI hooks
      ui: {
        addSidebarSection: section =>
          this.addHook(pluginId, 'sidebar-section', section),
        addToolbarButton: button =>
          this.addHook(pluginId, 'toolbar-button', button),
        addContextMenuItem: item =>
          this.addHook(pluginId, 'context-menu', item),
        addSettingsPanel: panel =>
          this.addHook(pluginId, 'settings-panel', panel),
        showToast: (message, type = 'info') =>
          this.api.ui.showToast(message, type),
        showModal: component => this.api.ui.showModal(component),
      },

      // Editor extensions
      editor: {
        addCommand: command =>
          this.addHook(pluginId, 'editor-command', command),
        addSyntaxHighlight: syntax =>
          this.addHook(pluginId, 'syntax-highlight', syntax),
        addKeyBinding: binding =>
          this.addHook(pluginId, 'key-binding', binding),
        addToolbarButton: button =>
          this.addHook(pluginId, 'editor-toolbar', button),
        // Pass through API methods from the main app
        getActiveEditor: () => this.api.editor?.getActiveEditor?.(),
        onKeyPress: callback => this.api.editor?.onKeyPress?.(callback),
        onEditorCreated: callback =>
          this.api.editor?.onEditorCreated?.(callback),
        executeCommand: (commandId, ...args) =>
          this.api.editor?.executeCommand?.(commandId, ...args),
        getCurrentPosition: () => this.api.editor?.getCurrentPosition?.(),
        setSelection: selection => this.api.editor?.setSelection?.(selection),
      },

      // Exportadores
      exporters: {
        register: exporter => this.addHook(pluginId, 'exporter', exporter),
      },

      // Temas
      themes: {
        register: theme => this.addHook(pluginId, 'theme', theme),
      },

      // Utilidades
      utils: {
        storage: {
          get: key => this.getPluginStorage(pluginId, key),
          set: (key, value) => this.setPluginStorage(pluginId, key, value),
          remove: key => this.removePluginStorage(pluginId, key),
        },
        http: {
          get: (url, options) => fetch(url, { method: 'GET', ...options }),
          post: (url, data, options) =>
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
              ...options,
            }),
        },
      },
    }
  }

  // Añadir hook de un plugin
  addHook(pluginId, hookType, data) {
    if (!this.hooks.has(hookType)) {
      this.hooks.set(hookType, new Map())
    }

    const hookMap = this.hooks.get(hookType)
    if (!hookMap.has(pluginId)) {
      hookMap.set(pluginId, [])
    }

    hookMap.get(pluginId).push(data)
  }

  // Obtener hooks de un tipo
  getHooks(hookType) {
    const hookMap = this.hooks.get(hookType)
    if (!hookMap) return []

    const allHooks = []
    for (const [pluginId, hooks] of hookMap) {
      if (this.activePlugins.has(pluginId)) {
        allHooks.push(...hooks)
      }
    }
    return allHooks
  }

  // Limpiar hooks de un plugin
  clearPluginHooks(pluginId) {
    for (const [hookType, hookMap] of this.hooks) {
      hookMap.delete(pluginId)
    }
  }

  // Storage específico de plugins
  getPluginStorage(pluginId, key) {
    const storage = JSON.parse(
      localStorage.getItem(`plugin-${pluginId}`) || '{}'
    )
    return storage[key]
  }

  setPluginStorage(pluginId, key, value) {
    const storage = JSON.parse(
      localStorage.getItem(`plugin-${pluginId}`) || '{}'
    )
    storage[key] = value
    localStorage.setItem(`plugin-${pluginId}`, JSON.stringify(storage))
  }

  removePluginStorage(pluginId, key) {
    const storage = JSON.parse(
      localStorage.getItem(`plugin-${pluginId}`) || '{}'
    )
    delete storage[key]
    localStorage.setItem(`plugin-${pluginId}`, JSON.stringify(storage))
  }

  // Validar estructura del plugin
  validatePlugin(plugin) {
    const required = ['name', 'version', 'description', 'activate']
    return required.every(field => plugin[field] !== undefined)
  }

  // Guardar plugins en localStorage
  savePluginsToStorage() {
    const pluginsData = Array.from(this.plugins.entries()).map(
      ([id, plugin]) => ({
        id,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        author: plugin.author,
        isActive: plugin.isActive,
        config: plugin.config || {},
        // Guardar el código del plugin para persistencia
        code: plugin.code || null,
        registeredAt: plugin.registeredAt,
      })
    )

    localStorage.setItem('nototo-plugins', JSON.stringify(pluginsData))
  }

  // Cargar plugins desde localStorage
  async loadStoredPlugins() {
    try {
      const stored = localStorage.getItem('nototo-plugins')
      if (stored) {
        let pluginsData = []
        try {
          pluginsData = JSON.parse(stored)
        } catch (parseError) {
          console.error(
            'Failed to parse stored plugins, clearing storage:',
            parseError
          )
          localStorage.removeItem('nototo-plugins')
          return
        }

        // Restaurar plugins desde el almacenamiento
        for (const pluginData of pluginsData) {
          if (pluginData.code) {
            try {
              // Recrear el plugin desde el código guardado
              const plugin = await this.recreatePluginFromCode(
                pluginData.code,
                pluginData
              )
              if (plugin) {
                this.plugins.set(plugin.id, {
                  ...plugin,
                  isActive: false, // Empezar inactivo
                  instance: null,
                  code: pluginData.code,
                  registeredAt: pluginData.registeredAt,
                })
              }
            } catch (error) {
              console.error('Failed to restore plugin:', pluginData.name, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load stored plugins:', error)
    }
  }

  // Recrear plugin desde código guardado
  async recreatePluginFromCode(code, _metadata) {
    try {
      // Usar el mismo método que en usePlugins para evaluar el código
      let plugin

      try {
        // Crear función que exporta el plugin
        const moduleCode = code.includes('export default')
          ? code
          : `export default ${code}`

        // Usar data URL
        const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(moduleCode)}`

        try {
          // Intentar import dinámico
          const module = await import(/* @vite-ignore */ dataUrl)
          plugin = module.default || module
        } catch (importError) {
          console.warn(
            'Dynamic import failed, trying eval method:',
            importError
          )

          // Fallback: usar eval
          const cleanCode = code
            .replace(/export\s+default\s+/, '')
            .replace(/export\s*\{\s*\w+\s+as\s+default\s*\}/, '')

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

      return plugin
    } catch (error) {
      console.error('Failed to recreate plugin from code:', error)
      return null
    }
  }

  // Obtener lista de plugins
  getPlugins() {
    return Array.from(this.plugins.values())
  }

  // Obtener plugin por ID
  getPlugin(pluginId) {
    return this.plugins.get(pluginId)
  }

  // Obtener plugins activos
  getActivePlugins() {
    return Array.from(this.plugins.values()).filter(plugin => plugin.isActive)
  }
}

// Singleton instance
export const pluginManager = new PluginManager()
export default PluginManager
