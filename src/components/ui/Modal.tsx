import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const Modal = DialogPrimitive.Root

const ModalTrigger = DialogPrimitive.Trigger

const ModalPortal = DialogPrimitive.Portal

const ModalClose = DialogPrimitive.Close

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: "default" | "glassmorphism" | "gradient"
  size?: "sm" | "md" | "lg" | "xl"
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, variant = "default", size = "md", children, ...props }, ref) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  }

  const variantClasses = {
    default: "bg-theme-bg-primary border border-theme-border-primary",
    glassmorphism: "bg-theme-bg-secondary/20 backdrop-blur-xl border border-theme-border-primary/20",
    gradient: "bg-gradient-to-br from-theme-bg-primary/95 to-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border-primary/30"
  }

  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
})
ModalContent.displayName = DialogPrimitive.Content.displayName

// Animated Modal Content using Framer Motion
interface AnimatedModalContentProps extends ModalContentProps {
  isOpen: boolean
}

const AnimatedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AnimatedModalContentProps
>(({ isOpen, children, ...props }, ref) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ModalContent ref={ref} {...props}>
          {children}
        </ModalContent>
      </motion.div>
    )}
  </AnimatePresence>
))
AnimatedModalContent.displayName = "AnimatedModalContent"

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
ModalHeader.displayName = "ModalHeader"

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
ModalFooter.displayName = "ModalFooter"

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-theme-text-primary",
      className
    )}
    {...props}
  />
))
ModalTitle.displayName = DialogPrimitive.Title.displayName

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-theme-text-secondary", className)}
    {...props}
  />
))
ModalDescription.displayName = DialogPrimitive.Description.displayName

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  AnimatedModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}