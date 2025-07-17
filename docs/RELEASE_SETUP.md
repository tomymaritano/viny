# 🚀 Configuración de Releases Automáticos

## Paso a Paso para Configurar GitHub Actions

### 1. ✅ Archivos Ya Creados

```
.github/workflows/
├── release.yml       # Release automático cuando creas un tag
├── build-test.yml    # Testing en cada push/PR
scripts/
├── release.js        # Script para crear releases fácilmente
```

### 2. 🔧 Configuración Inicial

#### A. En tu repositorio GitHub:

1. **Ve a tu repositorio** → Settings → Secrets and Variables → Actions
2. **Agrega estos secrets**:

```
GITHUB_TOKEN (automático, no requiere configuración)
```

#### B. Para macOS (opcional, pero recomendado):

```
APPLE_ID=tu-apple-id@example.com
APPLE_ID_PASS=tu-app-specific-password
APPLE_TEAM_ID=tu-team-id
```

#### C. Para Windows (opcional):

```
CSC_LINK=certificado-base64
CSC_KEY_PASSWORD=password-del-certificado
```

### 3. 📦 Configuración del electron-builder

Tu `package.json` ya tiene la configuración básica. Revisa que tengas:

```json
{
  "build": {
    "appId": "com.viny.app",
    "productName": "Viny",
    "directories": {
      "output": "dist"
    },
    "files": ["dist/**/*", "electron/**/*", "package.json"],
    "mac": {
      "category": "public.app-category.productivity",
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    },
    "publish": {
      "provider": "github",
      "owner": "tu-usuario",
      "repo": "viny"
    }
  }
}
```

### 4. 🎯 Cómo Hacer un Release

#### Opción 1: Script Automático (Recomendado)

```bash
# Para un bug fix (1.1.1 → 1.1.2)
npm run release:patch

# Para nueva funcionalidad (1.1.1 → 1.2.0)
npm run release:minor

# Para cambios mayores (1.1.1 → 2.0.0)
npm run release:major
```

#### Opción 2: Manual

```bash
# 1. Actualizar versión
npm version patch  # o minor, major

# 2. Push con tags
git push origin main --tags
```

### 5. 📊 Qué Hace el Script de Release

1. **Verifica** que el directorio esté limpio
2. **Pull** los últimos cambios
3. **Ejecuta tests** y linter
4. **Buildea** la aplicación
5. **Actualiza** la versión en package.json
6. **Crea** el tag de git
7. **Pushea** cambios y tags
8. **Activa** GitHub Actions automáticamente

### 6. 🔄 Flujo de GitHub Actions

Cuando haces push de un tag:

1. **GitHub Actions** detecta el tag
2. **Buildea** en 3 sistemas: macOS, Windows, Linux
3. **Crea** los instaladores (.dmg, .exe, .AppImage)
4. **Publica** automáticamente en GitHub Releases
5. **Notifica** a los usuarios con auto-updater

### 7. 🎛️ Comandos Útiles

```bash
# Ver versión actual
npm run version

# Crear release de prueba
npm run release:patch

# Ver el estado de GitHub Actions
# Ve a: https://github.com/tu-usuario/viny/actions

# Verificar que todo esté bien
npm run build
npm run test:run
npm run lint
```

### 8. 📱 Configuración del Auto-Updater

El auto-updater ya está configurado pero necesitas activarlo en `electron/main.js`:

```javascript
const { autoUpdater } = require('electron-updater')

// Configurar auto-updater
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'tu-usuario',
  repo: 'viny',
})

// Verificar actualizaciones al iniciar
autoUpdater.checkForUpdatesAndNotify()
```

### 9. 🔒 Seguridad y Certificados

#### Para macOS:

- Necesitas una Apple Developer Account ($99/año)
- Certificate para firma de aplicaciones
- Notarización para distribución

#### Para Windows:

- Certificado de firma de código
- Opcional pero recomendado para evitar warnings

### 10. 🧪 Testing del Sistema

```bash
# 1. Haz cambios
git add .
git commit -m "test: new feature"

# 2. Crea release
npm run release:patch

# 3. Ve a GitHub Actions
# https://github.com/tu-usuario/viny/actions

# 4. Verifica el release
# https://github.com/tu-usuario/viny/releases
```

### 11. 📈 Ventajas del Sistema

- **Automático**: Un comando hace todo
- **Multiplataforma**: Builds para Mac, Windows, Linux
- **Profesional**: Firma de aplicaciones
- **Rápido**: Usuarios reciben actualizaciones automáticamente
- **Confiable**: Testing automático antes de release

### 12. 🛠️ Troubleshooting

#### Si falla el build:

1. Verifica que `npm run build` funcione localmente
2. Revisa los logs en GitHub Actions
3. Asegúrate de que todos los secrets estén configurados

#### Si no se publica:

1. Verifica que tengas permisos en el repo
2. Confirma que el `repository` en package.json sea correcto
3. Revisa que `GITHUB_TOKEN` tenga permisos

### 13. 🎯 Próximos Pasos

1. **Configura** los secrets en GitHub
2. **Actualiza** el repositorio en package.json
3. **Prueba** con `npm run release:patch`
4. **Verifica** que funcione en GitHub Actions
5. **Activa** el auto-updater en main.js

¡Tu sistema de releases automáticos estará completo! 🚀
