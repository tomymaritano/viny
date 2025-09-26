import React, { useState } from 'react'
import {
  Filter,
  Download,
  Maximize2,
  RefreshCw,
  Settings,
  Search,
  Layers,
} from 'lucide-react'
import { useKnowledgeStore } from '../../stores/knowledgeStore'
import type { GraphNode } from '../../types/knowledge'

export const GraphToolbar: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const { graphFilters, updateGraphFilters, graphData } = useKnowledgeStore()

  const nodeTypes: GraphNode['type'][] = ['note', 'tag', 'notebook', 'concept']

  const handleTypeToggle = (type: GraphNode['type']) => {
    const newTypes = new Set(graphFilters.nodeTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    updateGraphFilters({ nodeTypes: newTypes })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(graphData, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      {/* Main toolbar */}
      <div className="flex gap-1 bg-background/90 border rounded-lg p-1 backdrop-blur">
        <button
          className="p-2 hover:bg-accent rounded transition-colors"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter"
        >
          <Filter className="w-4 h-4" />
        </button>

        <button
          className="p-2 hover:bg-accent rounded transition-colors"
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          className="p-2 hover:bg-accent rounded transition-colors"
          onClick={() => document.documentElement.requestFullscreen()}
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          className="p-2 hover:bg-accent rounded transition-colors"
          onClick={handleExport}
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-background/90 border rounded-lg p-4 backdrop-blur min-w-[200px]">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Node Types
          </h3>

          <div className="space-y-2">
            {nodeTypes.map(type => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={graphFilters.nodeTypes.has(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="rounded"
                />
                <span className="text-sm capitalize">{type}s</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({graphData.nodes.filter(n => n.type === type).length})
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Graph Stats</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Nodes: {graphData.nodes.length}</div>
              <div>Edges: {graphData.edges.length}</div>
              <div>Clusters: {graphData.clusters?.length || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GraphToolbar
