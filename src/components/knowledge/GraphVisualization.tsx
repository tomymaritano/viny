import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useTheme } from '../../theme/useTheme'
import { useKnowledgeStore } from '../../stores/knowledgeStore'
import type { GraphNode, GraphEdge, GraphData } from '../../types/knowledge'
import { useGraphInteraction } from '../../hooks/useGraphInteraction'
import { useGraphTheme } from '../../hooks/useGraphTheme'
import { debounce } from '../../utils/debounce'

interface GraphVisualizationProps {
  className?: string
  onNodeClick?: (node: GraphNode) => void
  onNodeHover?: (node: GraphNode | null) => void
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  className = '',
  onNodeClick,
  onNodeHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)

  const { graphData, selectedNodeId, graphLayout } = useKnowledgeStore()
  const { theme } = useTheme()
  const graphTheme = useGraphTheme()
  const {
    hoveredNodeId,
    setHoveredNodeId,
    handleNodeClick: handleNodeInteraction,
    getConnectedNodes,
  } = useGraphInteraction()

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [transform, setTransform] = useState(d3.zoomIdentity)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = debounce(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }, 300)

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize and update graph
  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions

    // Clear previous content
    svg.selectAll('*').remove()

    // Create groups
    const g = svg.append('g').attr('class', 'graph-container')
    const linksGroup = g.append('g').attr('class', 'links')
    const nodesGroup = g.append('g').attr('class', 'nodes')
    const labelsGroup = g.append('g').attr('class', 'labels')

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform)
        setTransform(event.transform)
      })

    svg.call(zoom)

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(graphData.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(graphData.edges)
          .id(d => d.id)
          .distance(d => 100 * (1 / (d.weight || 1)))
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    simulationRef.current = simulation

    // Draw edges
    const links = linksGroup
      .selectAll('line')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('stroke', d => graphTheme.edge[d.type].stroke)
      .attr('stroke-width', d => graphTheme.edge[d.type].strokeWidth)
      .attr('stroke-dasharray', d =>
        d.type === 'similarity' ? graphTheme.edge[d.type].strokeDasharray : null
      )
      .attr('opacity', 0.6)

    // Draw nodes
    const nodes = nodesGroup
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.style?.size || 20)
      .attr('fill', d => graphTheme.node[d.type].fill)
      .attr('stroke', d => graphTheme.node[d.type].stroke)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        handleNodeInteraction(d.id)
        onNodeClick?.(d)
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id)
        onNodeHover?.(d)
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null)
        onNodeHover?.(null)
      })
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    // Draw labels
    const labels = labelsGroup
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', d => graphTheme.node[d.type].text)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .style('pointer-events', 'none')
      .style('user-select', 'none')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y)

      nodes.attr('cx', d => d.x!).attr('cy', d => d.y!)

      labels.attr('x', d => d.x!).attr('y', d => d.y!)
    })

    // Highlight selected/hovered nodes
    const updateHighlights = () => {
      const connectedNodes = selectedNodeId
        ? getConnectedNodes(selectedNodeId)
        : []

      nodes
        .attr('opacity', d => {
          if (!selectedNodeId) return 1
          if (d.id === selectedNodeId || connectedNodes.includes(d.id)) return 1
          return 0.3
        })
        .attr('stroke-width', d => {
          if (d.id === selectedNodeId) return 4
          if (d.id === hoveredNodeId) return 3
          return 2
        })

      links.attr('opacity', d => {
        if (!selectedNodeId) return 0.6
        const source = typeof d.source === 'string' ? d.source : d.source.id
        const target = typeof d.target === 'string' ? d.target : d.target.id
        if (source === selectedNodeId || target === selectedNodeId) return 1
        return 0.1
      })

      labels
        .attr('opacity', d => {
          if (!selectedNodeId) return 1
          if (d.id === selectedNodeId || connectedNodes.includes(d.id)) return 1
          return 0.3
        })
        .attr('font-weight', d => (d.id === selectedNodeId ? 'bold' : 'normal'))
    }

    updateHighlights()

    // Clean up
    return () => {
      simulation.stop()
    }
  }, [graphData, dimensions, theme, selectedNodeId, hoveredNodeId])

  // Handle layout changes
  useEffect(() => {
    if (!simulationRef.current) return

    const simulation = simulationRef.current

    switch (graphLayout) {
      case 'hierarchical':
        // Apply hierarchical layout forces
        simulation
          .force(
            'link',
            d3
              .forceLink<GraphNode, GraphEdge>(graphData.edges)
              .id(d => d.id)
              .distance(150)
              .strength(1)
          )
          .force('charge', d3.forceManyBody().strength(-100))
          .force(
            'y',
            d3
              .forceY(d => {
                // Calculate depth based on connections
                const depth = calculateNodeDepth(d, graphData)
                return 100 + depth * 150
              })
              .strength(0.9)
          )
        break

      case 'radial':
        // Apply radial layout forces
        const center = { x: dimensions.width / 2, y: dimensions.height / 2 }
        simulation
          .force(
            'r',
            d3
              .forceRadial(
                d => {
                  const depth = calculateNodeDepth(d, graphData)
                  return depth * 100
                },
                center.x,
                center.y
              )
              .strength(0.9)
          )
          .force('charge', d3.forceManyBody().strength(-50))
        break

      default: // 'force'
        // Default force-directed layout
        simulation
          .force(
            'link',
            d3
              .forceLink<GraphNode, GraphEdge>(graphData.edges)
              .id(d => d.id)
              .distance(d => 100 * (1 / (d.weight || 1)))
          )
          .force('charge', d3.forceManyBody().strength(-300))
          .force(
            'center',
            d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
          )
    }

    simulation.alpha(1).restart()
  }, [graphLayout, graphData, dimensions])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ background: graphTheme.background }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={graphTheme.edge.reference.stroke}
            />
          </marker>
        </defs>
      </svg>

      {/* Minimap */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-background/90 border rounded-lg p-2">
        <MinimapVisualization
          graphData={graphData}
          viewport={{
            x: -transform.x / transform.k,
            y: -transform.y / transform.k,
            width: dimensions.width / transform.k,
            height: dimensions.height / transform.k,
          }}
          theme={graphTheme}
        />
      </div>

      {/* Controls */}
      <GraphControls
        onZoomIn={() => handleZoom(1.2)}
        onZoomOut={() => handleZoom(0.8)}
        onZoomReset={() => handleZoomReset()}
        onLayoutChange={layout =>
          useKnowledgeStore.getState().setGraphLayout(layout)
        }
        currentLayout={graphLayout}
      />
    </div>
  )

  function handleZoom(scale: number) {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(300)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleTo as any, scale)
  }

  function handleZoomReset() {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(300)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity)
  }
}

