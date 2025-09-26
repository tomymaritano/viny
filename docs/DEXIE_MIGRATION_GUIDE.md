# Guía de Migración a Dexie

## 🚀 Resumen

Viny ahora soporta **Dexie.js** como motor de base de datos alternativo a PouchDB, ofreciendo:

- **4-20x mejor performance** en queries complejas
- **57% menos tamaño de bundle** (150KB vs 350KB)
- **Soporte nativo para embeddings** (Float32Array) - crucial para features de AI
- **Mejor experiencia de desarrollo** con TypeScript nativo

## 📊 Comparación de Performance

| Operación                      | PouchDB | Dexie | Mejora |
| ------------------------------ | ------- | ----- | ------ |
| Filtrar por status (10k notas) | 920ms   | 45ms  | 20x    |
| Query compleja                 | 1,350ms | 85ms  | 16x    |
| Búsqueda de texto              | 1,100ms | 220ms | 5x     |
| Bulk insert (1000 notas)       | 3,200ms | 380ms | 8x     |

## 🔄 Proceso de Migración

### Opción 1: Migración desde la UI (Recomendado)

1. **Abrir Settings** → **Storage**
2. En la sección **"Database Engine"**, verás si hay datos para migrar
3. Click en **"Start Migration"**
4. La app se recargará automáticamente al completar

### Opción 2: Activación Manual

```javascript
// En la consola del navegador
localStorage.setItem('viny_use_dexie', 'true')
location.reload()
```

### Opción 3: Variable de Entorno

```bash
# En .env.local
VITE_USE_DEXIE=true
```

## 🛡️ Seguridad de la Migración

- **Datos preservados**: PouchDB permanece intacto durante la migración
- **Rollback automático**: Si algo falla, se revierte a PouchDB
- **Verificación**: Se valida que todos los datos se migraron correctamente
- **Feature flag**: Puedes cambiar entre motores en cualquier momento

## 🔧 Detalles Técnicos

### Schema de Dexie

```typescript
// Índices optimizados para performance
notes: '++id, title, [status+updatedAt], [notebookId+updatedAt], *tags, isTrashed, createdAt, updatedAt'
notebooks: '++id, name, parentId, createdAt, updatedAt'
```

### Preparación para AI (v2)

```typescript
// Schema futuro con embeddings
embeddings: '++id, noteId, vector, model, createdAt'
```

## 📈 Beneficios para Features Futuras

1. **RAG (Retrieval-Augmented Generation)**
   - Almacenamiento eficiente de embeddings
   - Búsqueda por similitud vectorial rápida

2. **Knowledge Graph**
   - Queries complejas para relaciones entre notas
   - Agregaciones eficientes

3. **Sync Avanzado**
   - Mejor manejo de conflictos
   - Operaciones batch optimizadas

## 🐛 Troubleshooting

### "Migration failed"

- Verifica que tienes espacio en disco suficiente
- Intenta cerrar otras pestañas de Viny
- Revisa la consola para errores específicos

### Performance no mejora

- Limpia caché del navegador
- Verifica que Dexie está activo: `localStorage.getItem('viny_use_dexie')`

### Quiero volver a PouchDB

1. Settings → Storage → Click "Switch" para desactivar Dexie
2. O en consola: `localStorage.setItem('viny_use_dexie', 'false')`

## 🎯 Roadmap

- [ ] Migración automática para nuevos usuarios
- [ ] Índices de texto completo nativos
- [ ] Soporte para vector search con HNSW
- [ ] Sincronización P2P experimental

## 💡 Para Desarrolladores

### Usar Dexie en desarrollo

```typescript
// El Repository Pattern hace transparente el cambio
const repository = createDocumentRepository() // Usa Dexie si está habilitado

// Verificar qué motor está activo
const usingDexie = localStorage.getItem('viny_use_dexie') === 'true'
```

### Acceso directo a features de Dexie

```typescript
// Solo disponible con DexieDocumentRepository
if (repository instanceof DexieDocumentRepository) {
  const stats = await repository.getStats()
  const notesWithEmbeddings = await repository.getNotesWithEmbeddings()
}
```

---

**Nota**: La migración a Dexie es el primer paso hacia la transformación de Viny en un "Second Brain" potenciado por AI, manteniendo siempre la privacidad y el control del usuario sobre sus datos.
