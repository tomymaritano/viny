import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-theme-accent-primary text-white hover:bg-theme-accent-primary/90 hover:scale-105 hover:shadow-lg",
        destructive: "bg-red-500 text-white hover:bg-red-600 hover:scale-105",
        outline: "border-2 border-theme-accent-primary text-theme-accent-primary hover:bg-theme-accent-primary hover:text-white",
        secondary: "bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary hover:scale-105",
        ghost: "hover:bg-theme-bg-secondary hover:text-theme-text-primary",
        link: "text-theme-accent-primary underline-offset-4 hover:underline",
        glassmorphism: "bg-gradient-to-r from-theme-accent-primary/90 to-theme-accent-cyan/90 text-white backdrop-blur-xl border border-white/20 hover:from-theme-accent-primary hover:to-theme-accent-cyan hover:scale-105 hover:shadow-2xl",
      },
      size: {
        default: "h-12 px-6 py-4",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-5",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }