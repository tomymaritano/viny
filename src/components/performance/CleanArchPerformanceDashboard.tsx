/**
 * CleanArchPerformanceDashboard - Lightweight performance metrics for clean architecture
 * Shows real-time metrics for each architecture layer
 */

import React, { useState, useEffect, useMemo, memo } from 'react'
import { Activity, Database, Layers, Zap, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { featureFlags } from '../../config/featureFlags'
import { logger } from '../../utils/logger'

interface MetricCard {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

const CleanArchPerformanceDashboard: React.FC = memo(() => {
  const queryClient = useQueryClient()
  const [isVisible, setIsVisible] = useState(false)
  
  // Only show in development and when clean architecture is enabled
  if (!import.meta.env.DEV || !featureFlags.useCleanArchitecture) {
    return null
  }
  
  const metrics = useMemo(() => {
    const queryCache = queryClient.getQueryCache()
    const queries = queryCache.getAll()
    const mutationCache = queryClient.getMutationCache()
    const mutations = mutationCache.getAll()
    
    return {
      queries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'loading').length,
      mutations: mutations.length,
      activeMutations: mutations.filter(m => m.state.status === 'loading').length,
    }
  }, [queryClient])
  
  const cards: MetricCard[] = [
    {
      label: 'Repository',
      value: 'Active',
      icon: <Database className="w-4 h-4" />,
      color: 'text-blue-500',
    },
    {
      label: 'Services',
      value: '3',
      icon: <Layers className="w-4 h-4" />,
      color: 'text-green-500',
    },
    {
      label: 'Queries',
      value: `${metrics.activeQueries}/${metrics.queries}`,
      icon: <Zap className="w-4 h-4" />,
      color: 'text-yellow-500',
    },
    {
      label: 'Mutations',
      value: `${metrics.activeMutations}/${metrics.mutations}`,
      icon: <Activity className="w-4 h-4" />,
      color: 'text-purple-500',
    },
  ]
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 p-2 bg-theme-bg-secondary border border-theme-border rounded-lg shadow-lg hover:shadow-xl transition-all opacity-50 hover:opacity-100"
        title="Clean Architecture Metrics"
      >
        <Layers className="w-4 h-4 text-theme-text-secondary" />
      </button>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-theme-text">Clean Architecture Metrics</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-theme-hover rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="p-2 bg-theme-bg-secondary rounded border border-theme-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={card.color}>{card.icon}</span>
              <span className="text-xs text-theme-text-secondary">{card.label}</span>
            </div>
            <div className="text-sm font-medium">{card.value}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-theme-border">
        <button
          onClick={() => {
            queryClient.clear()
            logger.info('Query cache cleared')
          }}
          className="text-xs text-theme-text-secondary hover:text-theme-text"
        >
          Clear Query Cache
        </button>
      </div>
    </div>
  )
})

CleanArchPerformanceDashboard.displayName = 'CleanArchPerformanceDashboard'

export default CleanArchPerformanceDashboard