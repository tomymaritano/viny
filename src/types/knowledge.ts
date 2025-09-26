// Knowledge Graph Types
export interface GraphNode {
  id: string
  type: 'note' | 'tag' | 'notebook' | 'concept'
  label: string
  data: {
    noteId?: string
    title: string
    content?: string
    createdAt: Date
    updatedAt: Date
    tags: string[]
    notebookId?: string
    wordCount?: number
    backlinks: string[]
    forwardLinks: string[]
  }
  position?: { x: number; y: number }
  style?: {
    color: string
    size: number
    shape: 'circle' | 'square' | 'diamond'
  }
  // D3 specific properties
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  id: string
  source: string | GraphNode
  target: string | GraphNode
  type: 'reference' | 'tag' | 'notebook' | 'similarity'
  weight: number
  label?: string
  style?: {
    color: string
    width: number
    dashed?: boolean
    strokeDasharray?: string
  }
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  clusters?: GraphCluster[]
}

export interface GraphCluster {
  id: string
  label: string
  nodeIds: string[]
  color: string
  collapsed: boolean
}

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: {
    noteIds: string[]
    notebookIds: string[]
    tags: string[]
  }
  streaming?: boolean
  error?: string
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata: {
    totalTokens?: number
    model?: string
  }
}

// Connection Types
export interface ConnectionSuggestion {
  noteId: string
  title: string
  reason: string
  confidence: number
  type: 'similar-content' | 'shared-tags' | 'temporal' | 'reference'
}

// Heatmap Types
export interface HeatmapData {
  date: Date
  count: number
  notes?: string[]
}

// Layout Types
export type GraphLayout = 'force' | 'hierarchical' | 'radial'

// Graph Update Types
export type GraphUpdate =
  | { type: 'addNode'; node: GraphNode }
  | { type: 'updateNode'; node: GraphNode }
  | { type: 'removeNode'; nodeId: string }
  | { type: 'addEdge'; edge: GraphEdge }
  | { type: 'removeEdge'; edgeId: string }
  | { type: 'updateCluster'; cluster: GraphCluster }

// Metrics Types
export interface GraphMetrics {
  nodeCount: number
  edgeCount: number
  avgDegree: number
  density: number
  mostConnected: [string, number][]
  clustering: number
}

// Search Options
export interface SearchOptions {
  limit?: number
  threshold?: number
  includeContent?: boolean
  notebookIds?: string[]
  tags?: string[]
  dateRange?: [Date, Date]
}

// Cluster Result
export interface ClusterResult {
  centroid: number[]
  notes: any[]
}

// Chat Response
export interface ChatResponse {
  stream: ReadableStream<Uint8Array>
  context: ChatMessage['context']
}
