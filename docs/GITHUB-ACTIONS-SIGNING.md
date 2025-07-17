# 🔧 Configuración de GitHub Actions para Firma de Código

Esta guía te ayuda a configurar GitHub Actions para firmar automáticamente tu app de macOS.

## 📋 Prerrequisitos

- [x] Certificado de Apple Developer Program (ver [APPLE-CERTIFICATE-GUIDE.md](./APPLE-CERTIFICATE-GUIDE.md))
- [x] App-specific password de Apple ID
- [x] Team ID de Apple Developer

## 🔐 Configuración de Secrets

### 1. Convertir certificado a Base64

En tu Mac, ejecuta:

```bash
# Navega a donde está tu certificado .p12
base64 -i Developer_ID_Application.p12 -o certificate-base64.txt

# Copia el contenido del archivo
cat certificate-base64.txt | pbcopy
```

### 2. Agregar Secrets en GitHub

Ve a tu repositorio > **Settings** > **Secrets and variables** > **Actions**

Agrega estos secrets:

| Secret Name         | Descripción                     | Ejemplo                     |
| ------------------- | ------------------------------- | --------------------------- |
| `APPLE_ID`          | Tu Apple ID email               | `tu-email@example.com`      |
| `APPLE_ID_PASSWORD` | App-specific password           | `xxxx-xxxx-xxxx-xxxx`       |
| `CSC_LINK_BASE64`   | Certificado en Base64           | (output del comando base64) |
| `CSC_KEY_PASSWORD`  | Contraseña del certificado .p12 | `tu-contraseña-segura`      |
| `APPLE_TEAM_ID`     | Team ID de Apple Developer      | `ABCDE12345`                |

### 3. Encontrar tu Team ID

1. Ve a https://developer.apple.com/account
2. Click en **Membership** en el sidebar
3. Tu Team ID está listado ahí (10 caracteres)

## ⚙️ Actualizar Workflow de GitHub Actions

### 1. Actualizar `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      # Preparar certificado para macOS
      - name: Prepare certificate (macOS only)
        if: matrix.os == 'macos-latest'
        run: |
          echo "${{ secrets.CSC_LINK_BASE64 }}" | base64 --decode > certificate.p12
          echo "CSC_LINK=$(pwd)/certificate.p12" >> $GITHUB_ENV

      - name: Build Electron app
        run: npm run build:electron
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Certificados de Apple (solo para macOS)
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          # Habilitar firma solo si tenemos certificados
          CSC_IDENTITY_AUTO_DISCOVERY: ${{ matrix.os == 'macos-latest' && secrets.APPLE_ID != '' }}

      # Limpiar certificado después del build
      - name: Cleanup certificate (macOS only)
        if: matrix.os == 'macos-latest'
        run: rm -f certificate.p12
```

### 2. Actualizar package.json

```json
{
  "build": {
    "appId": "com.viny.app",
    "productName": "Viny",
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "public/icon-512.png",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "notarize": {
        "appBundleId": "com.viny.app"
      },
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    }
  }
}
```

### 3. Actualizar entitlements

Archivo `build/entitlements.mac.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.files.downloads.read-write</key>
    <true/>
  </dict>
</plist>
```

## 🧪 Probar la Configuración

### 1. Release de prueba

Crea un tag de prueba:

```bash
git tag v1.2.3-beta
git push origin v1.2.3-beta
```

### 2. Verificar el workflow

1. Ve a **Actions** en tu repositorio
2. Verifica que el workflow se ejecute sin errores
3. El build de macOS debería tardar ~15-30 minutos (incluye notarización)

### 3. Verificar la firma

Cuando el release esté listo:

```bash
# Descarga y verifica la firma
codesign -dv --verbose=4 /Applications/Viny.app
spctl -a -vvv /Applications/Viny.app
```

## 🐛 Troubleshooting

### "Certificate not found"

- Verifica que el certificado esté en Base64 correcto
- Asegúrate de que sea "Developer ID Application"

### "Notarization failed"

- Revisa el Apple ID y password
- Verifica que el Team ID sea correcto
- La notarización puede tardar hasta 30 minutos

### "Invalid entitlements"

- Asegúrate de que el archivo entitlements.mac.plist esté bien formateado
- Verifica que hardenedRuntime sea true

### Logs útiles

```bash
# Ver logs de notarización
xcrun notarytool log --apple-id $APPLE_ID --password $APPLE_ID_PASSWORD --team-id $APPLE_TEAM_ID <UUID>

# Verificar certificados instalados
security find-identity -v -p codesigning
```

## 📈 Mejoras Futuras

1. **Firma incremental**: Solo firmar si hay cambios
2. **Cache de certificados**: Evitar descargar en cada build
3. **Múltiples certificados**: Diferentes entornos (dev, staging, prod)
4. **Rotación automática**: Renovar certificados automáticamente

---

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
