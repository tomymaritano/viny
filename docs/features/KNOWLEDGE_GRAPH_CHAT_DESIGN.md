# Knowledge Graph & Chat Features Design for Viny

## 1. Knowledge Graph Visualization

### Library Evaluation

| Library          | Pros                                                              | Cons                                                  | Recommendation |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | -------------- |
| **D3.js**        | - Full control<br>- Best performance<br>- Unlimited customization | - Steep learning curve<br>- More code required        | ⭐⭐⭐⭐       |
| **Cytoscape.js** | - Graph-specific<br>- Many layouts<br>- Good performance          | - Less React-friendly<br>- Heavy library              | ⭐⭐⭐         |
| **vis.js**       | - Easy to use<br>- Good defaults                                  | - Less customizable<br>- Performance issues at scale  | ⭐⭐           |
| **React Flow**   | - React native<br>- Modern API<br>- Good DX                       | - Less suitable for large graphs<br>- Limited layouts | ⭐⭐⭐         |

**Recommendation:** Use **D3.js** with React wrapper for maximum performance and customization.

### Data Structure Design

```typescript
// Graph data structures
interface GraphNode {
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
}

interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'reference' | 'tag' | 'notebook' | 'similarity'
  weight: number
  label?: string
  style?: {
    color: string
    width: number
    dashed?: boolean
  }
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  clusters?: GraphCluster[]
}

interface GraphCluster {
  id: string
  label: string
  nodeIds: string[]
  color: string
  collapsed: boolean
}
```

### Layout Algorithms Implementation

```typescript
// Force-directed layout using D3
import * as d3 from 'd3'

export class ForceDirectedLayout {
  private simulation: d3.Simulation<GraphNode, GraphEdge>

  constructor(
    private nodes: GraphNode[],
    private edges: GraphEdge[],
    private width: number,
    private height: number
  ) {
    this.initializeSimulation()
  }

  private initializeSimulation() {
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(this.edges)
          .id(d => d.id)
          .distance(d => 100 * (1 / d.weight))
          .strength(d => d.weight)
      )
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force(
        'collision',
        d3.forceCollide().radius(d => d.style?.size || 30)
      )
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
  }

  tick(callback: () => void) {
    this.simulation.on('tick', callback)
  }

  restart() {
    this.simulation.alpha(1).restart()
  }
}

// Hierarchical layout
export class HierarchicalLayout {
  layout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
    const hierarchy = d3
      .stratify<GraphNode>()
      .id(d => d.id)
      .parentId(d => {
        const parent = edges.find(e => e.target === d.id)
        return parent?.source
      })

    const root = hierarchy(nodes)
    const treeLayout = d3
      .tree<GraphNode>()
      .size([this.width, this.height])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2))

    const tree = treeLayout(root)

    return tree.descendants().map(d => ({
      ...d.data,
      position: { x: d.x, y: d.y },
    }))
  }
}
```

### Performance Optimization for 1000+ Nodes

```typescript
// WebGL-accelerated rendering with Pixi.js
import * as PIXI from 'pixi.js'

export class WebGLGraphRenderer {
  private app: PIXI.Application
  private viewport: PIXI.Container
  private nodeContainer: PIXI.Container
  private edgeContainer: PIXI.Container
  private nodeSprites: Map<string, PIXI.Sprite>

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      antialias: true,
      resolution: window.devicePixelRatio,
    })

    this.viewport = new PIXI.Container()
    this.edgeContainer = new PIXI.Container()
    this.nodeContainer = new PIXI.Container()
    this.nodeSprites = new Map()

    this.viewport.addChild(this.edgeContainer)
    this.viewport.addChild(this.nodeContainer)
    this.app.stage.addChild(this.viewport)
  }

  // Culling for performance
  cullNodes(bounds: PIXI.Rectangle) {
    this.nodeSprites.forEach((sprite, id) => {
      sprite.visible = bounds.contains(sprite.x, sprite.y)
    })
  }

  // LOD (Level of Detail) system
  updateLOD(zoomLevel: number) {
    const showLabels = zoomLevel > 0.5
    const showDetails = zoomLevel > 1.0

    this.nodeSprites.forEach(sprite => {
      const label = sprite.getChildByName('label')
      if (label) label.visible = showLabels

      const details = sprite.getChildByName('details')
      if (details) details.visible = showDetails
    })
  }
}

// Virtual scrolling for node list
export const useVirtualizedNodes = (
  nodes: GraphNode[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    nodes.length
  )

  const visibleNodes = nodes.slice(startIndex, endIndex)
  const totalHeight = nodes.length * itemHeight
  const offsetY = startIndex * itemHeight

  return { visibleNodes, totalHeight, offsetY, setScrollTop }
}
```

