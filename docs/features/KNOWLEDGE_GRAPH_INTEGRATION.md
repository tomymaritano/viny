# Knowledge Graph & Chat Integration Guide

## Integration Steps

### 1. Install Dependencies

```bash
npm install d3 @types/d3
npm install @tanstack/react-virtual  # For virtualization
npm install date-fns  # Already installed
```

### 2. Update Main App Router

```typescript
// In src/AppSimple.tsx or main router component
import { KnowledgeWorkspace } from './components/knowledge/KnowledgeWorkspace';

// Add route
<Route path="/knowledge" element={<KnowledgeWorkspace />} />
```

### 3. Add Navigation Entry

```typescript
// In sidebar navigation
<button
  onClick={() => navigate('/knowledge')}
  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent"
>
  <Network className="w-5 h-5" />
  <span>Knowledge Graph</span>
</button>
```

### 4. Create Graph Data Service

```typescript
// src/services/graphDataService.ts
import { Note, Notebook } from '../types'
import { GraphData, GraphNode, GraphEdge } from '../types/knowledge'
import { analyzeNoteLinks } from './notesService'

export class GraphDataService {
  async buildGraphFromNotes(
    notes: Note[],
    notebooks: Notebook[]
  ): Promise<GraphData> {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const nodeMap = new Map<string, GraphNode>()

    // Create nodes for notes
    for (const note of notes) {
      const links = await analyzeNoteLinks(note)

      const node: GraphNode = {
        id: note.id,
        type: 'note',
        label: note.title,
        data: {
          noteId: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags,
          notebookId: note.notebookId,
          wordCount: note.wordCount,
          backlinks: links.backlinks,
          forwardLinks: links.forwardLinks,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        },
        style: {
          color: note.tags.length > 0 ? '#3b82f6' : '#6b7280',
          size: Math.min(20 + (note.wordCount || 0) / 100, 40),
          shape: 'circle',
        },
      }

      nodes.push(node)
      nodeMap.set(note.id, node)
    }

    // Create nodes for tags
    const tagCounts = new Map<string, number>()
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    tagCounts.forEach((count, tag) => {
      const tagNode: GraphNode = {
        id: `tag-${tag}`,
        type: 'tag',
        label: `#${tag}`,
        data: {
          title: tag,
          tags: [tag],
          backlinks: [],
          forwardLinks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        style: {
          color: '#8b5cf6',
          size: Math.min(15 + count * 3, 30),
          shape: 'diamond',
        },
      }

      nodes.push(tagNode)
      nodeMap.set(tagNode.id, tagNode)
    })

    // Create nodes for notebooks
    notebooks.forEach(notebook => {
      const notebookNode: GraphNode = {
        id: `notebook-${notebook.id}`,
        type: 'notebook',
        label: notebook.name,
        data: {
          title: notebook.name,
          notebookId: notebook.id,
          tags: [],
          backlinks: [],
          forwardLinks: [],
          createdAt: new Date(notebook.createdAt),
          updatedAt: new Date(notebook.updatedAt),
        },
        style: {
          color: notebook.color || '#f59e0b',
          size: 25,
          shape: 'square',
        },
      }

      nodes.push(notebookNode)
      nodeMap.set(notebookNode.id, notebookNode)
    })

    // Create edges
    notes.forEach(note => {
      // Note to notebook edges
      if (note.notebookId) {
        edges.push({
          id: `${note.id}-notebook-${note.notebookId}`,
          source: note.id,
          target: `notebook-${note.notebookId}`,
          type: 'notebook',
          weight: 0.5,
        })
      }

      // Note to tag edges
      note.tags.forEach(tag => {
        edges.push({
          id: `${note.id}-tag-${tag}`,
          source: note.id,
          target: `tag-${tag}`,
          type: 'tag',
          weight: 0.7,
        })
      })

      // Note to note edges (references)
      const noteNode = nodeMap.get(note.id)
      if (noteNode) {
        noteNode.data.forwardLinks.forEach(targetId => {
          if (nodeMap.has(targetId)) {
            edges.push({
              id: `${note.id}-${targetId}`,
              source: note.id,
              target: targetId,
              type: 'reference',
              weight: 1,
            })
          }
        })
      }
    })

    return { nodes, edges }
  }
}
```

### 5. Hook for Graph Data

```typescript
// src/hooks/useGraphData.ts
import { useEffect, useState } from 'react'
import { useAppStore } from './useAppStore'
import { useKnowledgeStore } from '../stores/knowledgeStore'
import { GraphDataService } from '../services/graphDataService'

export const useGraphData = () => {
  const { notes, notebooks } = useAppStore()
  const { setGraphData } = useKnowledgeStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const service = new GraphDataService()
        const graphData = await service.buildGraphFromNotes(notes, notebooks)

        setGraphData(graphData)
      } catch (err) {
        console.error('Failed to load graph data:', err)
        setError('Failed to load graph data')
      } finally {
        setIsLoading(false)
      }
    }

    loadGraphData()
  }, [notes, notebooks, setGraphData])

  return { isLoading, error }
}
```

### 6. RAG Integration Service

```typescript
// src/services/ragService.ts
import { Note } from '../types'
import { ChatMessage } from '../types/knowledge'

