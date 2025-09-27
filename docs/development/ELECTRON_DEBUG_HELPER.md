# Electron Debug Helper

## Problemas Identificados en Electron

### 1. **Doble Almacenamiento**

El sistema V2 está tratando de usar tanto IndexedDB (Dexie) como el sistema de archivos de Electron, lo que puede causar conflictos.

### 2. **Sincronización de Datos**

Los datos pueden estar desincronizados entre:

- IndexedDB (usado por V2)
- Sistema de archivos de Electron
- localStorage

## Comandos de Debug para Electron

Ejecuta estos comandos en la consola de DevTools de Electron:

### 1. Verificar si estás en Electron

```javascript
console.log('En Electron:', window.electronAPI?.isElectron)
console.log('API disponible:', Object.keys(window.electronAPI || {}))
```

### 2. Verificar datos en el sistema de archivos

```javascript
// Ver notas desde el archivo
const fileNotes = await window.electronAPI.storage.loadAllNotes()
console.log('Notas en archivos:', fileNotes)

// Ver notebooks desde el archivo
const fileNotebooks = await window.electronAPI.storage.loadNotebooks()
console.log('Notebooks en archivos:', fileNotebooks)

// Ver configuración
const settings = await window.electronAPI.storage.loadSettings()
console.log('Configuración:', settings)
```

### 3. Verificar datos en IndexedDB (Dexie)

```javascript
// Abrir base de datos Dexie
const db = await window.Dexie.open('VinyDatabase')

// Ver notas en IndexedDB
const dexieNotes = await db.table('notes').toArray()
console.log('Notas en IndexedDB:', dexieNotes)

// Ver notebooks en IndexedDB
const dexieNotebooks = await db.table('notebooks').toArray()
console.log('Notebooks en IndexedDB:', dexieNotebooks)
```

### 4. Comparar datos entre ambos sistemas

```javascript
// Comparar conteos
const fileNotes = await window.electronAPI.storage.loadAllNotes()
const db = await window.Dexie.open('VinyDatabase')
const dexieNotes = await db.table('notes').toArray()

console.log('Notas en archivos:', fileNotes.length)
console.log('Notas en IndexedDB:', dexieNotes.length)
console.log('¿Son iguales?', fileNotes.length === dexieNotes.length)
```

### 5. Forzar sincronización de datos

```javascript
// Importar datos del archivo a IndexedDB
async function syncFromFileToIndexedDB() {
  const fileNotes = await window.electronAPI.storage.loadAllNotes()
  const fileNotebooks = await window.electronAPI.storage.loadNotebooks()

  const db = await window.Dexie.open('VinyDatabase')

  // Limpiar y reimportar
  await db.table('notes').clear()
  await db.table('notebooks').clear()

  if (fileNotes.length > 0) {
    await db.table('notes').bulkAdd(fileNotes)
  }

  if (fileNotebooks.length > 0) {
    await db.table('notebooks').bulkAdd(fileNotebooks)
  }

  // Forzar recarga de queries
  window.__queryClient?.invalidateQueries()

  console.log('Sincronización completa')
}

// Ejecutar sincronización
await syncFromFileToIndexedDB()
```

### 6. Crear datos de prueba directamente

```javascript
// Crear un notebook de prueba
await window.electronAPI.storage.saveNotebooks([
  {
    id: 'test-notebook',
    name: 'Test Notebook Electron',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
])

// Crear una nota de prueba
await window.electronAPI.storage.saveNote({
  id: 'test-note-electron',
  title: 'Test Note en Electron',
  content: '# Contenido de prueba\n\nEsta nota fue creada en Electron.',
  notebookId: 'test-notebook',
  tags: ['test', 'electron'],
  status: 'draft',
  isPinned: false,
  isTrashed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Sincronizar a IndexedDB
await syncFromFileToIndexedDB()
```

## Solución Temporal

Si tienes problemas con V2 en Electron, puedes volver a V1 temporalmente:

```javascript
// Cambiar a V1
localStorage.setItem('feature_useCleanArchitecture', 'false')
window.location.reload()
```

## Solución Permanente

El problema principal es que V2 necesita ser ajustado para Electron. Los datos deben:

1. Guardarse primero en el sistema de archivos (para persistencia)
2. Luego sincronizarse con IndexedDB (para performance)
3. Las queries de TanStack deben invalidarse después de cada sincronización

## Verificar el menú de tres puntos

```javascript
// Ver si el menú está en el DOM
document.querySelectorAll('button[title="More options"]')

// Simular click programático
const menuButton = document.querySelector('button[title="More options"]')
if (menuButton) {
  menuButton.click()

  // Verificar si el menú apareció
  setTimeout(() => {
    const menu = document.querySelector('[role="menu"]')
    console.log('Menú visible:', !!menu)
    if (menu) {
      console.log('Opciones del menú:', menu.textContent)
    }
  }, 100)
}
```

## Path de datos en Electron

Los datos se guardan en:

- **macOS**: `~/Library/Application Support/viny/viny-data/`
- **Windows**: `%APPDATA%/viny/viny-data/`
- **Linux**: `~/.config/viny/viny-data/`

Puedes verificar los archivos directamente en esa carpeta.
