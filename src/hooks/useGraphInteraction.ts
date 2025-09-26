import { useState, useCallback } from 'react'
import { useKnowledgeStore } from '../stores/knowledgeStore'

export const useGraphInteraction = () => {
  const { selectedNodeId, selectNode, graphData } = useKnowledgeStore()
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      selectNode(nodeId === selectedNodeId ? null : nodeId)
    },
    [selectedNodeId, selectNode]
  )

  const handleNodeDragStart = useCallback((nodeId: string) => {
    setDraggedNodeId(nodeId)
  }, [])

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNodeId(null)
  }, [])

  const getConnectedNodes = useCallback(
    (nodeId: string) => {
      const connected = new Set<string>()
      graphData.edges.forEach(edge => {
        const sourceId =
          typeof edge.source === 'string' ? edge.source : edge.source.id
        const targetId =
          typeof edge.target === 'string' ? edge.target : edge.target.id

        if (sourceId === nodeId) connected.add(targetId)
        if (targetId === nodeId) connected.add(sourceId)
      })
      return Array.from(connected)
    },
    [graphData]
  )

  const getNodeDegree = useCallback(
    (nodeId: string) => {
      return graphData.edges.filter(edge => {
        const sourceId =
          typeof edge.source === 'string' ? edge.source : edge.source.id
        const targetId =
          typeof edge.target === 'string' ? edge.target : edge.target.id
        return sourceId === nodeId || targetId === nodeId
      }).length
    },
    [graphData]
  )

  const getNodesByType = useCallback(
    (type: string) => {
      return graphData.nodes.filter(node => node.type === type)
    },
    [graphData]
  )

  const getShortestPath = useCallback(
    (startId: string, endId: string) => {
      // Dijkstra's algorithm for shortest path
      const distances: { [key: string]: number } = {}
      const previous: { [key: string]: string | null } = {}
      const unvisited = new Set(graphData.nodes.map(n => n.id))

      // Initialize distances
      graphData.nodes.forEach(node => {
        distances[node.id] = node.id === startId ? 0 : Infinity
        previous[node.id] = null
      })

      while (unvisited.size > 0) {
        // Find unvisited node with minimum distance
        let currentId: string | null = null
        let minDistance = Infinity

        unvisited.forEach(nodeId => {
          if (distances[nodeId] < minDistance) {
            minDistance = distances[nodeId]
            currentId = nodeId
          }
        })

        if (currentId === null || currentId === endId) break

        unvisited.delete(currentId)

        // Update distances for neighbors
        const neighbors = getConnectedNodes(currentId)
        neighbors.forEach(neighborId => {
          if (unvisited.has(neighborId)) {
            const edge = graphData.edges.find(e => {
              const sourceId =
                typeof e.source === 'string' ? e.source : e.source.id
              const targetId =
                typeof e.target === 'string' ? e.target : e.target.id
              return (
                (sourceId === currentId && targetId === neighborId) ||
                (targetId === currentId && sourceId === neighborId)
              )
            })

            const distance = distances[currentId] + (edge ? 1 / edge.weight : 1)

            if (distance < distances[neighborId]) {
              distances[neighborId] = distance
              previous[neighborId] = currentId
            }
          }
        })
      }

      // Reconstruct path
      const path: string[] = []
      let current: string | null = endId

      while (current !== null) {
        path.unshift(current)
        current = previous[current]
      }

      return path[0] === startId ? path : []
    },
    [graphData, getConnectedNodes]
  )

  return {
    selectedNodeId,
    hoveredNodeId,
    draggedNodeId,
    setHoveredNodeId,
    handleNodeClick,
    handleNodeDragStart,
    handleNodeDragEnd,
    getConnectedNodes,
    getNodeDegree,
    getNodesByType,
    getShortestPath,
  }
}