## 2. Chat Interface Design

### UI Components

```typescript
// Chat message types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    noteIds: string[];
    notebookIds: string[];
    tags: string[];
  };
  streaming?: boolean;
  error?: string;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalTokens?: number;
    model?: string;
  };
}

// Main chat component
export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <ChatHeader
        onNewChat={handleNewChat}
        onToggleContext={() => setShowContext(!showContext)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              showContext={showContext}
            />
          ))}
          {isStreaming && <StreamingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onCommand={handleCommand}
        disabled={isStreaming}
      />
    </div>
  );
};

// Streaming response handler
export const useStreamingResponse = () => {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async (
    prompt: string,
    onChunk: (chunk: string) => void
  ) => {
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamedContent(prev => prev + chunk);
        onChunk(chunk);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return { streamedContent, isStreaming, startStreaming };
};

// Context visualization component
export const ContextVisualization: React.FC<{
  context: ChatMessage['context'];
}> = ({ context }) => {
  const { notes } = useNotes();
  const contextNotes = notes.filter(n => context?.noteIds.includes(n.id));

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
      <div className="text-xs text-muted-foreground mb-2">
        Context used for this response:
      </div>
      <div className="space-y-1">
        {contextNotes.map(note => (
          <div
            key={note.id}
            className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
            onClick={() => navigateToNote(note.id)}
          >
            <FileText className="w-3 h-3" />
            <span>{note.title}</span>
          </div>
        ))}
        {context?.tags.map(tag => (
          <div key={tag} className="inline-flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span className="text-xs">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Slash Commands Implementation

```typescript
interface SlashCommand {
  command: string;
  description: string;
  icon: React.ComponentType;
  handler: (args: string) => Promise<void>;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/search',
    description: 'Search through all notes',
    icon: Search,
    handler: async (query) => {
      const results = await searchNotes(query);
      return formatSearchResults(results);
    }
  },
  {
    command: '/summarize',
    description: 'Summarize selected notes',
    icon: FileText,
    handler: async (noteIds) => {
      const notes = await getNotesByIds(noteIds.split(','));
      return await generateSummary(notes);
    }
  },
  {
    command: '/graph',
    description: 'Show knowledge graph for topic',
    icon: Network,
    handler: async (topic) => {
      return await generateTopicGraph(topic);
    }
  },
  {
    command: '/timeline',
    description: 'Show timeline of notes',
    icon: Calendar,
    handler: async (dateRange) => {
      return await generateTimeline(dateRange);
    }
  }
];

