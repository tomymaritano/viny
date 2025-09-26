# 🏗️ Clean Architecture Guide - Viny v1.5.0

## 🎯 Resumen Ejecutivo

Este documento describe la arquitectura de 4 capas implementada en Viny para separar correctamente las responsabilidades y facilitar el mantenimiento, testing y escalabilidad.

## 📊 Arquitectura de 4 Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                      UI Components                               │
│         (React components - presentation only)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                    TanStack Query                                │
│     (Cache, fetching, optimistic updates, reactivity)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                     Service Layer                                │
│        (Business logic, orchestration, validation)               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                  Repository Pattern                              │
│            (Pure CRUD operations - Dexie.js)                     │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Responsabilidades por Capa

### 1️⃣ **Repository Pattern (Data Access)**

**Ubicación:** `src/repositories/`

- ✅ **Solo operaciones CRUD puras**
- ✅ Acceso directo a Dexie.js
- ✅ Sin lógica de negocio
- ✅ Sin filtrado de datos (ej: no filtrar `isTrashed`)
- ✅ Transacciones de base de datos
- ✅ Backup/restore

**Ejemplo:**

```typescript
// ✅ CORRECTO - Solo CRUD
interface INoteRepository {
  findAll(options?: QueryOptions): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  create(note: Note): Promise<Note>
  update(id: string, data: Partial<Note>): Promise<Note>
  delete(id: string): Promise<void>
}

// ❌ INCORRECTO - Lógica de negocio
interface BadRepository {
  getActiveNotes(): Promise<Note[]> // ❌ Filtrado
  searchNotes(query: string): Promise<Note[]> // ❌ Búsqueda compleja
}
```

### 2️⃣ **Service Layer (Business Logic)**

**Ubicación:** `src/services/`

- ✅ **Toda la lógica de negocio**
- ✅ Validación de datos
- ✅ Orquestación de operaciones complejas
- ✅ Filtrado y transformación de datos
- ✅ Gestión de reglas de negocio
- ✅ Integración con servicios externos

**Ejemplo:**

```typescript
// ✅ CORRECTO - Lógica en service
class NoteService {
  async getActiveNotes(): Promise<Note[]> {
    const notes = await this.repository.findAll()
    return notes.filter(n => !n.isTrashed) // Lógica aquí
  }

  async createNote(data: CreateNoteDto): Promise<Note> {
    // Validación
    if (!data.title?.trim()) {
      throw new Error('Title is required')
    }

    // Transformación
    const note: Note = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: data.status || 'active',
    }

    // Persistencia
    return this.repository.create(note)
  }
}
```

### 3️⃣ **TanStack Query (State Management)**

**Ubicación:** `src/hooks/queries/`

- ✅ **Cache de datos**
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Sincronización con servidor
- ✅ Estado de loading/error
- ✅ Invalidación de queries

**Ejemplo:**

```typescript
// ✅ CORRECTO - Query hook usando service
export const useActiveNotesQuery = () => {
  const noteService = useNoteService()

  return useQuery({
    queryKey: ['notes', 'active'],
    queryFn: () => noteService.getActiveNotes(),
    staleTime: 5 * 60 * 1000,
  })
}

// Mutation con optimistic update
export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient()
  const noteService = useNoteService()

  return useMutation({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['notes'])
      const previous = queryClient.getQueryData(['notes'])

      // Optimistic update
      queryClient.setQueryData(['notes'], old =>
        old.map(note => (note.id === id ? { ...note, ...data } : note))
      )

      return { previous }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['notes'], context.previous)
    },
  })
}
```

### 4️⃣ **UI Components (Presentation)**

**Ubicación:** `src/components/`

- ✅ **Solo presentación**
- ✅ Usar hooks de TanStack Query
- ✅ Manejar interacciones de usuario
- ✅ Sin lógica de negocio
- ✅ Sin acceso directo a repository

**Ejemplo:**

```typescript
// ✅ CORRECTO - Componente usando query hooks
const NotesList = () => {
  const { data: notes, isLoading } = useActiveNotesQuery()
  const updateNote = useUpdateNoteMutation()

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {notes?.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          onUpdate={(data) => updateNote.mutate({ id: note.id, data })}
        />
      ))}
    </div>
  )
}
```

## 🚀 Migración Gradual

### **Feature Flags**

```typescript
// src/config/featureFlags.ts
export const featureFlags = {
  useCleanArchitecture: false, // Activar nueva arquitectura
  useServiceLayer: true, // Usar service layer
}
```

### **Activar Nueva Arquitectura**

```bash
# En desarrollo
localStorage.setItem('feature_useCleanArchitecture', 'true')

# O via variable de entorno
VITE_FEATURE_USECLEANARCHITECTURE=true npm run dev
```

## 📝 Guía de Implementación

### **1. Crear Repository CRUD**

