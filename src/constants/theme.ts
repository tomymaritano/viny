// Theme constants for consistent styling across the application
export const THEME_COLORS = {
  MODAL_BG: '#171617',
  RING_FOCUS: 'ring-2 ring-theme-accent-primary',
}

export const Z_INDEX = {
  MODAL: 50,
  DROPDOWN: 60,
  CONTEXT_MENU: 70,
}

export const ANIMATIONS = {
  FADE_IN: 'animate-in fade-in duration-200',
  ZOOM_IN: 'animate-in zoom-in-95 duration-300',
  SLIDE_IN_RIGHT: 'animate-in slide-in-from-right duration-300',
}

// Import the complete styles system
export { COMPLETE_STYLES } from '../config/completeStyles'

// Custom tag color palette - elegant and distinct colors
export const CUSTOM_TAG_COLORS = {
  // Deep Ocean Blue
  ocean: {
    bg: '#1e3a8a15', // More subtle background
    border: '#3b82f630', // Consistent with dropdown opacity
    text: '#60a5fa', // bright blue
    name: 'Ocean',
  },

  // Forest Green
  forest: {
    bg: '#14532d15', // More subtle background
    border: '#22c55e30', // Consistent with dropdown opacity
    text: '#4ade80', // bright green
    name: 'Forest',
  },

  // Royal Purple
  royal: {
    bg: '#581c8715', // More subtle background
    border: '#8b5cf630', // Consistent with dropdown opacity
    text: '#a78bfa', // bright purple
    name: 'Royal',
  },

  // Sunset Orange
  sunset: {
    bg: '#9a340715', // More subtle background
    border: '#f9731630', // Consistent with dropdown opacity
    text: '#fb923c', // bright orange
    name: 'Sunset',
  },

  // Cherry Red
  cherry: {
    bg: '#99142515', // More subtle background
    border: '#ef444430', // Consistent with dropdown opacity
    text: '#f87171', // bright red
    name: 'Cherry',
  },

  // Golden Yellow
  golden: {
    bg: '#92400e15', // More subtle background
    border: '#eab30830', // Consistent with dropdown opacity
    text: '#facc15', // bright yellow
    name: 'Golden',
  },

  // Lavender
  lavender: {
    bg: '#7c2d9215', // More subtle background
    border: '#c084fc30', // Consistent with dropdown opacity
    text: '#d8b4fe', // light purple
    name: 'Lavender',
  },

  // Turquoise
  turquoise: {
    bg: '#04706515', // More subtle background
    border: '#14b8a630', // Consistent with dropdown opacity
    text: '#5eead4', // bright teal
    name: 'Turquoise',
  },

  // Rose Pink
  rose: {
    bg: '#9a224515', // More subtle background
    border: '#f4388830', // Consistent with dropdown opacity
    text: '#fb7299', // bright pink
    name: 'Rose',
  },

  // Sage Green
  sage: {
    bg: '#16573615', // More subtle background
    border: '#059e5930', // Consistent with dropdown opacity
    text: '#34d399', // emerald green
    name: 'Sage',
  },

  // Steel Gray
  steel: {
    bg: '#37415115', // More subtle background
    border: '#6b728030', // Consistent with dropdown opacity
    text: '#9ca3af', // light gray
    name: 'Steel',
  },

  // Copper
  copper: {
    bg: '#92262315', // More subtle background
    border: '#dc262630', // Consistent with dropdown opacity
    text: '#fca5a5', // light red
    name: 'Copper',
  },
}

// Predefined colors for specific tag types
export const PREDEFINED_TAG_COLORS = {
  project: 'ocean',
  work: 'steel',
  personal: 'forest',
  urgent: 'cherry',
  important: 'sunset',
  idea: 'golden',
  note: 'sage',
  todo: 'royal',
  meeting: 'turquoise',
  draft: 'lavender',
  completed: 'sage',
  review: 'golden',
  bug: 'cherry',
  feature: 'ocean',
  documentation: 'steel',
}

// Array of color keys for cycling through
export const TAG_COLOR_OPTIONS = Object.keys(CUSTOM_TAG_COLORS)

// Export component style configurations
export { TAG_STYLES, COLOR_PICKER_STYLES, TAG_ANIMATIONS } from '../config/componentStyles'
export { TYPOGRAPHY, GLOBAL_STYLES, APP_LAYOUT } from '../config/baseStyles'
export { EDITOR_LAYOUT, TODO_STYLES } from '../config/editorStyles'