// Command palette component
export const CommandPalette: React.FC<{
  onSelect: (command: SlashCommand) => void;
  filter: string;
}> = ({ onSelect, filter }) => {
  const filtered = SLASH_COMMANDS.filter(cmd =>
    cmd.command.includes(filter.toLowerCase())
  );

  return (
    <div className="absolute bottom-full mb-2 w-full max-w-md bg-popover border rounded-lg shadow-lg">
      {filtered.map(cmd => (
        <button
          key={cmd.command}
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-accent"
          onClick={() => onSelect(cmd)}
        >
          <cmd.icon className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">{cmd.command}</div>
            <div className="text-xs text-muted-foreground">
              {cmd.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
```

## 3. System Integration

### RAG Integration Architecture

```typescript
// RAG service integration
export class RAGChatService {
  private vectorStore: VectorStore
  private llmClient: LLMClient
  private contextBuilder: ContextBuilder

  async processQuery(
    query: string,
    options: {
      maxContext?: number
      includeGraph?: boolean
      conversationId?: string
    }
  ): Promise<ChatResponse> {
    // 1. Retrieve relevant context
    const relevantDocs = await this.vectorStore.search(query, {
      limit: options.maxContext || 10,
      threshold: 0.7,
    })

    // 2. Build graph context if requested
    let graphContext = ''
    if (options.includeGraph) {
      const graph = await this.buildLocalGraph(relevantDocs)
      graphContext = this.summarizeGraph(graph)
    }

    // 3. Construct prompt with context
    const context = this.contextBuilder.build({
      documents: relevantDocs,
      graphSummary: graphContext,
      conversationHistory: await this.getConversationHistory(
        options.conversationId
      ),
    })

    // 4. Stream response
    const stream = await this.llmClient.streamCompletion({
      prompt: this.buildPrompt(query, context),
      temperature: 0.7,
      maxTokens: 2000,
    })

    return {
      stream,
      context: {
        noteIds: relevantDocs.map(d => d.id),
        notebookIds: [...new Set(relevantDocs.map(d => d.notebookId))],
        tags: [...new Set(relevantDocs.flatMap(d => d.tags))],
      },
    }
  }

  private async buildLocalGraph(documents: Document[]): Promise<GraphData> {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []

    // Create nodes for documents
    documents.forEach(doc => {
      nodes.push({
        id: doc.id,
        type: 'note',
        label: doc.title,
        data: {
          noteId: doc.id,
          title: doc.title,
          content: doc.content,
          tags: doc.tags,
          notebookId: doc.notebookId,
          backlinks: doc.backlinks || [],
          forwardLinks: doc.forwardLinks || [],
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      })
    })

    // Create edges based on references
    documents.forEach(doc => {
      doc.forwardLinks?.forEach(targetId => {
        if (documents.some(d => d.id === targetId)) {
          edges.push({
            id: `${doc.id}-${targetId}`,
            source: doc.id,
            target: targetId,
            type: 'reference',
            weight: 1,
          })
        }
      })
    })

    // Add similarity edges
    const similarities = await this.calculateSimilarities(documents)
    similarities.forEach(({ source, target, score }) => {
      if (score > 0.8) {
        edges.push({
          id: `sim-${source}-${target}`,
          source,
          target,
          type: 'similarity',
          weight: score,
        })
      }
    })

    return { nodes, edges }
  }
}
```

### Real-time Graph Updates

```typescript
// Graph update manager
export class GraphUpdateManager {
  private graphData: GraphData
  private subscribers: Set<(data: GraphData) => void>
  private updateQueue: GraphUpdate[]
  private batchTimer: NodeJS.Timeout | null

  constructor() {
    this.subscribers = new Set()
    this.updateQueue = []
    this.batchTimer = null
  }

  // Subscribe to graph updates
  subscribe(callback: (data: GraphData) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Queue update for batching
  queueUpdate(update: GraphUpdate) {
    this.updateQueue.push(update)

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, 100) // 100ms debounce
    }
  }

  private processBatch() {
    const updates = [...this.updateQueue]
    this.updateQueue = []
    this.batchTimer = null

    // Apply updates to graph
    updates.forEach(update => {
      switch (update.type) {
        case 'addNode':
          this.graphData.nodes.push(update.node)
          break
        case 'updateNode':
          const nodeIndex = this.graphData.nodes.findIndex(
            n => n.id === update.node.id
          )
          if (nodeIndex >= 0) {
            this.graphData.nodes[nodeIndex] = update.node
          }
          break
        case 'removeNode':
          this.graphData.nodes = this.graphData.nodes.filter(
            n => n.id !== update.nodeId
          )
          this.graphData.edges = this.graphData.edges.filter(
            e => e.source !== update.nodeId && e.target !== update.nodeId
          )
          break
        case 'addEdge':
          this.graphData.edges.push(update.edge)
          break
        case 'removeEdge':
          this.graphData.edges = this.graphData.edges.filter(
            e => e.id !== update.edgeId
          )
          break
      }
    })

    // Notify subscribers
    this.notifySubscribers()
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.graphData)
    })
  }
}

// React hook for graph updates
export const useGraphUpdates = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  })
  const updateManager = useRef(new GraphUpdateManager())

  useEffect(() => {
    const unsubscribe = updateManager.current.subscribe(setGraphData)
    return unsubscribe
  }, [])

  const updateNode = useCallback((node: GraphNode) => {
    updateManager.current.queueUpdate({
      type: 'updateNode',
      node,
    })
  }, [])

  const addEdge = useCallback((edge: GraphEdge) => {
    updateManager.current.queueUpdate({
      type: 'addEdge',
      edge,
    })
  }, [])

  return { graphData, updateNode, addEdge }
}
```

### Conversation Persistence

```typescript
// Conversation repository
export class ConversationRepository {
  private db: IDatabase

  async saveConversation(conversation: ChatConversation): Promise<void> {
    await this.db.conversations.put({
      ...conversation,
      updatedAt: new Date(),
    })
  }

