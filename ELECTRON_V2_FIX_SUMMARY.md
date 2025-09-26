# Resumen de Fixes para Electron + V2

**Fecha:** 23 de Enero, 2025

## 🔧 Problemas Identificados en Electron

### 1. **Doble Sistema de Almacenamiento**

- Electron usa archivos en el sistema
- V2 usa IndexedDB (Dexie)
- Los datos pueden estar desincronizados

### 2. **Falta de Inicialización de Datos**

- No se creaban notebooks por defecto
- La sincronización entre archivos e IndexedDB no funcionaba correctamente

## ✅ Soluciones Implementadas

### 1. **Auto-selección de Primera Nota**

```typescript
// En AppContainerV2.tsx
useEffect(() => {
  if (!selectedNoteId && filteredNotes.length > 0 && !notesLoading) {
    setSelectedNoteId(filteredNotes[0].id)
  }
}, [selectedNoteId, filteredNotes, notesLoading, setSelectedNoteId])
```

### 2. **Creación de Notebook por Defecto**

- En `NotebookServiceV2`: Se crea automáticamente "My Notes" si no hay notebooks
- En `DexieDocumentRepository`: Se sincroniza con el almacenamiento de Electron

### 3. **Sincronización Mejorada**

```typescript
private async syncWithElectronStorage(): Promise<void> {
  // Importa notebooks desde archivos si la DB está vacía
  // Importa notas desde archivos si la DB está vacía
  // Mantiene ambos sistemas sincronizados
}
```

## 🚀 Pasos para Verificar

### 1. **Reinicia la Aplicación Electron**

Cierra completamente y vuelve a abrir

### 2. **Verifica en DevTools** (Cmd+Option+I)

```javascript
// Ver si estás en Electron
console.log('En Electron:', window.electronAPI?.isElectron)

// Ver notebooks en archivos
const fileNotebooks = await window.electronAPI.storage.loadNotebooks()
console.log('Notebooks:', fileNotebooks)

// Ver notebooks en IndexedDB
const db = await window.Dexie.open('VinyDatabase')
const notebooks = await db.table('notebooks').toArray()
console.log('Notebooks en DB:', notebooks)
```

### 3. **Si el Menú de 3 Puntos No Funciona**

```javascript
// Verificar si el botón existe
const menuButton = document.querySelector('button[title="More options"]')
console.log('Botón encontrado:', !!menuButton)

// Click manual
if (menuButton) menuButton.click()
```

## 📁 Ubicación de Datos en macOS

Los archivos se guardan en:

```
~/Library/Application Support/viny/viny-data/
```

Puedes verificar:

- `notebooks.json`
- `notes/` (carpeta con archivos .json de cada nota)
- `settings.json`

## 🔄 Si Sigues con Problemas

### Opción 1: Forzar Sincronización

```javascript
async function forceSyncElectron() {
  // Cargar datos desde archivos
  const fileNotes = await window.electronAPI.storage.loadAllNotes()
  const fileNotebooks = await window.electronAPI.storage.loadNotebooks()

  // Abrir DB
  const db = await window.Dexie.open('VinyDatabase')

  // Limpiar DB
  await db.table('notes').clear()
  await db.table('notebooks').clear()

  // Reimportar
  if (fileNotebooks.length > 0) {
    await db.table('notebooks').bulkAdd(fileNotebooks)
  } else {
    // Crear notebook por defecto
    await db.table('notebooks').add({
      id: 'default',
      name: 'My Notes',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  if (fileNotes.length > 0) {
    await db.table('notes').bulkAdd(fileNotes)
  }

  // Recargar
  window.location.reload()
}

await forceSyncElectron()
```

### Opción 2: Volver a V1 Temporalmente

```javascript
localStorage.setItem('feature_useCleanArchitecture', 'false')
window.location.reload()
```

## 📝 Nota Importante

El sistema V2 está diseñado principalmente para la web. En Electron necesita ajustes adicionales para mantener la sincronización entre:

1. Sistema de archivos (persistencia)
2. IndexedDB (performance)
3. TanStack Query (cache)

Los fixes implementados deberían resolver los problemas principales, pero si persisten, considera usar V1 en Electron por ahora.
