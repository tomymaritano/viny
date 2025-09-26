/**
 * Web Worker for generating embeddings using Transformers.js
 */

import { pipeline } from '@xenova/transformers'

let model: any = null
let isInitializing = false

self.addEventListener('message', async event => {
  const { type, data, id } = event.data

  try {
    switch (type) {
      case 'init':
        if (!model && !isInitializing) {
          isInitializing = true
          self.postMessage({ type: 'status', status: 'loading', id })

          // Initialize the embedding model
          model = await pipeline(
            'feature-extraction',
            data.model || 'Xenova/all-MiniLM-L6-v2',
            { quantized: true }
          )

          isInitializing = false
          self.postMessage({ type: 'init-complete', id })
        }
        break

      case 'embed':
        if (!model) {
          throw new Error('Model not initialized')
        }

        const startTime = performance.now()
        const output = await model(data.text, {
          pooling: 'mean',
          normalize: true,
        })
        const embedding = Array.from(output.data)
        const processingTime = performance.now() - startTime

        self.postMessage({
          type: 'embed-complete',
          result: {
            embedding,
            dimensions: embedding.length,
            processingTime,
          },
          id,
        })
        break

      case 'batch-embed':
        if (!model) {
          throw new Error('Model not initialized')
        }

        const results = []
        for (const text of data.texts) {
          const output = await model(text, { pooling: 'mean', normalize: true })
          results.push({
            text,
            embedding: Array.from(output.data),
          })
        }

        self.postMessage({
          type: 'batch-embed-complete',
          results,
          id,
        })
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      id,
    })
  }
})

// Prevent TypeScript errors
export {}
