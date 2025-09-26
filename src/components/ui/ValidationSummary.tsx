import React from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface ValidationSummaryProps {
  hasErrors: boolean
  hasWarnings: boolean
  errorCount: number
  warningCount: number
  errors: string[]
  warnings: string[]
  className?: string
  showDetails?: boolean
  onToggleDetails?: () => void
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  hasErrors,
  hasWarnings,
  errorCount,
  warningCount,
  errors,
  warnings,
  className = '',
  showDetails = false,
  onToggleDetails,
}) => {
  if (!hasErrors && !hasWarnings) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}
      >
        <CheckCircle className="w-4 h-4" />
        <span>All settings are valid</span>
      </div>
    )
  }

  const getSeverityInfo = () => {
    if (hasErrors) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-700 dark:text-red-300',
      }
    } else if (hasWarnings) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-700 dark:text-yellow-300',
      }
    }
    return null
  }

  const severityInfo = getSeverityInfo()
  if (!severityInfo) return null

  return (
    <div
      className={`p-3 rounded-md border ${severityInfo.bgColor} ${severityInfo.borderColor} ${className}`}
    >
      <div className="flex items-start gap-3">
        {severityInfo.icon}
        <div className="flex-1">
          <div className={`text-sm font-medium ${severityInfo.textColor}`}>
            {hasErrors && (
              <span>
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                {hasWarnings &&
                  `, ${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}`}
              </span>
            )}
            {!hasErrors && hasWarnings && (
              <span>
                {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
              </span>
            )}
          </div>

          {showDetails && (
            <div className="mt-2 space-y-1">
              {errors.length > 0 && (
                <div>
                  <div
                    className={`text-xs font-medium ${severityInfo.textColor} mb-1`}
                  >
                    Errors:
                  </div>
                  <ul
                    className={`text-xs ${severityInfo.textColor} space-y-0.5 pl-2`}
                  >
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {warnings.length > 0 && (
                <div className={errors.length > 0 ? 'mt-2' : ''}>
                  <div
                    className={`text-xs font-medium ${severityInfo.textColor} mb-1`}
                  >
                    Warnings:
                  </div>
                  <ul
                    className={`text-xs ${severityInfo.textColor} space-y-0.5 pl-2`}
                  >
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {onToggleDetails && (errors.length > 0 || warnings.length > 0) && (
            <button
              onClick={onToggleDetails}
              className={`mt-2 text-xs ${severityInfo.textColor} hover:underline focus:outline-none`}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ValidationSummary