```typescript
// src/repositories/dexie/DexieCrudRepository.ts
export class DexieCrudRepository implements IRepository {
  notes: INoteRepository
  notebooks: INotebookRepository

  async initialize(): Promise<void> {
    await this.db.open()
  }
}
```

### **2. Implementar Service**

```typescript
// src/services/notes/NoteServiceV2.ts
export class NoteServiceV2 implements INoteService {
  constructor(private repository: IRepository) {}

  async getActiveNotes(): Promise<Note[]> {
    const notes = await this.repository.notes.findMany({ isTrashed: false })
    return notes
  }
}
```

### **3. Crear Query Hooks**

```typescript
// src/hooks/queries/useNotesServiceQueryV2.ts
export const useActiveNotesQueryV2 = () => {
  const noteService = useNoteService()

  return useQuery({
    queryKey: ['notes', 'active'],
    queryFn: () => noteService.getActiveNotes(),
  })
}
```

### **4. Actualizar Componentes**

```typescript
// Antes
const { notes, forceRefresh } = useNotesListLogic()

// Después
const { data: notes } = useActiveNotesQueryV2()
```

## 🧪 Testing

### **Repository Tests**

```typescript
describe('DexieCrudRepository', () => {
  it('should perform CRUD operations', async () => {
    const repo = new DexieCrudRepository()
    await repo.initialize()

    const note = await repo.notes.create({
      title: 'Test',
      content: 'Content',
    })

    expect(note.id).toBeDefined()
  })
})
```

### **Service Tests**

```typescript
describe('NoteService', () => {
  it('should filter active notes', async () => {
    const mockRepo = {
      notes: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', isTrashed: false },
          { id: '2', isTrashed: true },
        ]),
      },
    }

    const service = new NoteServiceV2(mockRepo)
    const active = await service.getActiveNotes()

    expect(active).toHaveLength(1)
    expect(mockRepo.notes.findMany).toHaveBeenCalledWith({ isTrashed: false })
  })
})
```

## ✅ Beneficios

1. **Separación de Responsabilidades**
   - Cada capa tiene un propósito claro
   - Fácil de entender y mantener

2. **Testabilidad**
   - Services testables sin base de datos
   - Mocks simples y predecibles

3. **Flexibilidad**
   - Cambiar de Dexie a otra DB es trivial
   - Agregar nuevas features sin tocar capas inferiores

4. **Performance**
   - TanStack Query maneja cache eficientemente
   - Repository optimizado para Dexie

5. **Developer Experience**
   - Código más limpio y organizado
   - Errores más fáciles de debuggear

## 🚨 Antipatrones a Evitar

### ❌ **No mezclar responsabilidades**

```typescript
// ❌ MAL - Repository con lógica
class BadRepository {
  async getActiveNotes() {
    const notes = await this.db.notes.toArray()
    return notes.filter(n => !n.isTrashed) // Lógica en repo
  }
}

// ✅ BIEN - Repository solo CRUD
class GoodRepository {
  async findAll() {
    return this.db.notes.toArray()
  }
}
```

### ❌ **No acceder a repository desde UI**

```typescript
// ❌ MAL - Componente accede a repository
const BadComponent = () => {
  const handleClick = async () => {
    const repo = new Repository()
    await repo.saveNote(note) // Acceso directo
  }
}

// ✅ BIEN - Componente usa mutation
const GoodComponent = () => {
  const saveNote = useSaveNoteMutation()

  const handleClick = () => {
    saveNote.mutate(note)
  }
}
```

### ❌ **No duplicar lógica**

```typescript
// ❌ MAL - Lógica duplicada
const Component1 = () => {
  const active = notes.filter(n => !n.isTrashed)
}

const Component2 = () => {
  const active = notes.filter(n => !n.isTrashed) // Duplicado
}

// ✅ BIEN - Lógica centralizada en service
const service = {
  getActiveNotes: () => notes.filter(n => !n.isTrashed),
}
```

## 📊 Métricas de Éxito

- ✅ **0 lógica de negocio en repositories**
- ✅ **100% de queries usando TanStack Query**
- ✅ **Services con 90%+ test coverage**
- ✅ **Componentes sin acceso directo a datos**
- ✅ **Zustand solo para UI state**

## 🔄 Estado de Migración

### ✅ **Completado**

- Repository CRUD puro (`DexieCrudRepository`)
- Service Layer completo (`NoteServiceV2`)
- TanStack Query hooks V2
- ServiceProvider con DI
- Feature flags para migración gradual

### 🚧 **En Progreso**

- Migración de componentes a V2 hooks
- Limpieza de Zustand store

### 📅 **Pendiente**

- Migrar notebooks a service layer
- Migrar settings a service layer
- Tests completos de integración
- Documentación de API completa

---

**Última actualización:** 2025-01-22  
**Versión:** 1.0.0  
**Estado:** 🟡 En implementación
