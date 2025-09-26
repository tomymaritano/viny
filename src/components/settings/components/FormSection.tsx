import React from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-theme-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  )
}

export default FormSection
