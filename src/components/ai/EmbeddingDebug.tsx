/**
 * EmbeddingDebug - Debug component for embedding generation issues
 */

import React, { useState } from 'react'
import { localEmbeddingService } from '../../services/ai'
import { Icons } from '../Icons'
import { Button } from '../ui/ButtonRadix'
import { useToast } from '../../hooks/useToast'
import { logger } from '../../utils/logger'

export const EmbeddingDebug: React.FC = () => {
  const [isTestingInit, setIsTestingInit] = useState(false)
  const [isTestingEmbedding, setIsTestingEmbedding] = useState(false)
  const [testResult, setTestResult] = useState<string>('')
  const { showToast } = useToast()

  const testInitialization = async () => {
    setIsTestingInit(true)
    setTestResult('Testing initialization...\n')

    try {
      const startTime = Date.now()
      await localEmbeddingService.initialize()
      const initTime = Date.now() - startTime

      const isInitialized = localEmbeddingService.isInitialized()
      const modelInfo = localEmbeddingService.getModelInfo()

      setTestResult(
        prev =>
          prev +
          `✅ Initialization successful!\n` +
          `- Time: ${initTime}ms\n` +
          `- Initialized: ${isInitialized}\n` +
          `- Model: ${modelInfo.name}\n` +
          `- Dimensions: ${modelInfo.dimensions}\n`
      )

      showToast({
        title: 'Initialization successful',
        variant: 'success',
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      setTestResult(prev => prev + `❌ Initialization failed: ${errorMsg}\n`)
      logger.error('Embedding initialization test failed', error)

      showToast({
        title: 'Initialization failed',
        description: errorMsg,
        variant: 'error',
      })
    } finally {
      setIsTestingInit(false)
    }
  }

  const testEmbedding = async () => {
    setIsTestingEmbedding(true)
    setTestResult(prev => prev + '\nTesting embedding generation...\n')

    try {
      // First ensure initialized
      if (!localEmbeddingService.isInitialized()) {
        setTestResult(prev => prev + 'Initializing service first...\n')
        await localEmbeddingService.initialize()
      }

      const testText = 'This is a test note for embedding generation'
      const startTime = Date.now()

      const result = await localEmbeddingService.generateEmbedding(testText)
      const genTime = Date.now() - startTime

      setTestResult(
        prev =>
          prev +
          `✅ Embedding generated successfully!\n` +
          `- Time: ${genTime}ms\n` +
          `- Model: ${result.model}\n` +
          `- Dimensions: ${result.dimensions}\n` +
          `- Embedding length: ${result.embedding.length}\n` +
          `- First 5 values: [${Array.from(result.embedding.slice(0, 5))
            .map(v => v.toFixed(3))
            .join(', ')}...]\n`
      )

      // Test cosine similarity
      const result2 = await localEmbeddingService.generateEmbedding(
        'This is another test about embeddings'
      )
      const similarity = localEmbeddingService.cosineSimilarity(
        result.embedding,
        result2.embedding
      )

      setTestResult(
        prev =>
          prev +
          `\n✅ Similarity calculation successful!\n` +
          `- Similarity: ${(similarity * 100).toFixed(1)}%\n`
      )

      showToast({
        title: 'Embedding test successful',
        variant: 'success',
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      setTestResult(
        prev => prev + `❌ Embedding generation failed: ${errorMsg}\n`
      )
      logger.error('Embedding generation test failed', error)

      showToast({
        title: 'Embedding test failed',
        description: errorMsg,
        variant: 'error',
      })
    } finally {
      setIsTestingEmbedding(false)
    }
  }

  return (
    <div className="p-4 bg-theme-bg-secondary rounded-lg">
      <h3 className="text-lg font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
        <Icons.AlertCircle className="w-5 h-5" />
        Embedding Debug Panel
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={testInitialization}
            disabled={isTestingInit}
          >
            {isTestingInit ? (
              <>
                <Icons.Loader className="w-4 h-4 mr-1 animate-spin" />
                Testing Init...
              </>
            ) : (
              'Test Initialization'
            )}
          </Button>

          <Button
            size="sm"
            onClick={testEmbedding}
            disabled={isTestingEmbedding}
          >
            {isTestingEmbedding ? (
              <>
                <Icons.Loader className="w-4 h-4 mr-1 animate-spin" />
                Testing Embedding...
              </>
            ) : (
              'Test Embedding'
            )}
          </Button>
        </div>

        {testResult && (
          <pre className="p-3 bg-theme-bg-tertiary rounded text-xs text-theme-text-secondary overflow-auto max-h-64">
            {testResult}
          </pre>
        )}

        <div className="text-xs text-theme-text-muted">
          <p>⚠️ Common issues:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Model files are downloaded on first use (~50MB)</li>
            <li>May take 10-30 seconds to initialize</li>
            <li>Requires stable internet for first download</li>
            <li>Check browser console for detailed errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
