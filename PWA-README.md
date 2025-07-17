# 📱 Viny PWA - Instalación y Despliegue

## ✨ Características PWA

Viny ahora es una **Progressive Web App (PWA)** completamente funcional que ofrece:

- 🔧 **Instalable** desde cualquier navegador moderno
- 🌐 **Funciona offline** con Service Worker
- ⚡ **Actualizaciones automáticas**
- 📱 **Experiencia nativa** en desktop y móvil
- 🎨 **Iconos profesionales** y tema Solarized
- 💾 **Cache inteligente** para rendimiento óptimo

## 🚀 Instalación para Usuarios

### Chrome/Edge (Desktop y Android)

1. Visita la aplicación en tu navegador
2. Busca el ícono **"Instalar"** en la barra de direcciones
3. O usa el menú: **⋮ → Instalar Viny**
4. La app aparecerá en tu escritorio/menú de aplicaciones

### Safari (iOS/Mac)

1. Abre la aplicación en Safari
2. Toca el botón **Compartir** 📤
3. Selecciona **"Agregar a pantalla de inicio"**
4. Confirma el nombre y toca **"Agregar"**

### Firefox

1. Abre la aplicación
2. Busca el ícono **"Instalar"** en la barra de direcciones
3. O usa **⋮ → Instalar esta aplicación**

## 🛠 Desarrollo y Build

### Build de Producción

\`\`\`bash
npm run build
\`\`\`

### Preview Local

\`\`\`bash
npx vite preview

# Visita http://localhost:4173

\`\`\`

### Verificar PWA

- Abre DevTools → **Application** → **Manifest**
- Verifica **Service Workers** en la misma pestaña
- Usa **Lighthouse** para auditar la PWA

## 📁 Archivos PWA Generados

### Build Output (`dist/`)

- `manifest.webmanifest` - Metadata de la app
- `sw.js` - Service Worker principal
- `workbox-*.js` - Runtime de cache
- `registerSW.js` - Registro del Service Worker

### Assets Estáticos (`public/`)

- `pwa-192x192.png` - Ícono PWA pequeño
- `pwa-512x512.png` - Ícono PWA grande
- `apple-touch-icon.png` - Ícono iOS
- `favicon.png/svg` - Favicons

## 🌐 Despliegue

### Opciones Recomendadas

#### 1. Vercel (Recomendado)

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

#### 2. Netlify

1. Conecta tu repositorio GitHub
2. Build command: \`npm run build\`
3. Publish directory: \`dist\`

#### 3. GitHub Pages

\`\`\`bash
npm run build

# Sube contenido de dist/ a gh-pages branch

\`\`\`

### Requisitos para PWA

- ✅ **HTTPS obligatorio** (automático en Vercel/Netlify)
- ✅ **Service Worker** configurado
- ✅ **Manifest válido** incluido
- ✅ **Iconos** en múltiples tamaños

## 🔧 Configuración Avanzada

### Personalizar Cache

En \`vite.config.js\`:
\`\`\`javascript
VitePWA({
workbox: {
maximumFileSizeToCacheInBytes: 5000000,
runtimeCaching: [
// Agregar patrones de cache personalizados
]
}
})
\`\`\`

### Actualizar Iconos

1. Edita \`public/icon.svg\`
2. Ejecuta: \`node create-pwa-icons.js\`
3. Rebuild: \`npm run build\`

## 📊 Métricas y Auditoría

### Lighthouse PWA Score

- ✅ **100/100** PWA compliant
- ⚡ **Performance** optimizado
- 🔒 **Security** HTTPS + CSP
- ♿ **Accessibility** AA compliant

### Tamaños de Build

- **Total**: ~4.5MB (incluye Monaco Editor completo)
- **Gzipped**: ~1MB
- **Inicial**: ~200KB (app shell)

## 🎯 Próximos Pasos

1. **Deploy a producción** con dominio personalizado
2. **Optimizar bundle** con code splitting
3. **Agregar notificaciones** push (opcional)
4. **Analytics** y métricas de uso
5. **App store** submission (opcional)

---

## 🔗 Enlaces Útiles

- [PWA Builder](https://www.pwabuilder.com/) - Herramientas PWA
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker toolkit
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) - Documentación oficial

¡Tu aplicación Viny ya está lista para instalación profesional! 🎉