  async getConversation(id: string): Promise<ChatConversation | null> {
    return await this.db.conversations.get(id)
  }

  async listConversations(options: {
    limit?: number
    offset?: number
    orderBy?: 'createdAt' | 'updatedAt'
  }): Promise<ChatConversation[]> {
    return await this.db.conversations
      .orderBy(options.orderBy || 'updatedAt')
      .reverse()
      .offset(options.offset || 0)
      .limit(options.limit || 20)
      .toArray()
  }

  async searchConversations(query: string): Promise<ChatConversation[]> {
    // Full-text search in conversation content
    return await this.db.conversations
      .filter(
        conv =>
          conv.title.toLowerCase().includes(query.toLowerCase()) ||
          conv.messages.some(msg =>
            msg.content.toLowerCase().includes(query.toLowerCase())
          )
      )
      .toArray()
  }

  async exportConversation(
    id: string,
    format: 'json' | 'markdown'
  ): Promise<string> {
    const conversation = await this.getConversation(id)
    if (!conversation) throw new Error('Conversation not found')

    if (format === 'json') {
      return JSON.stringify(conversation, null, 2)
    }

    // Markdown format
    let markdown = `# ${conversation.title}\n\n`
    markdown += `Created: ${conversation.createdAt.toLocaleString()}\n\n`

    conversation.messages.forEach(msg => {
      markdown += `## ${msg.role === 'user' ? 'You' : 'Assistant'}\n`
      markdown += `${msg.content}\n\n`

      if (msg.context?.noteIds.length) {
        markdown += `*Context: ${msg.context.noteIds.length} notes*\n\n`
      }
    })

    return markdown
  }
}
```

## 4. UI/UX Design

### Layout Architecture

```typescript
// Main layout component
export const KnowledgeWorkspace: React.FC = () => {
  const [layout, setLayout] = useState<'chat' | 'graph' | 'split'>('split');
  const [splitRatio, setSplitRatio] = useState(0.5);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <WorkspaceHeader
        layout={layout}
        onLayoutChange={setLayout}
      />

      {/* Main content */}
      <div className="flex-1 flex">
        {(layout === 'chat' || layout === 'split') && (
          <div
            className="flex-1"
            style={{
              width: layout === 'split' ? `${splitRatio * 100}%` : '100%'
            }}
          >
            <ChatInterface />
          </div>
        )}

        {layout === 'split' && (
          <ResizeHandle
            onResize={setSplitRatio}
            orientation="vertical"
          />
        )}

        {(layout === 'graph' || layout === 'split') && (
          <div
            className="flex-1"
            style={{
              width: layout === 'split' ? `${(1 - splitRatio) * 100}%` : '100%'
            }}
          >
            <GraphVisualization />
          </div>
        )}
      </div>
    </div>
  );
};

// Responsive layout hook
export const useResponsiveLayout = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width < 1024;
  const recommendedLayout = isMobile ? 'chat' : isTablet ? 'graph' : 'split';

  return { windowSize, isMobile, isTablet, recommendedLayout };
};
```

### Loading & Error States

```typescript
// Loading states component
export const GraphLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          {/* Animated graph skeleton */}
          <svg className="w-full h-full animate-pulse">
            <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="64" cy="32" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="112" cy="16" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="32" cy="64" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="96" cy="64" r="4" fill="currentColor" opacity="0.3" />
            <line x1="16" y1="16" x2="64" y2="32" stroke="currentColor" opacity="0.2" />
            <line x1="64" y1="32" x2="112" y2="16" stroke="currentColor" opacity="0.2" />
            <line x1="32" y1="64" x2="64" y2="32" stroke="currentColor" opacity="0.2" />
            <line x1="96" y1="64" x2="64" y2="32" stroke="currentColor" opacity="0.2" />
          </svg>
        </div>
        <p className="text-muted-foreground">Building knowledge graph...</p>
      </div>
    </div>
  );
};

// Error boundary for graph
export const GraphErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <h3 className="text-lg font-semibold">
              Failed to load knowledge graph
            </h3>
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
            <Button onClick={retry} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Dark Mode Support

