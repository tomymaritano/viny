import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility for creating glassmorphism effects
export function createGlassmorphism(
  opacity: number = 0.1,
  blur: number = 12,
  borderOpacity: number = 0.2
) {
  return {
    backgroundColor: `rgba(var(--theme-bg-secondary-rgb), ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderColor: `rgba(var(--theme-border-primary-rgb), ${borderOpacity})`,
    boxShadow: `
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  }
}

// Utility for creating gradient backgrounds
export function createGradient(
  direction: string = "135deg",
  colors: string[] = ["var(--theme-accent-primary)", "var(--theme-accent-cyan)"]
) {
  return `linear-gradient(${direction}, ${colors.join(", ")})`
}

// Utility for creating shadow effects
export function createShadow(
  color: string = "var(--theme-accent-primary-rgb)",
  opacity: number = 0.2,
  blur: number = 25,
  spread: number = -5
) {
  return `0 10px ${blur}px ${spread}px rgba(${color}, ${opacity})`
}