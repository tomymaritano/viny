# Sistema de Auto-Updates de Viny

## Cómo funciona el sistema de actualizaciones automáticas

### 1. Versiones y Releases

La aplicación utiliza **semantic versioning** (semver):

- **Major**: Cambios que rompen compatibilidad (1.0.0 → 2.0.0)
- **Minor**: Nuevas funcionalidades (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

**Versión actual**: v1.1.1

### 2. Proceso de Release Automático

#### Cuando haces commit:

1. Los cambios se commitean al repositorio
2. Si hay cambios significativos, se debe actualizar la versión en `package.json`
3. Al hacer push, GitHub Actions puede generar automáticamente un release

#### Configuración actual:

- **Repositorio**: Configurado en `package.json`
- **Auto-updater**: Basado en `electron-updater`
- **Distribución**: GitHub Releases

### 3. Cómo ver tu versión actual

#### En la aplicación:

1. **Configuración**: Ve a Settings → pestaña "Updates"
2. **Footer de Settings**: Muestra "Viny v1.1.1" en la parte inferior
3. **UpdateChecker**: Componente que monitorea actualizaciones

#### En el código:

```javascript
import packageInfo from './package.json'
console.log(packageInfo.version) // "1.1.1"
```

### 4. Estados de las actualizaciones

La aplicación puede estar en estos estados:

- **idle**: No hay actualizaciones pendientes
- **checking**: Verificando actualizaciones
- **available**: Actualización disponible
- **downloading**: Descargando actualización
- **ready**: Listo para instalar (reinicio requerido)

### 5. Configuración del auto-updater

```javascript
// En electron/main.js (cuando esté implementado)
const { autoUpdater } = require('electron-updater')

autoUpdater.checkForUpdatesAndNotify()
```

### 6. Cómo crear un nuevo release

#### Método manual:

1. Actualizar versión en `package.json`
2. Hacer commit: `git commit -m "bump version to 1.1.2"`
3. Crear tag: `git tag v1.1.2`
4. Push: `git push origin main --tags`
5. GitHub Actions generará el release automáticamente

#### Método con npm:

```bash
npm version patch  # Para 1.1.1 → 1.1.2
npm version minor  # Para 1.1.1 → 1.2.0
npm version major  # Para 1.1.1 → 2.0.0
```

### 7. Archivos de configuración

#### package.json:

```json
{
  "version": "1.1.1",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tu-usuario/viny.git"
  },
  "build": {
    "publish": {
      "provider": "github",
      "owner": "tu-usuario",
      "repo": "viny"
    }
  }
}
```

### 8. Componentes relevantes

- **UpdateChecker.jsx**: Maneja el estado de las actualizaciones
- **UpdateSettings.jsx**: Configuración de auto-updates
- **Settings.jsx**: Muestra la versión actual

### 9. Próximos pasos

Para que las actualizaciones automáticas funcionen completamente:

1. **Configurar GitHub Actions** para build automático
2. **Implementar electron-updater** en main.js
3. **Configurar certificados** para firma de aplicaciones
4. **Testear el flujo completo** de actualización

### 10. Dónde ver la versión

- **En la app**: Settings → Updates → "Current Version"
- **En Settings**: Footer inferior derecho
- **En el código**: `packageInfo.version`
- **En GitHub**: Releases section
- **En el build**: About dialog (cuando esté implementado)
