# 🍎 Guía Completa: Cómo Obtener el Certificado de Apple para Firmar Apps

## 📝 Requisitos Previos

1. **Mac con macOS** (necesario para crear los certificados)
2. **Apple ID** (gratuito)
3. **$99 USD** para la membresía anual
4. **Xcode** instalado (gratuito desde App Store)

## 🚀 Paso 1: Inscribirse en Apple Developer Program

### 1.1 Crear o usar tu Apple ID

- Ve a https://appleid.apple.com
- Si no tienes uno, créalo (es gratis)
- Activa la autenticación de dos factores (requerido)

### 1.2 Inscribirse en el programa

1. Ve a https://developer.apple.com/programs/
2. Click en **"Enroll"**
3. Selecciona **"Continue enrollment on the web"**
4. Elige el tipo de cuenta:
   - **Individual** ($99/año) - Para desarrolladores independientes
   - **Organization** ($99/año) - Requiere DUNS number de la empresa

### 1.3 Completar el pago

- Paga los $99 USD con tarjeta de crédito
- Espera el email de confirmación (usualmente inmediato para cuentas individuales)

## 🔐 Paso 2: Crear los Certificados

### 2.1 Acceder a tu cuenta

1. Ve a https://developer.apple.com/account
2. Inicia sesión con tu Apple ID
3. Ve a **"Certificates, Identifiers & Profiles"**

### 2.2 Crear un Certificate Signing Request (CSR)

1. Abre **Keychain Access** en tu Mac (Aplicaciones > Utilidades)
2. Menú: **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
3. Llena los campos:
   - **Email**: tu email de Apple ID
   - **Common Name**: tu nombre o el de tu empresa
   - **CA Email**: déjalo vacío
   - Selecciona **"Saved to disk"**
4. Guarda el archivo `.certSigningRequest`

### 2.3 Crear el Developer ID Certificate

1. En el portal de desarrollador, click en **"Certificates"** > **"+"**
2. Selecciona **"Developer ID Application"** (para apps fuera del Mac App Store)
3. Click **"Continue"**
4. Sube el archivo CSR que creaste
5. Descarga el certificado `.cer`
6. Haz doble click en el certificado para instalarlo en Keychain

### 2.4 Exportar el certificado para CI/CD

1. Abre **Keychain Access**
2. En **"My Certificates"**, encuentra tu **"Developer ID Application: Tu Nombre"**
3. Click derecho > **"Export"**
4. Guárdalo como `.p12`
5. Crea una contraseña fuerte (la necesitarás para GitHub Actions)

## 🔧 Paso 3: Configurar tu Proyecto

### 3.1 Variables de entorno locales

Crea un archivo `.env.local` (no lo subas a git):

```bash
APPLE_ID="tu-email@example.com"
APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"  # App-specific password
CSC_LINK="/path/to/certificate.p12"
CSC_KEY_PASSWORD="tu-contraseña-del-p12"
```

### 3.2 App-specific password

1. Ve a https://appleid.apple.com
2. En **"Security"**, genera un **"App-specific password"**
3. Guárdalo para `APPLE_ID_PASSWORD`

### 3.3 Actualizar package.json

```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "notarize": {
        "appBundleId": "com.viny.app",
        "appleId": "$(APPLE_ID)",
        "appleIdPassword": "$(APPLE_ID_PASSWORD)",
        "ascProvider": "YOUR_TEAM_ID"
      }
    }
  }
}
```

## 🤖 Paso 4: Configurar GitHub Actions

### 4.1 Convertir certificado a Base64

```bash
base64 -i certificate.p12 -o certificate-base64.txt
```

### 4.2 Agregar secrets en GitHub

Ve a tu repositorio > Settings > Secrets and variables > Actions:

1. **`APPLE_ID`**: tu email de Apple ID
2. **`APPLE_ID_PASSWORD`**: el app-specific password
3. **`CSC_LINK_BASE64`**: el contenido de certificate-base64.txt
4. **`CSC_KEY_PASSWORD`**: la contraseña del certificado .p12
5. **`APPLE_TEAM_ID`**: lo encuentras en https://developer.apple.com/account (click en Membership)

### 4.3 Actualizar workflow

```yaml
- name: Build Electron app
  run: npm run build:electron
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
    CSC_LINK: ${{ secrets.CSC_LINK_BASE64 }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

## ⚠️ Problemas Comunes y Soluciones

### "Certificate not trusted"

- Asegúrate de que el certificado esté en "My Certificates" en Keychain
- Verifica que sea "Developer ID Application", no otro tipo

### "Failed to notarize"

- El proceso puede tardar 5-30 minutos
- Revisa que el app-specific password sea correcto
- Verifica que el Apple ID tenga 2FA activado

### "Team ID not found"

- El Team ID está en: https://developer.apple.com/account > Membership
- Es un código de 10 caracteres como "ABCDE12345"

## 💰 Alternativas si $99/año es mucho

### 1. **Firma Ad-hoc temporal**

Mientras consigues el certificado, puedes firmar localmente:

```bash
# Firma la app solo para tu Mac
codesign --force --deep --sign - /Applications/Viny.app
```

### 2. **Buscar sponsors**

- Agrega un botón de "Sponsor" en GitHub
- Menciona que necesitas fondos para el certificado
- Ofrece beneficios a sponsors (como acceso anticipado)

### 3. **Certificado compartido**

- Únete a una cooperativa de desarrolladores
- Algunos servicios permiten compartir certificados
- Cuidado con la seguridad al compartir

## 📅 Tiempo estimado total

1. **Inscripción**: 1-2 días (individual) o 1-2 semanas (empresa)
2. **Crear certificados**: 30 minutos
3. **Configurar proyecto**: 1-2 horas
4. **Primera build firmada**: 30 minutos
5. **Notarización**: 15-30 minutos por build

## 🎯 Próximos pasos

Una vez que tengas el certificado:

1. Actualiza el proyecto con la configuración
2. Haz una release de prueba (v1.2.3-beta)
3. Verifica que funcione sin el warning de seguridad
4. Celebra! 🎉

---

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
