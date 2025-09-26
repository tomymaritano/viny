/**
 * Radix UI Theme Integration Utilities
 *
 * This module provides utilities to integrate Radix UI components
 * with the existing theme system, ensuring consistent styling
 * across the application.
 */

import { cn } from './utils'

// Radix component styling utilities
export const radixStyles = {
  // Dropdown Menu styles
  dropdownMenu: {
    content: cn(
      'min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary p-1 shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ),
    item: cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'transition-colors focus:bg-theme-accent-primary focus:text-theme-text-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    separator: 'h-px bg-theme-border-primary my-1',
    label: 'px-2 py-1.5 text-sm font-semibold text-theme-text-secondary',
    shortcut: 'ml-auto text-xs tracking-widest opacity-60',
  },

  // Select styles
  select: {
    trigger: cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-theme-border-primary',
      'bg-theme-bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-theme-text-secondary',
      'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50'
    ),
    content: cn(
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary',
      'text-theme-text-primary shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ),
    item: cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-theme-accent-primary focus:text-theme-text-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    itemIndicator:
      'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
  },

  // Switch styles
  switch: {
    root: cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-theme-accent-primary data-[state=unchecked]:bg-theme-bg-tertiary'
    ),
    thumb: cn(
      'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
      'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
    ),
  },

  // Toast styles
  toast: {
    viewport: cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0',
      'sm:top-auto sm:flex-col md:max-w-[420px]'
    ),
    root: cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden',
      'rounded-md border p-6 pr-8 shadow-lg transition-all',
      'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
      'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
      'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
      'data-[state=open]:sm:slide-in-from-bottom-full'
    ),
    title: 'text-sm font-semibold text-theme-text-primary',
    description: 'text-sm opacity-90 text-theme-text-secondary',
    action: cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium',
      'ring-offset-background transition-colors hover:bg-theme-bg-secondary focus:outline-none focus:ring-2',
      'focus:ring-theme-accent-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    ),
    close: cn(
      'absolute right-2 top-2 rounded-md p-1 text-theme-text-secondary opacity-0 transition-opacity',
      'hover:text-theme-text-primary focus:opacity-100 focus:outline-none focus:ring-2',
      'group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50',
      'group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600'
    ),
  },

  // Tooltip styles
  tooltip: {
    content: cn(
      'z-50 overflow-hidden rounded-md border bg-theme-bg-secondary px-3 py-1.5 text-sm text-theme-text-primary',
      'shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ),
  },

  // Toggle styles
  toggle: {
    root: cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background',
      'transition-colors hover:bg-theme-bg-tertiary hover:text-theme-text-primary focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-theme-accent-primary',
      'data-[state=on]:text-theme-text-primary'
    ),
  },

  // Tabs styles
  tabs: {
    list: cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-theme-bg-secondary p-1 text-theme-text-secondary'
    ),
    trigger: cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium',
      'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none',
      'disabled:opacity-50 data-[state=active]:bg-theme-bg-primary data-[state=active]:text-theme-text-primary',
      'data-[state=active]:shadow-sm'
    ),
    content: cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2'
    ),
  },

  // Progress styles
  progress: {
    root: cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-theme-bg-tertiary'
    ),
    indicator: cn(
      'h-full w-full flex-1 bg-theme-accent-primary transition-all duration-300 ease-out'
    ),
  },

  // Checkbox styles
  checkbox: {
    root: cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-theme-border-primary shadow',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
      'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-theme-accent-primary data-[state=checked]:text-white',
      'data-[state=checked]:border-theme-accent-primary'
    ),
    indicator: cn('flex items-center justify-center text-current'),
  },

  // Radio Group styles
  radioGroup: {
    root: cn('grid gap-2'),
    item: cn(
      'aspect-square h-4 w-4 rounded-full border border-theme-border-primary shadow',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
      'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-theme-accent-primary data-[state=checked]:border-theme-accent-primary'
    ),
    indicator: cn('flex items-center justify-center'),
  },

  // Slider styles
  slider: {
    root: cn('relative flex w-full touch-none select-none items-center'),
    track: cn(
      'relative h-2 w-full grow overflow-hidden rounded-full bg-theme-bg-tertiary'
    ),
    range: cn('absolute h-full bg-theme-accent-primary'),
    thumb: cn(
      'block h-5 w-5 rounded-full border-2 border-theme-bg-primary bg-theme-accent-primary shadow',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary',
      'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    ),
  },

  // Accordion styles
  accordion: {
    root: cn('w-full'),
    item: cn('border-b border-theme-border-primary'),
    header: cn('flex'),
    trigger: cn(
      'flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline',
      'text-theme-text-primary [&[data-state=open]>svg]:rotate-180'
    ),
    content: cn(
      'overflow-hidden text-sm transition-all',
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
    ),
    contentInner: cn('pb-4 pt-0 text-theme-text-secondary'),
  },

  // Popover styles
  popover: {
    content: cn(
      'z-50 w-72 rounded-md border bg-theme-bg-secondary p-4 text-theme-text-primary shadow-md outline-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ),
    close: cn(
      'absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100',
      'focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2',
      'disabled:pointer-events-none data-[state=open]:bg-theme-bg-tertiary data-[state=open]:text-theme-text-secondary'
    ),
  },

  // Separator styles
  separator: {
    horizontal: cn('shrink-0 bg-theme-border-primary h-[1px] w-full'),
    vertical: cn('shrink-0 bg-theme-border-primary h-full w-[1px]'),
  },

  // Context Menu styles
  contextMenu: {
    content: cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-theme-bg-secondary p-1 text-theme-text-primary shadow-md',
      'animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ),
    item: cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-theme-accent-primary focus:text-theme-text-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ),
    separator: cn('-mx-1 my-1 h-px bg-theme-border-primary'),
    label: cn('px-2 py-1.5 text-sm font-semibold text-theme-text-primary'),
    shortcut: cn('ml-auto text-xs tracking-widest text-theme-text-secondary'),
  },
}

// Theme variant utilities for Radix components
export const radixVariants = {
  // Toast variants
  toastVariants: {
    default: 'border bg-theme-bg-secondary text-theme-text-primary',
    destructive: 'destructive border-red-500 bg-red-500 text-white',
    success: 'border-green-500 bg-green-500 text-white',
    warning: 'border-yellow-500 bg-yellow-500 text-black',
  },

  // Button variants for Radix integration
  buttonVariants: {
    default:
      'bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline:
      'border-2 border-theme-accent-primary text-theme-accent-primary hover:bg-theme-accent-primary hover:text-white',
    secondary:
      'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary',
    ghost: 'hover:bg-theme-bg-secondary hover:text-theme-text-primary',
    link: 'text-theme-accent-primary underline-offset-4 hover:underline',
  },
}

// Size utilities for consistent component sizing
export const radixSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
}

// Animation utilities
export const radixAnimations = {
  fadeIn: 'animate-in fade-in-0',
  fadeOut: 'animate-out fade-out-0',
  slideIn: 'animate-in slide-in-from-bottom-2',
  slideOut: 'animate-out slide-out-to-bottom-2',
  zoomIn: 'animate-in zoom-in-95',
  zoomOut: 'animate-out zoom-out-95',
}

// Utility to merge Radix styles with custom classes
export const mergeRadixStyles = (baseStyle: string, customStyle?: string) => {
  return cn(baseStyle, customStyle)
}

// Type exports for better TypeScript support
export type RadixStyles = typeof radixStyles
export type RadixVariants = typeof radixVariants
export type RadixSizes = typeof radixSizes
export type RadixAnimations = typeof radixAnimations
