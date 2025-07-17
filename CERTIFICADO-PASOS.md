# Pasos para Completar Configuración del Certificado

## Estado Actual ✅

- ✅ CSR creado en el proyecto
- ✅ Apple Worldwide Developer Relations CA instalada
- ✅ Configuración de Electron Builder lista
- ✅ Variables de entorno preparadas
- ❌ **Falta: Tu certificado Developer ID Application específico**

## Pasos Faltantes

### 1. Descargar el Certificado Final

1. Ve a [Apple Developer Certificates](https://developer.apple.com/account/certificates)
2. Busca tu certificado **"Developer ID Application"**
3. Click en "Download"
4. Guarda el archivo `.cer`

### 2. Instalar en Keychain

```bash
# Método 1: Doble click en el archivo
open ~/Downloads/certificado-developer-id.cer

# Método 2: Comando directo
security import ~/Downloads/certificado-developer-id.cer -k ~/Library/Keychains/login.keychain
```

### 3. Verificar Instalación

```bash
# Debería mostrar tu certificado
security find-identity -v -p codesigning
```

### 4. Exportar como .p12

1. Abrir **Keychain Access**
2. Ir a categoría **"My Certificates"**
3. Buscar **"Developer ID Application: Tu Nombre (TEAM_ID)"**
4. Click derecho → **"Export"**
5. Formato: **"Personal Information Exchange (.p12)"**
6. Guardar como: `certificate.p12` en la raíz del proyecto
7. Establecer un password

### 5. Actualizar .env

```bash
# Editar el archivo .env con tus datos reales:
APPLE_ID=tu-apple-id@ejemplo.com
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=TU_TEAM_ID_REAL
CSC_NAME=Developer ID Application: Tu Nombre (TU_TEAM_ID)
CSC_LINK=./certificate.p12
CSC_KEY_PASSWORD=password-que-elegiste
```

### 6. Probar Build

```bash
npm run build:electron
```

## Verificaciones Útiles

### Ver certificados instalados:

```bash
security find-identity -v -p codesigning
```

### Ver detalles del certificado:

```bash
security find-certificate -c "Developer ID Application" -p | openssl x509 -text
```

### Verificar app firmada:

```bash
codesign -dv --verbose=4 dist-electron/mac/Viny.app
```

## Si encuentras problemas:

1. **"No identity found"** → El certificado no está en Keychain
2. **"Certificate expired"** → Renovar en Apple Developer
3. **"Wrong password"** → Verificar CSC_KEY_PASSWORD en .env
4. **"Team ID mismatch"** → Verificar APPLE_TEAM_ID en .env

## Archivos a tener:

```
viny/
├── .env                    # ✅ Creado
├── certificate.p12        # ❌ Falta crear
├── CertificateSigningRequest.certSigningRequest  # ✅ Existe
└── package.json           # ✅ Configurado
```

Una vez completados estos pasos, tu app se firmará automáticamente en cada build.
