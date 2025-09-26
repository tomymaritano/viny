/**
 * Web Worker for Embedding Generation
 * Handles transformer model operations in background thread
 */

import { pipeline, env } from '@xenova/transformers'
import type { TextChunk } from './EmbeddingEngine'
import { logger } from '../../../utils/logger'

// Configure for web worker environment
env.allowLocalModels = false
env.backends.onnx.wasm.numThreads = 1 // Single thread in worker

let embeddingPipeline: any = null
let config: any = null

// Handle messages from main thread
self.addEventListener('message', async event => {
  const { type, ...data } = event.data

  try {
    switch (type) {
      case 'initialize':
        await handleInitialize(data)
        break

      case 'embed':
        await handleEmbed(data)
        break

      case 'embedQuery':
        await handleEmbedQuery(data)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Unknown error',
    })
  }
})

/**
 * Initialize the embedding pipeline
 */
async function handleInitialize(data: { config: any }) {
  config = data.config

  // Load the model
  embeddingPipeline = await pipeline('feature-extraction', config.modelName)

  self.postMessage({ type: 'initialized' })
}

/**
 * Generate embeddings for chunks
 */
async function handleEmbed(data: { chunks: TextChunk[] }) {
  if (!embeddingPipeline) {
    throw new Error('Pipeline not initialized')
  }

  const embeddings = []

  for (const chunk of data.chunks) {
    try {
      const output = await embeddingPipeline(chunk.text, {
        pooling: 'mean',
        normalize: true,
      })

      embeddings.push({
        id: `emb_${chunk.id}`,
        noteId: chunk.noteId,
        chunkId: chunk.id,
        vector: Array.from(output.data),
        metadata: chunk.metadata,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error(`Failed to embed chunk ${chunk.id}:`, error)
      // Continue with other chunks
    }
  }

  self.postMessage({
    type: 'embeddings',
    embeddings,
  })
}

/**
 * Generate embedding for query
 */
async function handleEmbedQuery(data: { query: string }) {
  if (!embeddingPipeline) {
    throw new Error('Pipeline not initialized')
  }

  const output = await embeddingPipeline(data.query, {
    pooling: 'mean',
    normalize: true,
  })

  self.postMessage({
    type: 'queryEmbedding',
    embedding: Array.from(output.data),
  })
}

// Export for TypeScript
export {}
