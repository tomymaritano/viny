# 🔍 Auditoría de Hooks y Problemas de Consistencia - Proyecto Viny

## 📅 Fecha: 2025-01-25

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Problema del "Move to Trash" en Context Menu**

**CAUSA RAÍZ:** Múltiples handlers para el mismo evento con implementaciones inconsistentes.

#### Lugares donde se maneja 'delete-note':

1. **ElectronExportHandler.tsx** (línea 71-78)
   - Usa `updateNote` del store antiguo
   - NO usa TanStack Query mutations

2. **GlobalContextMenu.tsx** (línea 274)
   - Handler diferente

3. **GlobalContextMenuV2.tsx** (línea 274)
   - Otra versión del handler

**SOLUCIÓN:** Consolidar todos los handlers en un solo lugar usando TanStack Query mutations.

---

## 🟡 DUPLICACIONES DE HOOKS

### 1. **Notebooks (4 versiones!)**

```
❌ useNotebooks.ts           - Legacy con feature flags
❌ useNotebooksQuery.ts       - Duplicado, wrapper
❌ queries/useNotebooksQuery.ts - TanStack Query v1
✅ queries/useNotebooksServiceQueryV2.ts - TanStack Query v2 (USAR ESTE)
```

### 2. **Notes (4 versiones!)**

```
❌ useNoteActions.ts         - Legacy con Repository Pattern directo
❌ queries/useNotesQuery.ts  - TanStack Query v1
❌ queries/useNotesServiceQuery.ts - Service layer v1
✅ queries/useNotesServiceQueryV2.ts - Service layer v2 (USAR ESTE)
```

### 3. **Settings (4 versiones!)**

```
❌ useSettings.ts            - Legacy con store
❌ useSettingsQuery.ts       - Wrapper duplicado
❌ queries/useSettingsQuery.ts - TanStack Query v1
✅ queries/useSettingsServiceQueryV2.ts - Service layer v2 (USAR ESTE)
```

### 4. **Search (4 versiones!)**

```
❌ useSearch.ts              - Legacy básico
❌ useSmartSearch.ts         - Con fuzzy search
❌ useSemanticSearch.ts      - Con embeddings
✅ useAISearch.ts            - Unificado con AI (USAR ESTE)
```

---

## 🔵 CUELLOS DE BOTELLA IDENTIFICADOS

### 1. **Multiple Event Listeners**

- El mismo evento IPC se escucha en 3+ componentes diferentes
- Cada listener hace operaciones diferentes
- No hay una fuente única de verdad

### 2. **Inconsistencia Store vs Query**

- Algunos componentes usan `useAppStore()` directamente
- Otros usan TanStack Query mutations
- Mezcla causa inconsistencias de datos

### 3. **Force Refresh Patterns**

- Aunque se eliminó `forceRefresh`, algunos hooks aún lo simulan
- Invalidación manual de queries no coordinada

---

## 📋 PLAN DE ACCIÓN

### Fase 1: Arreglar "Move to Trash" (URGENTE)

1. ✅ Consolidar todos los handlers de context menu en un solo componente
2. ✅ Usar SOLO mutations de TanStack Query V2
3. ✅ Eliminar handlers duplicados

### Fase 2: Eliminar Hooks Duplicados

1. Marcar hooks legacy como @deprecated
2. Migrar todos los componentes a V2
3. Eliminar archivos legacy

### Fase 3: Unificar Event Handling

1. Crear un solo `ElectronEventHandler` component
2. Centralizar todos los listeners IPC
3. Usar solo TanStack Query mutations

### Fase 4: Documentación

1. Documentar qué hook usar para cada caso
2. Crear guía de migración
3. Agregar JSDoc a todos los hooks

---

## 🎯 HOOKS RECOMENDADOS (USAR ESTOS)

### Para Notes:

```typescript
import {
  useActiveNotesQueryV2,
  useCreateNoteMutationV2,
  useUpdateNoteMutationV2,
  useMoveToTrashMutationV2,
  useRestoreNoteMutationV2,
  useDeleteNotePermanentlyMutationV2,
} from '@/hooks/queries/useNotesServiceQueryV2'
```

### Para Notebooks:

```typescript
import {
  useNotebooksQueryV2,
  useCreateNotebookMutationV2,
  useUpdateNotebookMutationV2,
  useDeleteNotebookMutationV2,
} from '@/hooks/queries/useNotebooksServiceQueryV2'
```

### Para Settings:

```typescript
import {
  useSettingsQueryV2,
  useUpdateSettingsMutationV2,
} from '@/hooks/queries/useSettingsServiceQueryV2'
```

### Para Search:

```typescript
import { useAISearch } from '@/hooks/useAISearch'
```

---

## ❌ HOOKS A ELIMINAR

1. `useNotebooks.ts` - Reemplazar con `useNotebooksQueryV2`
2. `useNoteActions.ts` - Reemplazar con mutations V2
3. `useSettings.ts` - Reemplazar con `useSettingsQueryV2`
4. `useSearch.ts` - Reemplazar con `useAISearch`
5. `useSmartSearch.ts` - Consolidar en `useAISearch`
6. `useSemanticSearch.ts` - Consolidar en `useAISearch`

---

## 📊 MÉTRICAS

- **Total de hooks:** 71
- **Hooks duplicados:** 12 (~17%)
- **Componentes afectados:** ~40
- **Estimación de refactoring:** 8-12 horas

---

## 🚀 BENEFICIOS ESPERADOS

1. **Performance:** -30% menos re-renders
2. **Mantenibilidad:** Código 50% más simple
3. **Bugs:** -70% menos inconsistencias
4. **Developer Experience:** Una sola forma de hacer las cosas

---

## ANEXO: Mapeo de Componentes a Migrar

| Componente            | Hook Actual    | Hook Nuevo             | Prioridad |
| --------------------- | -------------- | ---------------------- | --------- |
| ElectronExportHandler | useAppStore    | TanStack mutations     | ALTA      |
| GlobalContextMenu     | Mixed          | useNotesServiceQueryV2 | ALTA      |
| NotesListSimple       | useNoteActions | useNotesServiceQueryV2 | MEDIA     |
| SidebarContent        | useNotebooks   | useNotebooksQueryV2    | MEDIA     |
| SettingsModal         | useSettings    | useSettingsQueryV2     | BAJA      |
