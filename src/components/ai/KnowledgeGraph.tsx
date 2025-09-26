/**
 * KnowledgeGraph - Interactive visualization of note relationships
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '../../stores/newSimpleStore'
import {
  graphDataService,
  type GraphData,
  type GraphNode,
  type GraphLink,
} from '../../services/ai/GraphDataService'
import { Icons } from '../Icons'
import { cn } from '../../lib/utils'
import { logger } from '../../utils/logger'

interface KnowledgeGraphProps {
  className?: string
  onSelectNote?: (noteId: string) => void
}

interface SimulationNode extends GraphNode {
  x: number
  y: number
  vx: number
  vy: number
}

// Simple force simulation implementation
class ForceSimulation {
  nodes: SimulationNode[]
  links: GraphLink[]
  width: number
  height: number
  alpha = 1
  alphaDecay = 0.02

  constructor(
    nodes: GraphNode[],
    links: GraphLink[],
    width: number,
    height: number
  ) {
    this.nodes = nodes.map(n => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    }))
    this.links = links
    this.width = width
    this.height = height
  }

  tick() {
    // Apply forces
    this.applyLinkForce()
    this.applyChargeForce()
    this.applyCenterForce()

    // Update positions
    this.nodes.forEach(node => {
      node.vx *= 0.6 // friction
      node.vy *= 0.6
      node.x += node.vx
      node.y += node.vy

      // Keep nodes within bounds
      node.x = Math.max(20, Math.min(this.width - 20, node.x))
      node.y = Math.max(20, Math.min(this.height - 20, node.y))
    })

    this.alpha -= this.alphaDecay
    return this.alpha > 0
  }

  private applyLinkForce() {
    this.links.forEach(link => {
      const source = this.nodes.find(n => n.id === link.source)
      const target = this.nodes.find(n => n.id === link.target)
      if (!source || !target) return

      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const strength = 0.1 * this.alpha

      if (distance > 0) {
        const force = (strength * (distance - 100)) / distance
        const fx = dx * force
        const fy = dy * force

        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      }
    })
  }

  private applyChargeForce() {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const node1 = this.nodes[i]
        const node2 = this.nodes[j]

        const dx = node2.x - node1.x
        const dy = node2.y - node1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0 && distance < 200) {
          const force = (-30 * this.alpha) / (distance * distance)
          const fx = dx * force
          const fy = dy * force

          node1.vx += fx
          node1.vy += fy
          node2.vx -= fx
          node2.vy -= fy
        }
      }
    }
  }

  private applyCenterForce() {
    const cx = this.width / 2
    const cy = this.height / 2
    const strength = 0.1 * this.alpha

    this.nodes.forEach(node => {
      node.vx += (cx - node.x) * strength
      node.vy += (cy - node.y) * strength
    })
  }
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  className,
  onSelectNote,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Filter states
  const [showTags, setShowTags] = useState(true)
  const [showNotebooks, setShowNotebooks] = useState(true)
  const [showSemanticLinks, setShowSemanticLinks] = useState(true)

  const { notes, currentNote, setSelectedNoteId, setIsEditorOpen } =
    useAppStore()

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: width || 800, height: height || 600 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Generate graph data
  useEffect(() => {
    generateGraph()
  }, [notes])

  const generateGraph = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await graphDataService.generateGraphData(notes)
      setGraphData(data)
    } catch (err) {
      logger.error('Failed to generate graph', err)
      setError('Failed to generate graph')
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters
  const filteredData = graphData
    ? graphDataService.filterGraphData(graphData, {
        showTags,
        showNotebooks,
        showSemanticLinks,
      })
    : null

  // Run force simulation
  useEffect(() => {
    if (!filteredData || !svgRef.current) return

    const simulation = new ForceSimulation(
      filteredData.nodes,
      filteredData.links,
      dimensions.width,
      dimensions.height
    )

    const animate = () => {
      const shouldContinue = simulation.tick()

      // Update SVG
      if (svgRef.current) {
        // Update node positions
        const nodeElements = svgRef.current.querySelectorAll('.graph-node')
        nodeElements.forEach((el, i) => {
          const node = simulation.nodes[i]
          if (node) {
            el.setAttribute('transform', `translate(${node.x},${node.y})`)
          }
        })

        // Update link positions
        const linkElements = svgRef.current.querySelectorAll('.graph-link')
        linkElements.forEach((el, i) => {
          const link = filteredData.links[i]
          const source = simulation.nodes.find(n => n.id === link.source)
          const target = simulation.nodes.find(n => n.id === link.target)

          if (source && target) {
            el.setAttribute('x1', String(source.x))
            el.setAttribute('y1', String(source.y))
            el.setAttribute('x2', String(target.x))
            el.setAttribute('y2', String(target.y))
          }
        })
      }

      if (shouldContinue) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [filteredData, dimensions])

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node.id)

      if (node.type === 'note' && node.metadata?.noteId) {
        setSelectedNoteId(node.metadata.noteId)
        setIsEditorOpen(false)
        onSelectNote?.(node.metadata.noteId)
      }
    },
    [setSelectedNoteId, setIsEditorOpen, onSelectNote]
  )

  const getNodeColor = (node: GraphNode) => {
    switch (node.type) {
      case 'note':
        return node.id === `note_${currentNote?.id}` ? '#3b82f6' : '#6366f1'
      case 'tag':
        return '#10b981'
      case 'notebook':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getLinkColor = (link: GraphLink) => {
    switch (link.type) {
      case 'semantic':
        return `rgba(99, 102, 241, ${link.value * 0.6})`
      case 'tag':
        return 'rgba(16, 185, 129, 0.3)'
      case 'notebook':
        return 'rgba(245, 158, 11, 0.3)'
      default:
        return 'rgba(107, 114, 128, 0.3)'
    }
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center">
          <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-theme-text-muted">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative h-full', className)}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-theme-bg-primary/90 backdrop-blur p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold text-theme-text-primary mb-2">
          Filters
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showTags}
              onChange={e => setShowTags(e.target.checked)}
              className="rounded"
            />
            Tags
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showNotebooks}
              onChange={e => setShowNotebooks(e.target.checked)}
              className="rounded"
            />
            Notebooks
          </label>
          <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showSemanticLinks}
              onChange={e => setShowSemanticLinks(e.target.checked)}
              className="rounded"
            />
            Semantic Links
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-theme-bg-primary/90 backdrop-blur p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold text-theme-text-primary mb-2">
          Legend
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
            <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
            Notes
          </div>
          <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            Tags
          </div>
          <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            Notebooks
          </div>
        </div>
      </div>

      {/* Graph */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Icons.Loader className="w-8 h-8 animate-spin text-theme-text-muted" />
        </div>
      ) : filteredData ? (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        >
          {/* Links */}
          <g className="links">
            {filteredData.links.map((link, i) => (
              <line
                key={`link-${i}`}
                className="graph-link"
                stroke={getLinkColor(link)}
                strokeWidth={link.type === 'semantic' ? link.value * 3 : 1}
              />
            ))}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {filteredData.nodes.map((node, i) => (
              <g
                key={node.id}
                className="graph-node cursor-pointer"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  r={node.size}
                  fill={getNodeColor(node)}
                  stroke={selectedNode === node.id ? '#fff' : 'transparent'}
                  strokeWidth={2}
                  opacity={hoveredNode && hoveredNode !== node.id ? 0.3 : 1}
                />

                {/* Label */}
                {(hoveredNode === node.id ||
                  selectedNode === node.id ||
                  node.size > 10) && (
                  <text
                    x={0}
                    y={node.size + 15}
                    textAnchor="middle"
                    className="text-xs fill-theme-text-primary pointer-events-none"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      ) : null}
    </div>
  )
}
