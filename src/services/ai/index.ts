/**
 * AI Services - Core services for AI-powered features
 */

import { OllamaService } from './OllamaService'
import {
  LocalEmbeddingService,
  localEmbeddingService,
} from './LocalEmbeddingServiceSimple'
import { RAGService, ragService } from './RAGService'
import {
  EmbeddingManagerService,
  embeddingManager,
} from './EmbeddingManagerService'
import { GraphDataService, graphDataService } from './GraphDataService'

// Export singleton instances
export const ollamaService = new OllamaService()
export { localEmbeddingService, ragService, embeddingManager, graphDataService }

// Export types
export type {
  OllamaModel,
  ChatMessage,
  StreamCallback,
  GenerateOptions,
  OllamaResponse,
} from './OllamaService'

export type {
  EmbeddingResult,
  EmbeddingOptions,
  ChunkOptions,
  SimilarityOptions,
  ChunkEmbedding,
} from './LocalEmbeddingServiceSimple'

export type {
  RAGOptions,
  RAGResponse,
  RAGContext,
  StreamingRAGOptions,
} from './RAGService'

export type {
  EmbeddingMetadata,
  StoredEmbedding,
  EmbeddingProgress,
} from './EmbeddingManagerService'

export type { GraphNode, GraphLink, GraphData } from './GraphDataService'

// Export classes for custom instantiation
export {
  OllamaService,
  LocalEmbeddingService,
  RAGService,
  EmbeddingManagerService,
  GraphDataService,
}
