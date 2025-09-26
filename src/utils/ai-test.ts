/**
 * Quick test utility for AI services
 */

import {
  ollamaService,
  localEmbeddingService,
  ragService,
} from '../services/ai'

export async function testAIServices() {
  console.log('🧪 Testing AI Services...')

  // Test Ollama
  console.log('\n1. Testing Ollama Service:')
  const ollamaAvailable = await ollamaService.checkAvailability()
  console.log(`   ✅ Ollama Available: ${ollamaAvailable}`)

  if (ollamaAvailable) {
    const models = await ollamaService.listModels()
    console.log(`   📦 Available Models: ${models.map(m => m.name).join(', ')}`)
  } else {
    console.log('   ⚠️  Ollama not running. Start with: ollama serve')
  }

  // Test Embeddings
  console.log('\n2. Testing Embedding Service:')
  try {
    const testText = 'Hello, this is a test for embeddings'
    console.log('   🔄 Initializing embedding model...')
    await localEmbeddingService.initialize()

    console.log('   🔄 Generating embedding...')
    const result = await localEmbeddingService.generateEmbedding(testText)
    console.log(`   ✅ Embedding Generated: ${result.dimensions} dimensions`)
    console.log(`   ⏱️  Processing Time: ${result.processingTime}ms`)
  } catch (error) {
    console.error('   ❌ Embedding Error:', error)
  }

  // Test RAG
  console.log('\n3. Testing RAG Service:')
  const ragAvailability = await ragService.checkAvailability()
  console.log(`   ✅ Ollama: ${ragAvailability.ollama}`)
  console.log(`   ✅ Embeddings: ${ragAvailability.embeddings}`)
  console.log(`   ✅ Dexie Repository: ${ragAvailability.repository}`)

  if (!ragAvailability.repository) {
    console.log(
      '   ⚠️  Enable Dexie by setting localStorage: viny_use_dexie = "true"'
    )
  }

  console.log('\n✅ AI Services Test Complete!')
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  ;(window as any).testAI = testAIServices
}