export class RAGService {
  private apiEndpoint: string

  constructor(apiEndpoint = '/api/chat') {
    this.apiEndpoint = apiEndpoint
  }

  async processQuery(
    query: string,
    context: ChatMessage['context'],
    options?: {
      maxTokens?: number
      temperature?: number
    }
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.apiEndpoint}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        query,
        context,
        options,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    return response.body
  }

  async searchSimilarNotes(query: string, limit = 10): Promise<Note[]> {
    const response = await fetch(`${this.apiEndpoint}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}
```

### 7. Update Types Index

```typescript
// In src/types/index.ts
export * from './knowledge'
```

### 8. Performance Monitoring

```typescript
// src/hooks/useGraphPerformance.ts
import { useEffect, useRef } from 'react'

export const useGraphPerformance = (nodeCount: number) => {
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)

  useEffect(() => {
    let animationId: number

    const measureFrame = (timestamp: number) => {
      if (lastFrameTimeRef.current) {
        const frameTime = timestamp - lastFrameTimeRef.current
        frameTimesRef.current.push(frameTime)

        // Keep only last 60 frames
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift()
        }
      }

      lastFrameTimeRef.current = timestamp
      animationId = requestAnimationFrame(measureFrame)
    }

    if (nodeCount > 0) {
      animationId = requestAnimationFrame(measureFrame)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [nodeCount])

  const getAverageFPS = () => {
    const frameTimes = frameTimesRef.current
    if (frameTimes.length === 0) return 60

    const avgFrameTime =
      frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    return Math.round(1000 / avgFrameTime)
  }

  const getPerformanceLevel = () => {
    const fps = getAverageFPS()
    if (fps >= 50) return 'high'
    if (fps >= 30) return 'medium'
    return 'low'
  }

  return {
    getAverageFPS,
    getPerformanceLevel,
  }
}
```

### 9. Example Usage in Component

```typescript
// Example component using the knowledge features
import React from 'react';
import { KnowledgeWorkspace } from '../components/knowledge/KnowledgeWorkspace';
import { useGraphData } from '../hooks/useGraphData';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const KnowledgePage: React.FC = () => {
  const { isLoading, error } = useGraphData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <KnowledgeWorkspace />
    </ErrorBoundary>
  );
};
```

## Deployment Considerations

### 1. Backend Requirements

For full functionality, you'll need:

1. **Vector Database** (e.g., Pinecone, Weaviate, or PostgreSQL with pgvector)
2. **Embedding API** (OpenAI, Cohere, or local model)
3. **LLM API** (OpenAI, Anthropic, or local model)
4. **WebSocket server** for real-time updates

### 2. Environment Variables

```env
# AI Services
VITE_OPENAI_API_KEY=your-api-key
VITE_EMBEDDING_MODEL=text-embedding-ada-002
VITE_CHAT_MODEL=gpt-4

# Vector Database
VITE_VECTOR_DB_URL=https://your-instance.pinecone.io
VITE_VECTOR_DB_API_KEY=your-api-key

# Feature Flags
VITE_ENABLE_KNOWLEDGE_GRAPH=true
VITE_ENABLE_AI_CHAT=true
```

### 3. Performance Optimization

1. **Lazy Load D3**: Import D3 modules only when needed
2. **Web Workers**: Process graph calculations in workers
3. **IndexedDB**: Cache graph data locally
4. **Virtual Rendering**: For graphs with 1000+ nodes
5. **Progressive Loading**: Load graph in chunks

### 4. Security Considerations

1. **API Rate Limiting**: Implement rate limiting for AI calls
2. **Content Filtering**: Filter sensitive information before sending to AI
3. **Authentication**: Ensure proper auth for AI features
4. **Data Privacy**: Option to process data locally

## Testing

```typescript
// Example test for graph visualization
import { render, screen } from '@testing-library/react';
import { GraphVisualization } from '../components/knowledge/GraphVisualization';
import { mockGraphData } from '../test/mocks';

describe('GraphVisualization', () => {
  it('renders graph with nodes and edges', () => {
    render(<GraphVisualization data={mockGraphData} />);

    // Check SVG is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();

    // Check nodes are rendered
    const nodes = screen.getAllByRole('button', { name: /node/i });
    expect(nodes).toHaveLength(mockGraphData.nodes.length);
  });

  it('handles node click events', () => {
    const onNodeClick = jest.fn();
    render(
      <GraphVisualization
        data={mockGraphData}
        onNodeClick={onNodeClick}
      />
    );

    const firstNode = screen.getByRole('button', { name: /node-1/i });
    fireEvent.click(firstNode);

    expect(onNodeClick).toHaveBeenCalledWith(mockGraphData.nodes[0]);
  });
});
```

This integration guide provides a complete roadmap for adding the Knowledge Graph and Chat features to Viny, with considerations for performance, security, and user experience.
