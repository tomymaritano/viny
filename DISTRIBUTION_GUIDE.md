# 📦 VINY - DISTRIBUTION GUIDE

## 🚀 **CÓMO DISTRIBUIR TU APP ELECTRON**

### **1. PREPARACIÓN PARA DISTRIBUCIÓN**

#### **Setup Build System**

```bash
# Instalar electron-builder
npm install --save-dev electron-builder

# Instalar electron-updater para auto-updates
npm install electron-updater
```

#### **package.json Configuration**

```json
{
  "main": "public/electron.js",
  "scripts": {
    "dist": "npm run build && electron-builder",
    "dist:all": "npm run build && electron-builder -mwl",
    "dist:mac": "npm run build && electron-builder --mac",
    "dist:win": "npm run build && electron-builder --win",
    "dist:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.viny.app",
    "productName": "Viny",
    "directories": {
      "output": "dist"
    },
    "files": ["build/**/*", "node_modules/**/*", "public/electron.js"],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "assets/icon.icns",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "icon": "assets/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "icon": "assets/icon.png",
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ]
    },
    "publish": {
      "provider": "github",
      "owner": "tu-usuario",
      "repo": "viny"
    }
  }
}
```

---

### **2. AUTO-UPDATER SETUP**

#### **main.js (Electron Main Process)**

```javascript
const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')

// Auto-updater setup (solo en producción)
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    console.log('Update available')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
    autoUpdater.quitAndInstall()
  })
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon.png'), // App icon
    titleBarStyle: 'hiddenInset', // macOS style
    show: false, // Don't show until ready
  })

  // Load app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`

  mainWindow.loadURL(startUrl)

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}
```

---

### **3. ICONOS Y ASSETS**

Necesitas crear iconos para cada plataforma:

```
assets/
├── icon.icns     (macOS - 512x512)
├── icon.ico      (Windows - 256x256)
└── icon.png      (Linux - 512x512)
```

#### **Generar iconos automáticamente:**

```bash
# Instalar electron-icon-builder
npm install --save-dev electron-icon-builder

# Generar desde PNG de 1024x1024
electron-icon-builder --input=./icon-source.png --output=./assets --flatten
```

---

### **4. GITHUB ACTIONS PARA BUILD AUTOMÁTICO**

#### **.github/workflows/build.yml**

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build React app
        run: npm run build

      - name: Build Electron app
        run: npm run dist
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/
```

---

### **5. CODE SIGNING (Importante para distribución)**

#### **macOS Code Signing:**

```json
// En package.json build config
"mac": {
  "identity": "Developer ID Application: Tu Nombre (TEAM_ID)",
  "entitlements": "build/entitlements.plist",
  "gatekeeperAssess": false
}
```

#### **Windows Code Signing:**

```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password",
  "publisherName": "Tu Empresa"
}
```

---

### **6. CANALES DE DISTRIBUCIÓN**

#### **A. GitHub Releases (GRATIS - Recomendado para empezar)**

```bash
# Crear release automáticamente
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions compilará y subirá automáticamente
```

**Ventajas:**

- ✅ Gratis
- ✅ Auto-updates funcionan
- ✅ Control total
- ✅ Estadísticas de descarga

**Desventajas:**

- ❌ Menos credibilidad que stores oficiales
- ❌ Usuario debe confiar en certificados

#### **B. Mac App Store ($99/año)**

```bash
# Setup para Mac App Store
npm install --save-dev electron-builder-mas

# Build para MAS
npm run dist:mas
```

**Ventajas:**

- ✅ Máxima credibilidad
- ✅ Built-in updates
- ✅ Payment processing
- ✅ Descubrimiento

**Desventajas:**

- ❌ $99/año
- ❌ Review process
- ❌ Sandboxing restrictions

#### **C. Microsoft Store (Gratis)**

```bash
# Package para Microsoft Store
npm run dist:appx
```

#### **D. Snap Store (Linux - Gratis)**

