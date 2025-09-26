/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and optimization insights
 */

import React, { useState, useEffect, useCallback } from 'react'
import { performanceMonitoringService } from '../../services/PerformanceMonitoringService'
import type {
  PerformanceMetrics,
  PerformanceAlert,
} from '../../services/PerformanceMonitoringService'

interface PerformanceDashboardProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [performanceScore, setPerformanceScore] = useState<number>(100)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const updateMetrics = useCallback(() => {
    const report = performanceMonitoringService.generatePerformanceReport()
    setMetrics(report.metrics)
    setAlerts(report.alerts)
    setPerformanceScore(report.score)
    setRecommendations(report.recommendations)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    updateMetrics()

    if (autoRefresh) {
      const interval = setInterval(updateMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [updateMetrics, autoRefresh, refreshInterval])

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricColor = (value: number, threshold: number): string => {
    if (value <= threshold * 0.7) return 'text-green-600'
    if (value <= threshold) return 'text-yellow-600'
    return 'text-red-600'
  }

  const clearMetrics = () => {
    performanceMonitoringService.clearMetrics()
    updateMetrics()
  }

  if (isLoading) {
    return (
      <div className="performance-dashboard p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="performance-dashboard p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center text-gray-500">
          No performance metrics available
        </div>
      </div>
    )
  }

  return (
    <div className="performance-dashboard p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Performance Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">
              Performance Score:
            </span>
            <span
              className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}
            >
              {performanceScore}
            </span>
          </div>
          <button
            onClick={clearMetrics}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Metrics
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              App Init Time
            </span>
            <span
              className={`text-lg font-semibold ${getMetricColor(metrics.appInitTime, 3000)}`}
            >
              {formatTime(metrics.appInitTime)}
            </span>
          </div>
          <div className="text-xs text-gray-500">Target: &lt;3s</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Memory Usage
            </span>
            <span
              className={`text-lg font-semibold ${getMetricColor(metrics.memoryUsage.percentage, 80)}`}
            >
              {metrics.memoryUsage.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatSize(metrics.memoryUsage.used)} /{' '}
            {formatSize(metrics.memoryUsage.total)}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Avg Response Time
            </span>
            <span
              className={`text-lg font-semibold ${getMetricColor(metrics.interactions.averageResponseTime, 100)}`}
            >
              {formatTime(metrics.interactions.averageResponseTime)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {metrics.interactions.totalInteractions} interactions
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Error Rate
            </span>
            <span
              className={`text-lg font-semibold ${getMetricColor(metrics.errorRate * 100, 5)}`}
            >
              {(metrics.errorRate * 100).toFixed(2)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {metrics.criticalErrors} critical errors
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Timing Metrics */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Timing Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">First Render Time</span>
              <span
                className={`font-medium ${getMetricColor(metrics.firstRenderTime, 1000)}`}
              >
                {formatTime(metrics.firstRenderTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Time to Interactive</span>
              <span
                className={`font-medium ${getMetricColor(metrics.timeToInteractive, 5000)}`}
              >
                {formatTime(metrics.timeToInteractive)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Search Time</span>
              <span
                className={`font-medium ${getMetricColor(metrics.searchMetrics.averageSearchTime, 200)}`}
              >
                {formatTime(metrics.searchMetrics.averageSearchTime)}
              </span>
            </div>
          </div>
        </div>

        {/* User Interactions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">User Interactions</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Interactions</span>
              <span className="font-medium">
                {metrics.interactions.totalInteractions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Slow Interactions</span>
              <span
                className={`font-medium ${metrics.interactions.slowInteractions > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {metrics.interactions.slowInteractions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Network Latency</span>
              <span
                className={`font-medium ${getMetricColor(metrics.networkLatency, 1000)}`}
              >
                {formatTime(metrics.networkLatency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Active Performance Alerts
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className={`font-medium ${
                        alert.type === 'critical'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}
                    >
                      {alert.message}
                    </h4>
                    <p
                      className={`text-sm mt-1 ${
                        alert.type === 'critical'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      Current: {alert.currentValue} | Threshold:{' '}
                      {alert.threshold}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      alert.type === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {alert.type.toUpperCase()}
                  </span>
                </div>
                {alert.suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">
                      Suggestions:
                    </p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {alert.suggestions.slice(0, 3).map((suggestion, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {alerts.length > 5 && (
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  ... and {alerts.length - 5} more alerts
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Performance Recommendations
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  <span className="text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Performance Score Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Performance Score Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}
            >
              {performanceScore}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${alerts.filter(a => a.type === 'critical').length === 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {alerts.filter(a => a.type === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical Issues</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${alerts.filter(a => a.type === 'warning').length === 0 ? 'text-green-600' : 'text-yellow-600'}`}
            >
              {alerts.filter(a => a.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
        {autoRefresh && (
          <span className="ml-2">
            • Auto-refresh: {refreshInterval / 1000}s
          </span>
        )}
      </div>
    </div>
  )
}
