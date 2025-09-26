import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-theme-border-primary', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline',
        'text-theme-text-primary [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0 text-theme-text-secondary', className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

// Enhanced Accordion components for specific use cases
interface AccordionItemData {
  value: string
  title: string
  content: React.ReactNode
  disabled?: boolean
}

interface EnhancedAccordionProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {
  items: AccordionItemData[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'minimal'
  allowMultiple?: boolean
  defaultValue?: string | string[]
}

/**
 * Enhanced accordion with predefined items and styling options
 * Simplifies common accordion use cases
 */
export const EnhancedAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  EnhancedAccordionProps
>(
  (
    {
      className,
      items,
      size = 'md',
      variant = 'default',
      allowMultiple = false,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    const variantClasses = {
      default: 'border rounded-md',
      outlined: 'border-2 border-theme-border-primary rounded-lg',
      minimal: 'border-0',
    }

    const paddingClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    }

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={cn(
          'w-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        type={allowMultiple ? 'multiple' : 'single'}
        defaultValue={defaultValue}
        collapsible={allowMultiple ? undefined : true}
        {...props}
      >
        {items.map((item, index) => (
          <AccordionPrimitive.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'border-b border-theme-border-primary last:border-b-0',
              variant === 'minimal' && 'border-b-0'
            )}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex flex-1 items-center justify-between font-medium transition-all hover:underline',
                  'text-theme-text-primary [&[data-state=open]>svg]:rotate-180',
                  paddingClasses[size],
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.title}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div
                className={cn(
                  'pt-0 text-theme-text-secondary',
                  paddingClasses[size]
                )}
              >
                {item.content}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    )
  }
)
EnhancedAccordion.displayName = 'EnhancedAccordion'

interface FAQAccordionProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {
  faqs: Array<{
    question: string
    answer: string
    value: string
  }>
  searchable?: boolean
  defaultOpen?: string[]
}

/**
 * FAQ-specific accordion component
 * Optimized for frequently asked questions
 */
export const FAQAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  FAQAccordionProps
>(
  (
    { className, faqs, searchable = false, defaultOpen = [], ...props },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = React.useState('')

    const filteredFAQs = React.useMemo(() => {
      if (!searchTerm) return faqs
      return faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [faqs, searchTerm])

    return (
      <div className={cn('w-full space-y-4', className)}>
        {searchable && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
            />
          </div>
        )}

        <AccordionPrimitive.Root
          ref={ref}
          className="w-full border rounded-md"
          type="multiple"
          defaultValue={defaultOpen}
          {...props}
        >
          {filteredFAQs.map((faq, index) => (
            <AccordionPrimitive.Item
              key={faq.value}
              value={faq.value}
              className="border-b border-theme-border-primary last:border-b-0"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between px-4 py-3 text-left font-medium transition-all hover:underline text-theme-text-primary [&[data-state=open]>svg]:rotate-180">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-4 pb-4 pt-0 text-theme-text-secondary">
                  {faq.answer}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>

        {filteredFAQs.length === 0 && searchTerm && (
          <div className="text-center py-8 text-theme-text-secondary">
            No FAQs found matching "{searchTerm}"
          </div>
        )}
      </div>
    )
  }
)
FAQAccordion.displayName = 'FAQAccordion'

interface SettingsAccordionProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {
  sections: Array<{
    title: string
    description?: string
    content: React.ReactNode
    value: string
    badge?: string
    icon?: React.ReactNode
  }>
  defaultOpen?: string[]
}

/**
 * Settings-specific accordion component
 * Optimized for settings and configuration panels
 */
export const SettingsAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  SettingsAccordionProps
>(({ className, sections, defaultOpen = [], ...props }, ref) => {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn('w-full space-y-2', className)}
      type="multiple"
      defaultValue={defaultOpen}
      {...props}
    >
      {sections.map(section => (
        <AccordionPrimitive.Item
          key={section.value}
          value={section.value}
          className="border border-theme-border-primary rounded-lg bg-theme-bg-secondary"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between px-4 py-3 text-left font-medium transition-all hover:bg-theme-bg-tertiary text-theme-text-primary [&[data-state=open]>svg]:rotate-180 rounded-t-lg">
              <div className="flex items-center space-x-3">
                {section.icon && (
                  <div className="w-5 h-5 text-theme-text-muted">
                    {section.icon}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span>{section.title}</span>
                    {section.badge && (
                      <span className="px-2 py-1 text-xs bg-theme-accent-primary text-white rounded-full">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  {section.description && (
                    <p className="text-sm text-theme-text-secondary mt-1 font-normal">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-4 pb-4 pt-0">{section.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
})
SettingsAccordion.displayName = 'SettingsAccordion'

// Legacy compatibility component
interface LegacyAccordionProps {
  items: Array<{
    title: string
    content: React.ReactNode
    defaultOpen?: boolean
  }>
  allowMultiple?: boolean
  className?: string
}

/**
 * Legacy compatibility wrapper for existing accordion usage
 * @deprecated Use EnhancedAccordion or the base Accordion components instead
 */
export const LegacyAccordion = React.forwardRef<
  HTMLDivElement,
  LegacyAccordionProps
>(({ items, allowMultiple = false, className, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState<Set<number>>(
    new Set(
      items
        .map((item, index) => (item.defaultOpen ? index : -1))
        .filter(i => i !== -1)
    )
  )

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(index)) {
          newSet.delete(index)
        } else {
          newSet.add(index)
        }
        return newSet
      })
    } else {
      setOpenItems(prev => (prev.has(index) ? new Set() : new Set([index])))
    }
  }

  return (
    <div ref={ref} className={cn('w-full space-y-2', className)} {...props}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-theme-border-primary rounded-lg"
        >
          <button
            onClick={() => toggleItem(index)}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors"
          >
            {item.title}
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                openItems.has(index) ? 'rotate-180' : ''
              )}
            />
          </button>
          {openItems.has(index) && (
            <div className="px-4 pb-4 pt-0 text-theme-text-secondary">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
})
LegacyAccordion.displayName = 'LegacyAccordion'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

// Default export for backward compatibility
export default Accordion
