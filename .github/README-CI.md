# CI/CD Setup for Viny

Este documento explica la configuración de CI/CD para el proyecto Viny.

## 🔄 Workflows Configurados

### 1. CI Pipeline (`.github/workflows/ci.yml`)

Se ejecuta en cada push y PR a las ramas `main` y `develop`.

**Jobs incluidos:**

- **Test & Quality**: Linting, formateo, tests y coverage
- **Build Verification**: Verifica que la aplicación web compile
- **Electron Build Test**: Testa builds de Electron en múltiples OS
- **Security Check**: Auditoría de seguridad de dependencias
- **TypeScript Check**: Verificación de tipos

### 2. Development Checks (`.github/workflows/dev-checks.yml`)

Checks más rápidos para desarrollo diario en branches que no sean `main`.

**Features:**

- Linting y formateo
- Tests rápidos
- Build verification
- Security checks básicos

### 3. Release Pipeline (`.github/workflows/release.yml`)

Se ejecuta automáticamente cuando se crea un tag de versión (`v*.*.*`).

**Características:**

- Builds para macOS (firmado), Windows y Linux
- Notarización automática para macOS
- Upload de artifacts a GitHub Releases
- Tests completos antes del release

## 🪝 Pre-commit Hooks

Configurado con Husky para ejecutar automáticamente antes de cada commit:

```bash
# Instalado en .husky/pre-commit
- lint-staged (formateo automático)
- ESLint
- Tests completos
```

## 📋 Scripts NPM Disponibles

```bash
# Testing
npm test              # Tests en modo watch
npm run test:run      # Tests una sola vez
npm run test:coverage # Tests con coverage
npm run test:ui       # UI interactiva de tests

# Quality checks
npm run lint          # ESLint
npm run lint:fix      # ESLint con auto-fix
npm run format        # Prettier auto-format
npm run format:check  # Verificar formateo

# Building
npm run build                # Web build
npm run build:electron       # Electron build (firmado)
npm run build:electron:test  # Electron build (sin firmar, para CI)

# CI/CD
npm run verify:ci     # Verificar setup de CI/CD
```

## 🔧 Configuración de Secrets

Para que el release pipeline funcione completamente, necesitas configurar estos secrets en GitHub:

### Para firmado de macOS:

```
CSC_NAME              # Nombre del certificado Developer ID
CSC_LINK              # Base64 del certificado .p12
CSC_KEY_PASSWORD      # Password del certificado
APPLE_ID              # Apple ID para notarización
APPLE_APP_SPECIFIC_PASSWORD  # App-specific password
APPLE_TEAM_ID         # Team ID de Apple Developer
```

### Para auto-updates:

```
GH_TOKEN              # GitHub token para acceso al repo
```

## 🚀 Flujo de Trabajo

### Desarrollo Diario:

1. Crear branch desde `develop`
2. Hacer cambios
3. Pre-commit hooks se ejecutan automáticamente
4. Push activa dev-checks workflow
5. Crear PR hacia `develop`

### Release:

1. Merge a `main`
2. Crear tag: `git tag v1.4.0 && git push origin v1.4.0`
3. Release pipeline se ejecuta automáticamente
4. Binarios se publican en GitHub Releases

## 📊 Coverage y Quality

- **Coverage mínimo**: Configurado en vitest.config.js
- **Linting**: ESLint con rules específicas
- **Formateo**: Prettier con configuración del proyecto
- **Security**: npm audit en cada build

## 🔍 Verificación

Ejecuta esto para verificar que todo esté configurado correctamente:

```bash
npm run verify:ci
```

## 🐛 Troubleshooting

### Tests fallan en CI pero pasan localmente:

- Verificar Node version (debe ser 20)
- Limpiar cache: `npm ci` en lugar de `npm install`

### Electron build falla:

- Para CI: usar `build:electron:test` (sin firmar)
- Para release: verificar que los secrets estén configurados

### Pre-commit hooks no funcionan:

```bash
npm run prepare  # Re-instalar husky
chmod +x .husky/pre-commit  # Dar permisos
```

---

✅ **Status actual**: Todo configurado y funcionando correctamente!
