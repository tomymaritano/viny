/**
 * Authentication Theme Configuration
 *
 * Centralized configuration for all authentication-related styling,
 * colors, and visual effects to maintain consistency and easy maintenance.
 */

export const AUTH_THEME = {
  // Color Palette
  colors: {
    // Background colors
    background: {
      primary: '#111111',
      input: '#0A1523',
      inputBorder: '#11243B',
      inputBorderFocus: '#6578E1',
    },

    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#FFFFFF80', // 50% opacity
      placeholder: '#9CA3AF',
      error: '#EF4444',
    },

    // Interactive colors
    interactive: {
      primary: '#6578E1',
      icon: '#6B7280',
      iconFocus: '#6578E1',
      iconError: '#EF4444',
    },

    // Vanta Fog colors (hex values converted to numbers)
    vantaFog: {
      baseColor: 0x4a5d7a,
      highlightColor: 0x00b9ae,
      lowlightColor: 0x5c3cfc,
      midtoneColor: 0xd200d2,
    },
  },

  // Typography
  typography: {
    fonts: {
      heading: "'M PLUS Rounded 1c', 'Open Sans', 'system-ui', 'sans-serif'",
      body: "'Open Sans', 'system-ui', 'sans-serif'",
    },
    sizes: {
      title: 'text-2xl',
      body: 'text-sm',
    },
  },

  // Component Configurations
  components: {
    // Input field settings
    input: {
      height: 'h-12',
      borderRadius: 'rounded-xl',
      borderWidth: 'border-2',
      padding: {
        default: 'pl-4 pr-4',
        withIcon: 'pl-11 pr-4',
        withToggle: 'pl-4 pr-11',
        withBoth: 'pl-11 pr-11',
      },
      iconSize: 18,
      iconPosition: {
        left: 'left-4',
        right: 'right-4',
      },
    },

    // Button settings
    button: {
      height: 'h-14',
      borderRadius: 'rounded-xl',
      padding: 'px-8 py-5',
    },

    // Logo settings
    logo: {
      size: 'w-20 h-20',
      iconSize: 40,
      borderRadius: 'rounded-full',
    },
  },

  // Animation Settings
  animations: {
    transitions: {
      default: 'transition-all duration-300',
      colors: 'transition-colors duration-200',
      transform: 'transition-transform duration-300',
    },

    motionVariants: {
      fadeIn: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
      },

      logoScale: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, delay: 0.2 },
      },

      titleSlide: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5, delay: 0.3 },
      },

      formSlide: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5, delay: 0.4 },
      },
    },
  },

  // Vanta Fog Configuration
  vantaFog: {
    backgroundAlpha: 0.1,
    blurFactor: 0.9,
    gyroControls: false,
    mouseControls: true,
    touchControls: true,
    scale: 1,
    scaleMobile: 4,
    speed: 0.7,
    zoom: 0.5,
    minHeight: 200,
    minWidth: 200,
  },

  // Effects and Shadows
  effects: {
    shadows: {
      default: 'shadow-md',
      focus: 'shadow-xl',
      button: 'shadow-xl hover:shadow-2xl',
    },

    blur: {
      backdrop: 'backdrop-blur-xl',
    },

    transforms: {
      scale: {
        focus: 'scale-[1.02]',
        hover: 'hover:scale-105',
      },
    },
  },
} as const

// Type exports for better TypeScript support
export type AuthTheme = typeof AUTH_THEME
export type AuthColors = typeof AUTH_THEME.colors
export type AuthTypography = typeof AUTH_THEME.typography
export type AuthComponents = typeof AUTH_THEME.components