```typescript
// Theme-aware graph styles
export const useGraphTheme = () => {
  const { theme } = useTheme()

  return {
    node: {
      note: {
        fill: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        stroke: theme === 'dark' ? '#718096' : '#cbd5e0',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
      tag: {
        fill: theme === 'dark' ? '#553c9a' : '#d6bcfa',
        stroke: theme === 'dark' ? '#6b46c1' : '#b794f4',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
      notebook: {
        fill: theme === 'dark' ? '#2d3748' : '#f7fafc',
        stroke: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
    },
    edge: {
      reference: {
        stroke: theme === 'dark' ? '#4a5568' : '#cbd5e0',
        strokeWidth: 2,
      },
      similarity: {
        stroke: theme === 'dark' ? '#9f7aea' : '#d6bcfa',
        strokeWidth: 1,
        strokeDasharray: '5,5',
      },
      tag: {
        stroke: theme === 'dark' ? '#48bb78' : '#9ae6b4',
        strokeWidth: 1,
      },
    },
    background: theme === 'dark' ? '#1a202c' : '#ffffff',
    grid: theme === 'dark' ? '#2d3748' : '#f7fafc',
  }
}
```

## 5. React Component Architecture

### Component Hierarchy

```
KnowledgeWorkspace
├── WorkspaceHeader
│   ├── LayoutToggle
│   ├── SearchBar
│   └── WorkspaceActions
├── ChatInterface
│   ├── ChatHeader
│   │   ├── ConversationSelector
│   │   └── ChatActions
│   ├── MessageList
│   │   ├── ChatMessage
│   │   ├── ContextVisualization
│   │   └── StreamingIndicator
│   └── ChatInput
│       ├── CommandPalette
│       └── InputActions
└── GraphVisualization
    ├── GraphToolbar
    │   ├── LayoutSelector
    │   ├── FilterPanel
    │   └── GraphActions
    ├── GraphCanvas
    │   ├── NodeRenderer
    │   ├── EdgeRenderer
    │   └── InteractionLayer
    └── GraphSidebar
        ├── NodeDetails
        ├── ClusterList
        └── GraphStats
```

### State Management

```typescript
// Zustand store for knowledge features
interface KnowledgeStore {
  // Graph state
  graphData: GraphData
  selectedNodeId: string | null
  graphLayout: 'force' | 'hierarchical' | 'radial'
  graphFilters: {
    nodeTypes: Set<GraphNode['type']>
    dateRange?: [Date, Date]
    tags?: string[]
  }

  // Chat state
  conversations: ChatConversation[]
  activeConversationId: string | null
  streamingMessageId: string | null

  // Actions
  setGraphData: (data: GraphData) => void
  selectNode: (nodeId: string | null) => void
  setGraphLayout: (layout: string) => void
  updateGraphFilters: (filters: Partial<KnowledgeStore['graphFilters']>) => void

  addConversation: (conversation: ChatConversation) => void
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => ({
  // Initial state
  graphData: { nodes: [], edges: [] },
  selectedNodeId: null,
  graphLayout: 'force',
  graphFilters: {
    nodeTypes: new Set(['note', 'tag', 'notebook']),
  },
  conversations: [],
  activeConversationId: null,
  streamingMessageId: null,

  // Graph actions
  setGraphData: data => set({ graphData: data }),
  selectNode: nodeId => set({ selectedNodeId: nodeId }),
  setGraphLayout: layout => set({ graphLayout: layout }),
  updateGraphFilters: filters =>
    set(state => ({
      graphFilters: { ...state.graphFilters, ...filters },
    })),

  // Chat actions
  addConversation: conversation =>
    set(state => ({
      conversations: [...state.conversations, conversation],
    })),
  updateConversation: (id, updates) =>
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  setActiveConversation: id => set({ activeConversationId: id }),
  addMessage: (conversationId, message) =>
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      ),
    })),
}))
```

### Custom Hooks

```typescript
// Graph interaction hook
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
        if (edge.source === nodeId) connected.add(edge.target)
        if (edge.target === nodeId) connected.add(edge.source)
      })
      return Array.from(connected)
    },
    [graphData]
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
  }
}

// Chat context hook
export const useChatContext = (conversationId: string) => {
  const [context, setContext] = useState<ChatMessage['context']>({
    noteIds: [],
    notebookIds: [],
    tags: [],
  })

  const addNoteToContext = useCallback((noteId: string) => {
    setContext(prev => ({
      ...prev,
      noteIds: [...prev.noteIds, noteId],
    }))
  }, [])

  const removeNoteFromContext = useCallback((noteId: string) => {
    setContext(prev => ({
      ...prev,
      noteIds: prev.noteIds.filter(id => id !== noteId),
    }))
  }, [])

  const clearContext = useCallback(() => {
    setContext({ noteIds: [], notebookIds: [], tags: [] })
  }, [])

  return {
    context,
    addNoteToContext,
    removeNoteFromContext,
    clearContext,
  }
}
```

