# Custom Tag Colors System

Viny ahora incluye un sistema de colores personalizado para tags, que reemplaza los colores genéricos de Tailwind con una paleta elegante y distintiva diseñada específicamente para la organización de notas.

## Características

- ✨ **12 colores únicos** diseñados específicamente para tags
- 🎨 **Colores predefinidos** para tags semánticos comunes
- 🎯 **Consistencia visual** con nombres descriptivos como "Ocean", "Forest", "Royal"
- 🔄 **Migración automática** desde los colores antiguos de Tailwind
- 🛠️ **Personalización fácil** con selector de colores integrado

## Paleta de Colores

| Color        | Nombre            | Uso Recomendado            |
| ------------ | ----------------- | -------------------------- |
| 🌊 Ocean     | Azul profundo     | Proyectos, características |
| 🌲 Forest    | Verde bosque      | Personal, completado       |
| 👑 Royal     | Púrpura real      | TODOs, tareas importantes  |
| 🌅 Sunset    | Naranja atardecer | Importante, en revisión    |
| 🍒 Cherry    | Rojo cereza       | Urgente, bugs              |
| 🌟 Golden    | Amarillo dorado   | Ideas, revisión            |
| 💜 Lavender  | Lavanda           | Borradores, experimental   |
| 🏝️ Turquoise | Turquesa          | Reuniones, comunicación    |
| 🌹 Rose      | Rosa vibrante     | Personal, social           |
| 🌿 Sage      | Verde salvia      | Notas, documentación       |
| ⚙️ Steel     | Gris acero        | Trabajo, técnico           |
| 🔸 Copper    | Cobre             | Alternativo, especial      |

## Colores Predefinidos

El sistema incluye mapeos automáticos para tags comunes:

```javascript
{
  'project': 'ocean',      // Azul para proyectos
  'work': 'steel',         // Gris para trabajo
  'personal': 'forest',    // Verde para personal
  'urgent': 'cherry',      // Rojo para urgente
  'important': 'sunset',   // Naranja para importante
  'idea': 'golden',        // Amarillo para ideas
  'note': 'sage',          // Verde claro para notas
  'todo': 'royal',         // Púrpura para tareas
  'meeting': 'turquoise',  // Turquesa para reuniones
  'draft': 'lavender',     // Lavanda para borradores
  // ... y más
}
```

## Componentes

### CustomTag

Componente principal para renderizar tags con colores personalizados:

```tsx
import CustomTag from '../ui/CustomTag'
;<CustomTag
  tagName="project"
  size="md"
  onClick={() => handleTagClick()}
  onRemove={() => handleRemove()}
  removable={true}
/>
```

**Props:**

- `tagName: string` - Nombre del tag
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del tag
- `onClick?: () => void` - Callback al hacer clic
- `onRemove?: () => void` - Callback para eliminar
- `removable?: boolean` - Si se puede eliminar
- `className?: string` - Clases CSS adicionales

### TagColorPicker

Modal para seleccionar colores de tags:

```tsx
import TagColorPicker from '../ui/TagColorPicker'
;<TagColorPicker
  tagName="project"
  isOpen={showPicker}
  onClose={() => setShowPicker(false)}
  onColorChange={colorKey => handleColorChange(colorKey)}
  currentColorKey="ocean"
/>
```

## Utilidades

### customTagColors.js

Funciones utilitarias para trabajar con colores:

```javascript
import {
  getCustomTagColor,
  getTagStyle,
  getAvailableTagColors,
} from '../utils/customTagColors'

// Obtener color de un tag
const color = getCustomTagColor('project', customColors)

// Obtener estilos CSS
const style = getTagStyle('project', customColors)

// Obtener colores disponibles
const colors = getAvailableTagColors()
```

## Migración

El sistema incluye migración automática desde el formato anterior:

```javascript
// Convierte automáticamente de:
'bg-blue-900/40 border-blue-500/50 text-blue-300'
// A:
'ocean'
```

## CSS Personalizado

Los estilos están definidos en `src/styles/customTags.css`:

```css
.tag-custom {
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.tag-custom:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## Uso en Componentes

### Actualizar componente existente

```tsx
// Antes
<span className={`tag ${getTagColor(tag)}`}>
  {tag}
</span>

// Después
<CustomTag
  tagName={tag}
  size="sm"
  onClick={() => handleTagClick(tag)}
/>
```

### Integración en listas de notas

```tsx
{
  note.tags.map((tag, index) => (
    <CustomTag
      key={index}
      tagName={tag}
      size="sm"
      onClick={() => filterByTag(tag)}
    />
  ))
}
```

## Personalización Avanzada

### Añadir nuevos colores

1. Actualizar `CUSTOM_TAG_COLORS` en `constants/theme.js`
2. Añadir mapeos en `PREDEFINED_TAG_COLORS` si es necesario
3. Actualizar los tipos TypeScript si corresponde

### Temas personalizados

Los colores se adaptan automáticamente al tema oscuro/claro de la aplicación.

## Beneficios

1. **Consistencia Visual**: Todos los tags siguen el mismo sistema de diseño
2. **Mejor UX**: Colores más distintivos y agradables a la vista
3. **Semántica Clara**: Colores que corresponden al significado del tag
4. **Mantenimiento**: Sistema centralizado y fácil de actualizar
5. **Performance**: Colores optimizados sin dependencia de Tailwind dinámico

## Demo

Puedes ver todos los colores en acción ejecutando el componente demo:

```tsx
import TagColorsDemo from '../components/demo/TagColorsDemo'
;<TagColorsDemo />
```

El demo muestra todos los colores disponibles, diferentes tamaños, y permite probar el selector de colores.
