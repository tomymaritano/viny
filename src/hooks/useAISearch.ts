/**
 * useAISearch - Enhanced search with AI Q&A capabilities using Ollama
 */

import { useState, useCallback } from 'react'
import { useSemanticSearch } from './useSemanticSearch'
import { aiService } from '../services/ai/AIService'
import { logger } from '../utils/logger'
import type { Note } from '../types'

interface AISearchResult {
  answer: string
  sources: Note[]
  isGenerating: boolean
}

export const useAISearch = (notes: Note[] = []) => {
  const semanticSearch = useSemanticSearch(notes)
  const [aiResult, setAIResult] = useState<AISearchResult>({
    answer: '',
    sources: [],
    isGenerating: false,
  })
  const [isAIMode, setIsAIMode] = useState(false)

  // Check if query is a question
  const isQuestion = useCallback((query: string): boolean => {
    const questionPatterns = [
      /^(what|when|where|who|why|how|is|are|can|could|should|would|will)/i,
      /\?$/,
      /^tell me/i,
      /^explain/i,
      /^describe/i,
      /^find.*about/i,
    ]
    return questionPatterns.some(pattern => pattern.test(query.trim()))
  }, [])

  // Generate AI answer using RAG
  const generateAnswer = useCallback(
    async (query: string) => {
      setAIResult(prev => ({ ...prev, isGenerating: true }))

      try {
        // First, find relevant notes using semantic search
        // Force semantic mode for AI answers
        const prevMode = semanticSearch.searchMode
        semanticSearch.setSearchMode('semantic')
        await semanticSearch.performSearch(query)
        const topResults = semanticSearch.results.slice(0, 5)
        const sources = topResults.map(r => r.note)
        // Restore previous mode
        semanticSearch.setSearchMode(prevMode)

        // Build context from relevant notes
        const context = topResults
          .map(result => {
            const noteContext = `Title: ${result.note.title || 'Untitled'}
Content: ${result.chunk || result.note.content.substring(0, 500)}...`
            return noteContext
          })
          .join('\n\n---\n\n')

        // Check if AI is available
        const isAvailable = await aiService.isAvailable()
        if (!isAvailable) {
          const providerInfo = aiService.getProviderInfo()
          setAIResult({
            answer: `AI is not available. ${providerInfo.name === 'None' ? 'No AI provider is configured. Please check Settings > AI.' : `${providerInfo.name} is not available.`}`,
            sources,
            isGenerating: false,
          })
          return
        }

        // Generate answer using AI service
        const answer = await aiService.generateAnswer(query, context)

        setAIResult({
          answer,
          sources,
          isGenerating: false,
        })
      } catch (error) {
        logger.error('Failed to generate AI answer:', error)
        setAIResult({
          answer: 'Failed to generate answer. Please check if Ollama is running.',
          sources: [],
          isGenerating: false,
        })
      }
    },
    [semanticSearch]
  )


  // Enhanced search that detects questions
  const search = useCallback(
    async (query: string) => {
      // Always update the query for regular search
      semanticSearch.setQuery(query)
      
      // Check if it's a question that needs AI
      if (isQuestion(query) && isAIMode) {
        await generateAnswer(query)
      }
    },
    [isQuestion, isAIMode, generateAnswer, semanticSearch]
  )
  
  return {
    // All semantic search functionality
    ...semanticSearch,
    // AI-specific additions
    aiResult,
    isAIMode,
    setIsAIMode,
    isQuestion,
    generateAnswer,
    search,
  }
}