```bash
# Build snap package
npm run dist:snap
```

---

### **7. WEBSITE DE DESCARGA**

#### **Landing Page Estructura:**

```html
<!-- index.html -->
<div class="download-section">
  <h2>Download Viny</h2>

  <div class="download-buttons">
    <a
      href="https://github.com/usuario/viny/releases/latest/download/Viny-1.0.0.dmg"
      class="btn btn-mac"
    >
      <i class="fab fa-apple"></i>
      Download for macOS
    </a>

    <a
      href="https://github.com/usuario/viny/releases/latest/download/Viny-Setup-1.0.0.exe"
      class="btn btn-windows"
    >
      <i class="fab fa-windows"></i>
      Download for Windows
    </a>

    <a
      href="https://github.com/usuario/viny/releases/latest/download/Viny-1.0.0.AppImage"
      class="btn btn-linux"
    >
      <i class="fab fa-linux"></i>
      Download for Linux
    </a>
  </div>
</div>
```

#### **Auto-detect Platform:**

```javascript
// Auto-detect user platform
function detectPlatform() {
  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()

  if (platform.includes('mac')) return 'mac'
  if (platform.includes('win')) return 'windows'
  if (platform.includes('linux')) return 'linux'

  return 'windows' // fallback
}

// Show appropriate download button
const platform = detectPlatform()
document.querySelector(`.btn-${platform}`).classList.add('primary')
```

---

### **8. MÉTRICAS Y ANALYTICS**

#### **Track Downloads:**

```javascript
// En tu website
function trackDownload(platform) {
  gtag('event', 'download', {
    event_category: 'app',
    event_label: platform,
    value: 1,
  })
}
```

#### **App Usage Analytics:**

```javascript
// En la app Electron (opcional, con permiso usuario)
const { ipcRenderer } = require('electron')

// Track app launch
ipcRenderer.send('analytics-event', {
  event: 'app_launch',
  platform: process.platform,
  version: app.getVersion(),
})
```

---

### **9. MARKETING Y LANZAMIENTO**

#### **Pre-Launch Checklist:**

- [ ] Landing page lista
- [ ] GitHub repository público
- [ ] README con screenshots
- [ ] Iconos y branding
- [ ] Auto-updater funcionando
- [ ] Builds para todas las plataformas
- [ ] Code signing configurado

#### **Launch Strategy:**

1. **Product Hunt** - Submit for maximum exposure
2. **Reddit** - r/SideProject, r/productivity
3. **Twitter** - Tweet con GIFs/videos
4. **Hacker News** - "Show HN: Viny - Note-taking app"
5. **Dev.to** - Technical blog post
6. **YouTube** - Demo video

#### **Content Ideas:**

- "Building a desktop note app with Electron"
- "From idea to 1000 downloads in 30 days"
- Tutorial videos
- Feature comparison with competitors

---

### **10. ROADMAP POST-LAUNCH**

#### **Week 1-2: Bug Fixes**

- Monitor crash reports
- User feedback implementation
- Performance optimizations

#### **Month 1: First Major Update**

- Plugin system básico
- Cloud sync (opcional)
- User-requested features

#### **Month 3: Platform Expansion**

- Mobile companion app
- Web version
- Browser extensions

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Build para todas las plataformas
npm run dist:all

# 2. Solo macOS (desarrollo)
npm run dist:mac

# 3. Crear release tag
git tag v1.0.0 && git push origin v1.0.0

# 4. Verificar auto-updater
npm run start:prod
```

---

## 💡 **PRO TIPS**

1. **Empezar con GitHub Releases** - Es gratis y funcional
2. **Code signing es crucial** - Sin él, usuarios ven warnings
3. **Auto-updater desde día 1** - Evita problemas de distribución manual
4. **Analytics básicos** - Para entender uso real
5. **Community first** - Reddit/Discord para feedback temprano

**Con esta guía tendrás tu app lista para distribución profesional en ~2 días de setup.** 🚀
