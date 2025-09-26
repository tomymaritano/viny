/**
 * RAG Settings Component
 * Configure RAG system settings
 */

import React, { useState } from 'react'
import { Icons } from '../Icons'
import { SelectRadix } from '../ui/SelectRadix'
import { SwitchRadix } from '../ui/SwitchRadix'
import { SliderRadix } from '../ui/SliderRadix'
import type { RAGSystemConfig } from '@/lib/rag'

interface RAGSettingsProps {
  config: RAGSystemConfig
  onConfigChange: (config: RAGSystemConfig) => void
  stats?: any
  onClearIndex?: () => void
  onReindex?: () => void
}

export const RAGSettings: React.FC<RAGSettingsProps> = ({
  config,
  onConfigChange,
  stats,
  onClearIndex,
  onReindex,
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'features' | 'advanced'
  >('general')

  const handleChange = (key: keyof RAGSystemConfig, value: any) => {
    onConfigChange({
      ...config,
      [key]: value,
    })
  }

  const llmProviders = [
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'claude', label: 'Claude' },
    { value: 'groq', label: 'Groq' },
  ]

  const embeddingModels = [
    { value: 'Xenova/all-MiniLM-L6-v2', label: 'MiniLM-L6 (Default)' },
    { value: 'Xenova/all-MiniLM-L12-v2', label: 'MiniLM-L12 (Better)' },
    { value: 'Xenova/all-mpnet-base-v2', label: 'MPNet (Best)' },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b dark:border-gray-700">
        {(['general', 'features', 'advanced'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors
              ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Embedding Model
            </label>
            <SelectRadix
              value={config.embeddingModel || 'Xenova/all-MiniLM-L6-v2'}
              onValueChange={value => handleChange('embeddingModel', value)}
              options={embeddingModels}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Model used for generating embeddings locally
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LLM Provider
            </label>
            <SelectRadix
              value={config.llmProvider || 'ollama'}
              onValueChange={value => handleChange('llmProvider', value)}
              options={llmProviders}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Language model provider for Q&A and generation
            </p>
          </div>

          {config.llmProvider === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ollama Model
              </label>
              <input
                type="text"
                value={config.llmModel || 'llama2'}
                onChange={e => handleChange('llmModel', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 
                         dark:border-gray-600 dark:text-white"
                placeholder="llama2, mistral, codellama..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Temperature
            </label>
            <SliderRadix
              value={[config.temperature || 0.7]}
              onValueChange={value => handleChange('temperature', value[0])}
              min={0}
              max={1}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused</span>
              <span>{config.temperature || 0.7}</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      )}

      {/* Features Settings */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Auto-tagging
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI-powered tag suggestions for notes
              </p>
            </div>
            <SwitchRadix
              checked={config.enableAutoTagging !== false}
              onCheckedChange={checked =>
                handleChange('enableAutoTagging', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Summarization
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate intelligent summaries of notes
              </p>
            </div>
            <SwitchRadix
              checked={config.enableSummarization !== false}
              onCheckedChange={checked =>
                handleChange('enableSummarization', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Similar Notes
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find related notes based on content
              </p>
            </div>
            <SwitchRadix
              checked={config.enableSimilarNotes !== false}
              onCheckedChange={checked =>
                handleChange('enableSimilarNotes', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Q&A Chat
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interactive chat with your knowledge base
              </p>
            </div>
            <SwitchRadix
              checked={config.enableQA !== false}
              onCheckedChange={checked => handleChange('enableQA', checked)}
            />
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Context Window
            </label>
            <input
              type="number"
              value={config.contextWindow || 4096}
              onChange={e =>
                handleChange('contextWindow', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 
                       dark:border-gray-600 dark:text-white"
              min={512}
              max={32768}
              step={512}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum tokens for context (affects accuracy and cost)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Top K Results
            </label>
            <input
              type="number"
              value={config.topK || 5}
              onChange={e => handleChange('topK', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 
                       dark:border-gray-600 dark:text-white"
              min={1}
              max={20}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Number of context chunks to retrieve
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Score
            </label>
            <SliderRadix
              value={[config.minScore || 0.7]}
              onValueChange={value => handleChange('minScore', value[0])}
              min={0}
              max={1}
              step={0.05}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Loose</span>
              <span>{config.minScore || 0.7}</span>
              <span>Strict</span>
            </div>
          </div>

          {/* Index Management */}
          {stats && (
            <div className="pt-4 border-t dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Index Management
              </h4>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Embeddings
                  </span>
                  <span className="font-medium">
                    {stats.embeddingStats?.totalEmbeddings || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Indexed Notes
                  </span>
                  <span className="font-medium">
                    {stats.vectorStats?.uniqueNotes || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Storage Size
                  </span>
                  <span className="font-medium">
                    {formatBytes(stats.embeddingStats?.cacheSize || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {onReindex && (
                  <button
                    onClick={onReindex}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 
                             dark:text-blue-400 border border-blue-600 dark:border-blue-400 
                             rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 
                             transition-colors"
                  >
                    Reindex All Notes
                  </button>
                )}
                {onClearIndex && (
                  <button
                    onClick={onClearIndex}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 
                             dark:text-red-400 border border-red-600 dark:border-red-400 
                             rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 
                             transition-colors"
                  >
                    Clear Index
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
