# Configuración de Certificado Apple Developer

## Resumen

Tu proyecto Viny ya está completamente preparado para usar certificados de Apple Developer. Solo necesitas agregar tu certificado específico y configurar las credenciales.

## Estado Actual ✅

**Ya configurado:**

- ✅ Electron Builder con code signing
- ✅ Entitlements file (`build/entitlements.mac.plist`)
- ✅ Notarización habilitada en `package.json`
- ✅ Archivo `.env` creado con plantilla
- ✅ Documentación completa en `docs/`

## Pasos para Cargar tu Certificado

### 1. Obtener el Certificado

1. **Descargar desde Apple Developer:**
   - Ve a [Apple Developer Account](https://developer.apple.com/account/certificates)
   - Descarga tu "Developer ID Application" certificate
   - Exporta como archivo `.p12` desde Keychain Access

### 2. Configurar Variables de Entorno

Edita el archivo `.env` con tus datos reales:

```bash
# Tu Apple ID
APPLE_ID=tu-email@developer.apple.com

# App-specific password (genera en https://appleid.apple.com/account/manage)
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Tu Team ID (encuentra en Apple Developer account)
APPLE_TEAM_ID=TU_TEAM_ID_REAL

# Nombre del certificado (exactamente como aparece en Keychain)
CSC_NAME=Developer ID Application: Tu Nombre (TU_TEAM_ID)

# Ruta al archivo .p12
CSC_LINK=./certificate.p12

# Password del certificado
CSC_KEY_PASSWORD=tu-password-del-certificado
```

### 3. Colocar el Certificado

```bash
# Copiar tu certificado a la raíz del proyecto
cp /path/to/tu-certificado.p12 ./certificate.p12
```

### 4. Probar el Signing

```bash
# Build con signing
npm run electron:build

# O para desarrollo
npm run electron:build:dev
```

## Estructura de Archivos

```
viny/
├── .env                           # ✅ Configurado
├── certificate.p12               # ❌ Necesitas agregarlo
├── package.json                  # ✅ Notarización habilitada
└── build/
    └── entitlements.mac.plist     # ✅ Configurado
```

## Verificación del Setup

### Comprobar Configuración

```bash
# Verificar variables de entorno
cat .env

# Verificar que el certificado existe
ls -la certificate.p12

# Verificar identidad del certificado
security find-identity -v -p codesigning
```

### Test de Signing

```bash
# Build de prueba
npm run electron:build

# Verificar la app firmada
codesign -dv --verbose=4 dist-electron/mac/Viny.app
```

## Solución de Problemas

### Error: "Code signing failed"

- Verifica que `CSC_NAME` coincida exactamente con el nombre en Keychain
- Asegúrate que el certificado no haya expirado
- Confirma que `CSC_KEY_PASSWORD` sea correcto

### Error: "Notarization failed"

- Verifica que `APPLE_ID` y `APPLE_ID_PASSWORD` sean correctos
- Asegúrate que el App-specific password esté vigente
- Confirma que `APPLE_TEAM_ID` sea correcto

### Error: "Certificate not found"

- Importa el certificado en Keychain Access
- Verifica que `CSC_LINK` apunte al archivo correcto
- Asegúrate que el certificado sea "Developer ID Application"

## Configuración para CI/CD

Para GitHub Actions, necesitarás:

1. **Convertir certificado a base64:**

```bash
base64 -i certificate.p12 -o certificate.base64
```

2. **Agregar secrets en GitHub:**

```
APPLE_ID
APPLE_ID_PASSWORD
APPLE_TEAM_ID
CSC_NAME
CSC_LINK (contenido del .base64)
CSC_KEY_PASSWORD
```

## Scripts Útiles

El proyecto incluye scripts que facilitan el proceso:

```bash
# Verificar setup de macOS
./scripts/fix-macos-app.sh

# Build optimizado
./build-optimized.sh

# Build con updater
./build-with-updater.sh
```

## Estado Final

Una vez configurado, tendrás:

- ✅ Apps firmadas automáticamente
- ✅ Notarización automática
- ✅ Compatible con macOS Gatekeeper
- ✅ Distribución sin warnings de seguridad
- ✅ Auto-updates funcionando

## Recursos Adicionales

- [Guía completa de certificados](./APPLE-CERTIFICATE-GUIDE.md)
- [Setup técnico detallado](./SIGNING-SETUP.md)
- [Integración con GitHub Actions](./GITHUB-ACTIONS-SIGNING.md)
