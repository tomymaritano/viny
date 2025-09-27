# 📚 Guía de Migración a Service Layer

## 🎯 Objetivo

Separar correctamente las responsabilidades entre:

- **Repository Pattern**: Solo acceso a datos (Dexie)
- **Service Layer**: Lógica de negocio
- **TanStack Query**: Estado de UI y caché

## 🏗️ Arquitectura Target

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│     UI      │────▶│  useQuery   │────▶│   Service    │────▶│ Repository │
│ Components  │     │   Hooks     │     │    Layer     │     │  (Dexie)   │
└─────────────┘     └─────────────┘     └──────────────┘     └────────────┘
```

## 📋 Estado Actual vs Deseado

### ❌ **Actual (Problemático)**

```typescript
// TanStack Query crea repositories directamente
export const useNotesQuery = () => {
  return useQuery({
    queryFn: async () => {
      const repository = createDocumentRepository() // ❌ Mezcla
      await repository.initialize()
      return repository.getNotes()
    },
  })
}
```

### ✅ **Deseado (Separación correcta)**

```typescript
// TanStack Query usa services
export const useActiveNotesQuery = () => {
  const noteService = useNoteService() // ✅ Inyectado

  return useQuery({
    queryFn: () => noteService.getActiveNotes(), // ✅ Lógica en service
  })
}
```

## 🚀 Plan de Migración Paso a Paso

### **Fase 1: Setup Inicial** ✅ COMPLETADO

1. **Crear interfaces de servicios**

   ```
   src/services/notes/INoteService.ts ✅
   ```

2. **Implementar servicios**

   ```
   src/services/notes/NoteService.ts ✅
   ```

3. **Crear Service Context**

   ```
   src/contexts/ServiceContext.tsx ✅
   ```

4. **Crear nuevos hooks con service**
   ```
   src/hooks/queries/useNotesServiceQuery.ts ✅
   ```

### **Fase 2: Migración Gradual** 🚧 EN PROGRESO

#### **Paso 1: Agregar ServiceProvider a la app**

```tsx
// main.tsx o App.tsx
import { ServiceProvider } from './contexts/ServiceContext'
;<QueryProvider>
  <ServiceProvider>
    {' '}
    {/* Nuevo */}
    <App />
  </ServiceProvider>
</QueryProvider>
```

#### **Paso 2: Migrar componentes uno por uno**

**Ejemplo de migración:**

```typescript
// ❌ ANTES - NotesListSimpleQuery.tsx
import { useNotesQuery } from '../../hooks/queries'

const { data: allNotes = [] } = useNotesQuery()

// ✅ DESPUÉS - NotesListSimpleQuery.tsx
import { useActiveNotesQuery } from '../../hooks/queries/useNotesServiceQuery'

const { data: allNotes = [] } = useActiveNotesQuery()
```

#### **Paso 3: Feature flags para migración segura**

```typescript
// config/featureFlags.ts
export const FEATURES = {
  USE_SERVICE_LAYER: process.env.NODE_ENV === 'development',
}

// En el componente
const notes = FEATURES.USE_SERVICE_LAYER
  ? useActiveNotesQuery()
  : useNotesQuery()
```

### **Fase 3: Cleanup** 📅 FUTURO

1. Remover hooks antiguos que acceden directamente al repository
2. Refactorizar repositories para solo tener CRUD básico
3. Mover toda la lógica de negocio a services
4. Actualizar tests

## 📊 Comparación de Patrones

### **Repository Directo (Actual)**

```typescript
// Hook actual
export const useNotesQuery = () => {
  return useQuery({
    queryFn: async () => {
      const repository = createDocumentRepository()
      await repository.initialize()
      const notes = await repository.getNotes()
      // Lógica mezclada aquí
      return notes.filter(n => !n.isTrashed)
    },
  })
}
```

### **Service Layer (Nuevo)**

```typescript
// Service - Lógica centralizada
class NoteService {
  async getActiveNotes() {
    const notes = await this.repository.getNotes()
    return notes.filter(n => !n.isTrashed) // Lógica en un solo lugar
  }
}

// Hook - Solo UI state
export const useActiveNotesQuery = () => {
  const noteService = useNoteService()
  return useQuery({
    queryFn: () => noteService.getActiveNotes(),
  })
}
```

## 🧪 Testing

### **Con Service Layer**

```typescript
// Fácil de testear
describe('NoteService', () => {
  it('should filter trashed notes', async () => {
    const mockRepo = {
      getNotes: jest.fn().mockResolvedValue([
        { id: '1', isTrashed: false },
        { id: '2', isTrashed: true },
      ]),
    }

    const service = new NoteService(mockRepo)
    const active = await service.getActiveNotes()

    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('1')
  })
})
```

## 🎯 Beneficios Finales

1. **Separación de Responsabilidades**
   - Repository: Solo Dexie/Storage
   - Service: Lógica de negocio
   - Query: Estado de UI

2. **Testing Mejorado**
   - Services testables sin IndexedDB
   - Mocks más simples
   - Tests más rápidos

3. **Mantenibilidad**
   - Lógica centralizada
   - Cambios en un solo lugar
   - Más fácil de entender

4. **Flexibilidad**
   - Cambiar de Dexie a otra DB es trivial
   - Agregar cache en service layer
   - Implementar patrones avanzados

## 📝 Checklist de Migración

- [ ] ServiceProvider agregado a la app
- [ ] NotesListSimpleQuery usando service
- [ ] useNoteActions usando service
- [ ] Sidebar usando service
- [ ] Settings usando service
- [ ] Tests actualizados
- [ ] Documentación actualizada
- [ ] Hooks antiguos marcados como deprecated
- [ ] Feature flags removidos
- [ ] Cleanup completo

## 🚨 Consideraciones Importantes

1. **No migrar todo de una vez** - Usar feature flags
2. **Mantener compatibilidad** - Los hooks antiguos siguen funcionando
3. **Testear cada migración** - Verificar que todo funciona
4. **Documentar cambios** - Actualizar CLAUDE.md

---

**Estado**: 🟡 En Progreso  
**Próximo paso**: Agregar ServiceProvider a main.tsx
