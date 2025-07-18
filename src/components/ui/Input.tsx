import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl border-2 bg-transparent px-3 py-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-theme-text-secondary/20 bg-theme-bg-secondary/30 focus-visible:border-theme-accent-primary focus-visible:bg-theme-accent-primary/5",
        glassmorphism: "border-theme-text-secondary/20 backdrop-blur-xl bg-theme-bg-secondary/20 focus-visible:border-theme-accent-primary focus-visible:bg-theme-accent-primary/5 focus-visible:backdrop-blur-sm",
        error: "border-red-400 bg-red-50/10 text-red-600 focus-visible:border-red-500",
        success: "border-green-400 bg-green-50/10 text-green-600 focus-visible:border-green-500",
      },
      size: {
        default: "h-12 px-4 py-4",
        sm: "h-10 px-3 py-2",
        lg: "h-14 px-5 py-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  error?: string
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, startIcon, endIcon, error, success, ...props }, ref) => {
    // Determine variant based on state
    const currentVariant = error 
      ? "error" 
      : success 
      ? "success" 
      : variant

    return (
      <div className="relative group">
        {startIcon && (
          <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-secondary pointer-events-none z-10 transition-colors duration-300 group-focus-within:text-theme-accent-primary">
            {startIcon}
          </div>
        )}
        
        <input
          className={cn(
            inputVariants({ variant: currentVariant, size, className }),
            {
              "pl-11": startIcon,
              "pr-11": endIcon,
            }
          )}
          ref={ref}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-secondary pointer-events-none z-10 transition-colors duration-300">
            {endIcon}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }