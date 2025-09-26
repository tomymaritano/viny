/**
 * Security Dashboard Component
 * Displays security status and metrics for administrators
 */

import React, { useState, useEffect } from 'react'
import { useServices } from '../../services/ServiceProvider'

export const SecurityDashboard: React.FC = () => {
  const { securityService } = useServices()
  const [metrics, setMetrics] = useState(securityService.getSecurityMetrics())
  const [auditResults, setAuditResults] = useState(
    securityService.performSecurityAudit()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(securityService.getSecurityMetrics())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [securityService])

  const runSecurityAudit = () => {
    const results = securityService.performSecurityAudit()
    setAuditResults(results)
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? '✅' : '❌'
  }

  return (
    <div className="security-dashboard p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Security Dashboard</h2>
        <button
          onClick={runSecurityAudit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Run Security Audit
        </button>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              CSP Status
            </span>
            <span className={getStatusColor(metrics.cspEnabled)}>
              {getStatusIcon(metrics.cspEnabled)}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-semibold text-gray-800">
              {metrics.cspEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Validation
            </span>
            <span className={getStatusColor(metrics.validationEnabled)}>
              {getStatusIcon(metrics.validationEnabled)}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-semibold text-gray-800">
              {metrics.validationEnabled ? 'Strict' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Violations
            </span>
            <span className={getStatusColor(metrics.violationCount === 0)}>
              {metrics.violationCount === 0 ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-semibold text-gray-800">
              {metrics.violationCount}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Last Violation
            </span>
            <span className={getStatusColor(!metrics.lastViolation)}>
              {!metrics.lastViolation ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {metrics.lastViolation
                ? metrics.lastViolation.toLocaleString()
                : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Audit Results */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Security Audit Results</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <span
              className={`text-lg font-semibold ${getStatusColor(auditResults.passed)}`}
            >
              {getStatusIcon(auditResults.passed)}
              Overall Status:{' '}
              {auditResults.passed ? 'SECURE' : 'NEEDS ATTENTION'}
            </span>
          </div>

          <div className="space-y-3">
            {auditResults.checks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center">
                  <span className={`mr-3 ${getStatusColor(check.passed)}`}>
                    {getStatusIcon(check.passed)}
                  </span>
                  <div>
                    <span className="font-medium text-gray-800">
                      {check.name}
                    </span>
                    <p className="text-sm text-gray-600">{check.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      {metrics.violations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Recent Security Violations
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {metrics.violations
                .slice(-10)
                .reverse()
                .map((violation, index) => (
                  <div
                    key={index}
                    className="border-b border-red-200 pb-2 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-red-800">
                          {violation.type.toUpperCase()}
                        </span>
                        <p className="text-sm text-red-600 mt-1">
                          {violation.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {violation.details && (
                      <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(violation.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Regularly monitor security violations and address patterns
            </li>
            <li>• Keep CSP policies updated as the application evolves</li>
            <li>
              • Validate all user inputs, especially in forms and text areas
            </li>
            <li>• Use HTTPS in production environments</li>
            <li>• Implement proper session management and authentication</li>
            <li>• Regularly audit and update security configurations</li>
            <li>• Monitor for XSS, CSRF, and injection vulnerabilities</li>
            <li>• Keep dependencies updated to latest secure versions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
