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

// Custom tag color palette - elegant and distinct colors
export const CUSTOM_TAG_COLORS = {
  // Deep Ocean Blue
  ocean: {
    bg: '#1e3a8a20', // rgba(30, 58, 138, 0.12)
    border: '#3b82f650', // rgba(59, 130, 246, 0.31)
    text: '#60a5fa', // bright blue
    name: 'Ocean',
  },

  // Forest Green
  forest: {
    bg: '#14532d20', // rgba(20, 83, 45, 0.12)
    border: '#22c55e50', // rgba(34, 197, 94, 0.31)
    text: '#4ade80', // bright green
    name: 'Forest',
  },

  // Royal Purple
  royal: {
    bg: '#581c8720', // rgba(88, 28, 135, 0.12)
    border: '#8b5cf650', // rgba(139, 92, 246, 0.31)
    text: '#a78bfa', // bright purple
    name: 'Royal',
  },

  // Sunset Orange
  sunset: {
    bg: '#9a340720', // rgba(154, 52, 7, 0.12)
    border: '#f97316650', // rgba(249, 115, 22, 0.31)
    text: '#fb923c', // bright orange
    name: 'Sunset',
  },

  // Cherry Red
  cherry: {
    bg: '#99142520', // rgba(153, 20, 37, 0.12)
    border: '#ef444450', // rgba(239, 68, 68, 0.31)
    text: '#f87171', // bright red
    name: 'Cherry',
  },

  // Golden Yellow
  golden: {
    bg: '#92400e20', // rgba(146, 64, 14, 0.12)
    border: '#eab30850', // rgba(234, 179, 8, 0.31)
    text: '#facc15', // bright yellow
    name: 'Golden',
  },

  // Lavender
  lavender: {
    bg: '#7c2d9220', // rgba(124, 45, 146, 0.12)
    border: '#c084fc50', // rgba(192, 132, 252, 0.31)
    text: '#d8b4fe', // light purple
    name: 'Lavender',
  },

  // Turquoise
  turquoise: {
    bg: '#04706520', // rgba(4, 112, 101, 0.12)
    border: '#14b8a650', // rgba(20, 184, 166, 0.31)
    text: '#5eead4', // bright teal
    name: 'Turquoise',
  },

  // Rose Pink
  rose: {
    bg: '#9a224520', // rgba(154, 34, 69, 0.12)
    border: '#f4388850', // rgba(244, 56, 136, 0.31)
    text: '#fb7299', // bright pink
    name: 'Rose',
  },

  // Sage Green
  sage: {
    bg: '#16573620', // rgba(22, 87, 54, 0.12)
    border: '#059e5950', // rgba(5, 158, 89, 0.31)
    text: '#34d399', // emerald green
    name: 'Sage',
  },

  // Steel Gray
  steel: {
    bg: '#37415120', // rgba(55, 65, 81, 0.12)
    border: '#6b728050', // rgba(107, 114, 128, 0.31)
    text: '#9ca3af', // light gray
    name: 'Steel',
  },

  // Copper
  copper: {
    bg: '#92262320', // rgba(146, 38, 35, 0.12)
    border: '#dc262650', // rgba(220, 38, 38, 0.31)
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
