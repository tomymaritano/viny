# Guía de Release para Viny

## Proceso de Release para macOS (DMG)

### Pre-requisitos

- macOS (para generar DMG)
- Node.js 18+ instalado
- Apple Developer ID (opcional, para notarización)
- Xcode Command Line Tools instalados

### Pasos para crear un release

#### 1. Actualizar versión

```bash
# Para un patch release (1.5.0 → 1.5.1)
npm run release:patch

# Para un minor release (1.5.0 → 1.6.0)
npm run release:minor

# Para un major release (1.5.0 → 2.0.0)
npm run release:major
```

#### 2. Construir el DMG

```bash
# Método recomendado - Script completo
npm run build:dmg

# O paso a paso:
npm run build                # Construir assets web
npm run build:electron-src   # Compilar TypeScript de Electron
npm run build:electron       # Generar DMG
```

#### 3. Archivos generados

Los archivos se generan en `dist-electron/`:

- `Viny-1.5.0-arm64.dmg` - Para Apple Silicon (M1/M2)
- `Viny-1.5.0.dmg` - Para Intel Macs
- Archivos .zip correspondientes

### Configuración del DMG

El DMG incluye:

- **Icono personalizado**: `public/icon-512.png`
- **Fondo oscuro**: Tema Solarized (#002b36)
- **Instalación drag & drop**: Arrastra Viny a Applications
- **Tamaño optimizado**: Compresión normal

### Troubleshooting

#### Error: "Developer ID not found"

Si no tienes certificado de Apple Developer:

1. En `package.json`, asegúrate que `notarize: false`
2. Los usuarios verán advertencia de seguridad al abrir

#### Error: "Cannot find module electron-builder"

```bash
npm install --save-dev electron-builder
```

#### El DMG no se abre en otros Macs

- Verifica que ambas arquitecturas estén incluidas
- Considera usar Universal binary

### Testing del DMG

1. **Test local**:
   - Abre el DMG
   - Arrastra Viny a Applications
   - Abre desde Applications
   - Verifica que funcione correctamente

2. **Test en Mac limpio**:
   - Copia el DMG a otro Mac
   - Intenta instalar sin privilegios de desarrollador
   - Verifica advertencias de seguridad

### Publicación

1. **GitHub Releases**:

   ```bash
   npm run publish:github
   ```

2. **Manual**:
   - Ve a GitHub → Releases → New Release
   - Tag: `v1.5.0`
   - Título: `Viny v1.5.0`
   - Sube los archivos DMG
   - Agrega changelog

### Changelog sugerido

```markdown
## Viny v1.5.0 🎉

### ✨ Nuevas características

- Sistema de carpetas anidadas mejorado
- Modo focus para notebooks
- Interfaz de usuario refinada
- Mejor gestión de tags contextuales

### 🐛 Correcciones

- Arreglado error de almacenamiento en notebooks
- Mejorado rendimiento de búsqueda
- Corregidos problemas de UI en el sidebar

### 🔧 Mejoras técnicas

- Refactorización completa del sidebar
- Implementación de Repository Pattern
- Optimización de bundle size
```

## Notarización (Opcional)

Si tienes Apple Developer ID:

1. Habilita en `package.json`:

   ```json
   "notarize": {
     "appBundleId": "com.viny.app",
     "appleId": "tu-email@example.com",
     "appleIdPassword": "app-specific-password"
   }
   ```

2. Genera app-specific password en Apple ID

3. El proceso de notarización se ejecutará automáticamente

---

**Nota**: Siempre prueba el DMG en una máquina limpia antes de publicar!