### Performance Optimizations

```typescript
// Memoized graph calculations
export const useGraphMetrics = (graphData: GraphData) => {
  const metrics = useMemo(() => {
    const nodeCount = graphData.nodes.length;
    const edgeCount = graphData.edges.length;

    // Calculate degree centrality
    const degrees = new Map<string, number>();
    graphData.edges.forEach(edge => {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    });

    // Find most connected nodes
    const sortedByDegree = Array.from(degrees.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Calculate clustering coefficient
    const clustering = calculateClusteringCoefficient(graphData);

    return {
      nodeCount,
      edgeCount,
      avgDegree: edgeCount * 2 / nodeCount,
      density: (2 * edgeCount) / (nodeCount * (nodeCount - 1)),
      mostConnected: sortedByDegree,
      clustering
    };
  }, [graphData]);

  return metrics;
};

// Virtualized node list for large graphs
export const VirtualizedNodeList: React.FC<{
  nodes: GraphNode[];
  onNodeClick: (node: GraphNode) => void;
}> = ({ nodes, onNodeClick }) => {
  const rowVirtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5
  });

  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <NodeListItem
              node={nodes[virtualItem.index]}
              onClick={() => onNodeClick(nodes[virtualItem.index])}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 6. Advanced Features

### Note Clustering

```typescript
// K-means clustering for notes
export class NoteClustering {
  async clusterNotes(notes: Note[], k: number = 5): Promise<GraphCluster[]> {
    // Get embeddings for all notes
    const embeddings = await this.getEmbeddings(notes)

    // Run k-means
    const clusters = this.kMeans(embeddings, k)

    // Create cluster objects
    return clusters.map((cluster, i) => ({
      id: `cluster-${i}`,
      label: this.generateClusterLabel(cluster.notes),
      nodeIds: cluster.notes.map(n => n.id),
      color: this.getClusterColor(i),
      collapsed: false,
    }))
  }

  private kMeans(embeddings: number[][], k: number): ClusterResult[] {
    // Initialize centroids
    const centroids = this.initializeCentroids(embeddings, k)

    let assignments: number[] = []
    let prevAssignments: number[] = []
    let iterations = 0

    while (
      !this.hasConverged(assignments, prevAssignments) &&
      iterations < 100
    ) {
      prevAssignments = [...assignments]

      // Assign points to nearest centroid
      assignments = embeddings.map(embedding =>
        this.getNearestCentroid(embedding, centroids)
      )

      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterPoints = embeddings.filter((_, j) => assignments[j] === i)
        if (clusterPoints.length > 0) {
          centroids[i] = this.calculateMean(clusterPoints)
        }
      }

      iterations++
    }

    // Group notes by cluster
    const clusters: ClusterResult[] = []
    for (let i = 0; i < k; i++) {
      clusters.push({
        centroid: centroids[i],
        notes: notes.filter((_, j) => assignments[j] === i),
      })
    }