// Helper functions
function calculateNodeDepth(node: GraphNode, graphData: GraphData): number {
  // Simple depth calculation based on incoming edges
  const incomingEdges = graphData.edges.filter(
    e => (typeof e.target === 'string' ? e.target : e.target.id) === node.id
  )

  if (incomingEdges.length === 0) return 0

  const parentDepths = incomingEdges.map(edge => {
    const sourceId =
      typeof edge.source === 'string' ? edge.source : edge.source.id
    const sourceNode = graphData.nodes.find(n => n.id === sourceId)
    return sourceNode ? calculateNodeDepth(sourceNode, graphData) : 0
  })

  return Math.max(...parentDepths) + 1
}

// Minimap component
const MinimapVisualization: React.FC<{
  graphData: GraphData
  viewport: { x: number; y: number; width: number; height: number }
  theme: any
}> = ({ graphData, viewport, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const bounds = {
      minX: Math.min(...graphData.nodes.map(n => n.x || 0)),
      maxX: Math.max(...graphData.nodes.map(n => n.x || 0)),
      minY: Math.min(...graphData.nodes.map(n => n.y || 0)),
      maxY: Math.max(...graphData.nodes.map(n => n.y || 0)),
    }

    const padding = 20
    const scaleX = d3
      .scaleLinear()
      .domain([bounds.minX - padding, bounds.maxX + padding])
      .range([0, 176])
    const scaleY = d3
      .scaleLinear()
      .domain([bounds.minY - padding, bounds.maxY + padding])
      .range([0, 128])

    // Draw nodes
    svg
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('cx', d => scaleX(d.x || 0))
      .attr('cy', d => scaleY(d.y || 0))
      .attr('r', 2)
      .attr('fill', theme.node.note.fill)

    // Draw viewport
    svg
      .append('rect')
      .attr('x', scaleX(viewport.x))
      .attr('y', scaleY(viewport.y))
      .attr('width', scaleX(viewport.x + viewport.width) - scaleX(viewport.x))
      .attr('height', scaleY(viewport.y + viewport.height) - scaleY(viewport.y))
      .attr('fill', 'none')
      .attr('stroke', theme.node.note.stroke)
      .attr('stroke-width', 2)
  }, [graphData, viewport, theme])

  return <svg ref={svgRef} width="176" height="128" className="w-full h-full" />
}

// Graph controls component
const GraphControls: React.FC<{
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onLayoutChange: (layout: string) => void
  currentLayout: string
}> = ({ onZoomIn, onZoomOut, onZoomReset, onLayoutChange, currentLayout }) => {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      <div className="flex gap-1 bg-background/90 border rounded-lg p-1">
        <button
          className="p-2 hover:bg-accent rounded"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          className="p-2 hover:bg-accent rounded"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          className="p-2 hover:bg-accent rounded"
          onClick={onZoomReset}
          title="Reset Zoom"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5h-4m4 0v-4"
            />
          </svg>
        </button>
      </div>

      <select
        className="bg-background/90 border rounded-lg px-3 py-2 text-sm"
        value={currentLayout}
        onChange={e => onLayoutChange(e.target.value)}
      >
        <option value="force">Force Layout</option>
        <option value="hierarchical">Hierarchical</option>
        <option value="radial">Radial</option>
      </select>
    </div>
  )
}

export default GraphVisualization