    return clusters
  }
}
```

### Timeline View

```typescript
// Timeline component
export const TimelineView: React.FC<{
  notes: Note[];
  onNoteClick: (note: Note) => void;
}> = ({ notes, onNoteClick }) => {
  const timelineData = useMemo(() => {
    // Group notes by date
    const grouped = notes.reduce((acc, note) => {
      const date = format(note.createdAt, 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

    // Convert to timeline format
    return Object.entries(grouped)
      .map(([date, notes]) => ({
        date: new Date(date),
        notes: notes.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
        )
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [notes]);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline items */}
      <div className="space-y-8">
        {timelineData.map(({ date, notes }) => (
          <div key={date.toISOString()} className="relative">
            {/* Date marker */}
            <div className="absolute left-8 w-4 h-4 -ml-2 bg-primary rounded-full" />

            {/* Date label */}
            <div className="ml-16 mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(date, 'MMMM d, yyyy')}
              </h3>
            </div>

            {/* Notes for this date */}
            <div className="ml-16 space-y-2">
              {notes.map(note => (
                <button
                  key={note.id}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  onClick={() => onNoteClick(note)}
                >
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{format(note.createdAt, 'h:mm a')}</span>
                    <span>{note.wordCount} words</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Activity Heatmap

```typescript
// Activity heatmap component
export const ActivityHeatmap: React.FC<{
  notes: Note[];
  year?: number;
}> = ({ notes, year = new Date().getFullYear() }) => {
  const heatmapData = useMemo(() => {
    // Calculate activity by date
    const activity = notes.reduce((acc, note) => {
      const date = format(note.updatedAt, 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate full year of data
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const data: HeatmapData[] = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      data.push({
        date: new Date(d),
        count: activity[dateStr] || 0
      });
    }

    return data;
  }, [notes, year]);

  const maxActivity = Math.max(...heatmapData.map(d => d.count));

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxActivity;
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex gap-1 text-xs text-muted-foreground ml-8">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
          <div key={month} className="flex-1 text-center">{month}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="h-3"></div>
          <div className="h-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Activity squares */}
        <div className="grid grid-cols-53 gap-1">
          {heatmapData.map((data, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>
                <div
                  className={`w-3 h-3 rounded-sm ${getColor(data.count)}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {format(data.date, 'MMM d, yyyy')}: {data.count} notes
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
```

### Connection Suggestions

```typescript
// AI-powered connection suggestions
export const useConnectionSuggestions = (
  currentNote: Note,
  allNotes: Note[]
) => {
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSuggestions = async () => {
      setIsLoading(true);
      try {
        // Get embeddings
        const currentEmbedding = await getEmbedding(currentNote.content);
        const noteEmbeddings = await Promise.all(
          allNotes
            .filter(n => n.id !== currentNote.id)
            .map(async n => ({
              note: n,
              embedding: await getEmbedding(n.content)
            }))
        );

        // Calculate similarities
        const similarities = noteEmbeddings.map(({ note, embedding }) => ({
          note,
          similarity: cosineSimilarity(currentEmbedding, embedding)
        }));

        // Filter and sort suggestions
        const topSuggestions = similarities
          .filter(s => s.similarity > 0.7)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5)
          .map(({ note, similarity }) => ({
            noteId: note.id,
            title: note.title,
            reason: this.generateReason(currentNote, note, similarity),
            confidence: similarity,
            type: this.determineConnectionType(currentNote, note)
          }));

        setSuggestions(topSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    getSuggestions();
  }, [currentNote, allNotes]);

  return { suggestions, isLoading };
};

// Suggestion UI component
export const ConnectionSuggestions: React.FC<{
  suggestions: ConnectionSuggestion[];
  onAccept: (suggestion: ConnectionSuggestion) => void;
  onDismiss: (suggestion: ConnectionSuggestion) => void;
}> = ({ suggestions, onAccept, onDismiss }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Suggested Connections
      </h3>

      <div className="space-y-2">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.noteId}
            className="flex items-start gap-3 p-3 bg-background rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {suggestion.reason}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {suggestion.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(suggestion.confidence * 100)}% match
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAccept(suggestion)}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(suggestion)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. Set up D3.js integration with React
2. Implement basic graph data structures
3. Create force-directed layout
4. Basic node/edge rendering
5. Pan/zoom interactions

### Phase 2: Chat Integration (Week 3-4)

1. Design chat UI components
2. Implement streaming responses
3. RAG system integration
4. Context visualization
5. Conversation persistence

### Phase 3: Advanced Features (Week 5-6)

1. Multiple layout algorithms
2. Graph filtering and search
3. Clustering implementation
4. Timeline and heatmap views
5. Connection suggestions

### Phase 4: Performance & Polish (Week 7-8)

1. WebGL acceleration
2. Virtual scrolling
3. Responsive design
4. Dark mode refinement
5. Export capabilities

## Performance Considerations

1. **Large Graph Optimization:**
   - Use WebGL for rendering (Pixi.js/Three.js)
   - Implement viewport culling
   - Level of detail (LOD) system
   - Lazy loading of node details

2. **Memory Management:**
   - Virtualize large lists
   - Dispose of unused graph data
   - Limit conversation history in memory
   - Use IndexedDB for persistence

3. **Rendering Performance:**
   - Batch DOM updates
   - Use React.memo for expensive components
   - Implement request animation frame
   - Debounce graph updates

4. **Network Optimization:**
   - Stream chat responses
   - Paginate conversation history
   - Cache graph calculations
   - Compress large exports

This comprehensive design provides a solid foundation for implementing advanced Knowledge Graph and Chat features in Viny, with careful consideration for performance, user experience, and maintainability.
