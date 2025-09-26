/**
 * AISettings - Settings tab for AI features
 */

import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../../stores/newSimpleStore'
import { Icons } from '../../Icons'
import SettingRow from '../components/SettingRow'
import ToggleSwitch from '../components/ToggleSwitch'
import FormSection from '../components/FormSection'
import { EmbeddingStatus } from '../../ai/EmbeddingStatus'
import { EmbeddingDebug } from '../../ai/EmbeddingDebug'
import { Input } from '../../ui/Input'
import { Label } from '../../ui/Label'
import { Button } from '../../ui/ButtonRadix'
import { SimpleSelect as SelectRadix } from '../../ui/SelectRadix'
import { aiService } from '../../../services/ai/AIService'
import { ollamaService } from '../../../services/ai/OllamaService'
// Import WebLLM service conditionally
let webLLMService: any = null
try {
  webLLMService = require('../../../services/ai/WebLLMService').webLLMService
} catch (error) {
  settingsLogger.warn('WebLLM service not available in settings')
}
import { ollamaInstaller } from '../../../services/ai/OllamaInstaller'
import { useToast } from '../../../hooks/useToast'
import { cn } from '../../../lib/utils'
import { logger } from '../../../utils/logger'
import { settingsLogger } from '../../../utils/logger'

export const AISettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore()
  const { showToast } = useToast()
  const [providers, setProviders] = useState({
    ollama: false,
    webllm: false,
  })
  const [isChecking, setIsChecking] = useState(false)
  const [installProgress, setInstallProgress] = useState<number | null>(null)
  const [isTestingOllama, setIsTestingOllama] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<
    'connected' | 'disconnected' | 'testing'
  >('disconnected')

  // Check provider availability on mount
  useEffect(() => {
    checkProviders()
  }, [])

  const checkProviders = async () => {
    setIsChecking(true)
    try {
      const availability = await aiService.checkProviderAvailability()
      setProviders(availability)
    } catch (error) {
      logger.error('Failed to check AI providers:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Default settings with new AI options
  const aiSettings = settings.ai || {
    enableAIAssistant: false,
    enableSemanticSearch: true,
    provider: 'ollama',
    ollamaModel: 'llama3.2:latest',
    webllmModel: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    embeddingModel: 'Xenova/all-MiniLM-L6-v2',
    onboardingCompleted: false,
    skipInstallation: false,
    autoSelectProvider: true,
  }

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({
      ai: {
        ...aiSettings,
        [key]: value,
      },
    })
  }

  const handleToggleAI = async (enabled: boolean) => {
    await updateSettings({
      ai: {
        ...aiSettings,
        enableAIAssistant: enabled,
      },
    })

    if (enabled) {
      // Initialize AI service with current settings
      await aiService.initialize(settings)
    }
  }

  const handleProviderChange = async (provider: string) => {
    await updateSettings({
      ai: {
        ...aiSettings,
        provider: provider as any,
      },
    })

    // Switch to the new provider
    await aiService.switchProvider(provider as any, settings)
  }

  const handleInstallOllama = async () => {
    ollamaInstaller.onProgress((progress) => {
      setInstallProgress(progress.progress)
    })

    try {
      await ollamaInstaller.install()
      await checkProviders()
      setInstallProgress(null)
    } catch (error) {
      logger.error('Failed to install Ollama:', error)
      setInstallProgress(null)
    }
  }

  const getOllamaModels = () => [
    { value: 'llama3.2:latest', label: 'Llama 3.2 (Latest)' },
    { value: 'llama3.1:latest', label: 'Llama 3.1' },
    { value: 'mistral:latest', label: 'Mistral' },
    { value: 'phi3:latest', label: 'Phi 3' },
    { value: 'qwen2.5:latest', label: 'Qwen 2.5' },
  ]

  const currentProvider = aiService.getCurrentProvider()
  const providerInfo = aiService.getProviderInfo()

  const testOllamaConnection = async () => {
    setIsTestingOllama(true)
    setOllamaStatus('testing')

    try {
      const isAvailable = await ollamaService.checkAvailability()
      if (isAvailable) {
        setOllamaStatus('connected')
        showToast({
          title: 'Ollama connected',
          description: 'Successfully connected to Ollama service',
          variant: 'success',
        })
      } else {
        setOllamaStatus('disconnected')
        showToast({
          title: 'Ollama not available',
          description: 'Could not connect to Ollama service',
          variant: 'error',
        })
      }
    } catch (error) {
      setOllamaStatus('disconnected')
      showToast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      })
    } finally {
      setIsTestingOllama(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Section */}
      <FormSection
        title="AI Assistant"
        description="Enable AI-powered features like intelligent Q&A and enhanced search"
      >
        <div className="space-y-4">
          <SettingRow
            title="Enable AI Assistant"
            description="Use local AI to answer questions about your notes"
          >
            <ToggleSwitch
              checked={aiSettings.enableAIAssistant || false}
              onChange={handleToggleAI}
            />
          </SettingRow>

          {aiSettings.enableAIAssistant && (
            <>
              <SettingRow
                title="AI Provider"
                description={`Currently using: ${providerInfo.name}`}
                fullWidth
              >
                <div className="space-y-3 w-full">
                  <SelectRadix
                    value={aiSettings.provider || 'ollama'}
                    onValueChange={handleProviderChange}
                    options={[
                      {
                        value: 'ollama',
                        label: `Ollama ${providers.ollama ? '(Available)' : '(Not installed)'}`,
                      },
                      // WebLLM temporarily disabled
                      // {
                      //   value: 'webllm',
                      //   label: `WebLLM ${providers.webllm ? '(Available)' : '(Requires WebGPU)'}`,
                      // },
                    ]}
                  />

                  {!providers.ollama && aiSettings.provider === 'ollama' && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        Ollama is not installed. Install it to use AI features.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleInstallOllama}
                        disabled={installProgress !== null}
                      >
                        {installProgress !== null ? (
                          <>
                            <Icons.Loader className="w-3 h-3 animate-spin mr-2" />
                            Installing... {Math.round(installProgress)}%
                          </>
                        ) : (
                          <>
                            <Icons.Download className="w-3 h-3 mr-2" />
                            Install Ollama
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* WebLLM temporarily disabled
                  {!providers.webllm && aiSettings.provider === 'webllm' && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        WebLLM requires a browser with WebGPU support (Chrome 121+ or Edge 121+).
                      </p>
                    </div>
                  )}
                  */}
                </div>
              </SettingRow>

              {aiSettings.provider === 'ollama' && providers.ollama && (
                <SettingRow
                  title="Ollama Model"
                  description="Choose the AI model to use"
                  fullWidth
                >
                  <SelectRadix
                    value={aiSettings.ollamaModel || 'llama3.2:latest'}
                    onValueChange={(model) =>
                      handleSettingChange('ollamaModel', model)
                    }
                    options={getOllamaModels()}
                  />
                </SettingRow>
              )}

              {/* WebLLM temporarily disabled
              {aiSettings.provider === 'webllm' && providers.webllm && (
                <SettingRow
                  title="WebLLM Model"
                  description="Choose the browser-based AI model"
                  fullWidth
                >
                  <SelectRadix
                    value={aiSettings.webllmModel || 'Llama-3.2-1B-Instruct-q4f32_1-MLC'}
                    onValueChange={(model) =>
                      handleSettingChange('webllmModel', model)
                    }
                    options={webLLMService ? webLLMService.getModelOptions().map(m => ({
                      value: m.id,
                      label: `${m.name} (${m.size})`,
                    })) : []}
                  />
                </SettingRow>
              )}
              */}
            </>
          )}
        </div>
      </FormSection>

      {/* Semantic Search Section */}
      <FormSection
        title="Semantic Search"
        description="Enhanced search using AI embeddings"
      >
        <div className="space-y-4">
          <SettingRow
            title="Enable Semantic Search"
            description="Find notes by meaning, not just keywords"
          >
            <ToggleSwitch
              checked={aiSettings.enableSemanticSearch ?? true}
              onChange={checked =>
                handleSettingChange('enableSemanticSearch', checked)
              }
            />
          </SettingRow>

          <SettingRow
            title="Embedding Model"
            description="Model used for generating embeddings"
            fullWidth
          >
            <select
              value={aiSettings.embeddingModel}
              onChange={e =>
                handleSettingChange('embeddingModel', e.target.value)
              }
              className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border-primary rounded-md text-theme-text-primary"
            >
              <option value="Xenova/all-MiniLM-L6-v2">
                all-MiniLM-L6-v2 (Fast, 384 dims)
              </option>
              <option value="Xenova/all-mpnet-base-v2">
                all-mpnet-base-v2 (Accurate, 768 dims)
              </option>
              <option value="Xenova/multi-qa-MiniLM-L6-cos-v1">
                multi-qa-MiniLM-L6 (Q&A optimized)
              </option>
            </select>
          </SettingRow>

          {/* Embedding Status */}
          <EmbeddingStatus className="mt-4" />

          {/* Debug Panel - Solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && <EmbeddingDebug />}
        </div>
      </FormSection>

      {/* Ollama Section */}
      <FormSection
        title="Ollama Integration"
        description="Connect to local Ollama instance for advanced AI features"
      >
        <div className="space-y-4">
          <SettingRow
            title="Ollama URL"
            description="URL of your local Ollama instance"
            fullWidth
          >
            <div className="space-y-2 w-full">
              <Input
                type="url"
                value={aiSettings.ollamaUrl}
                onChange={e => handleSettingChange('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={testOllamaConnection}
                  disabled={isTestingOllama}
                >
                  {isTestingOllama ? (
                    <>
                      <Icons.Loader className="w-4 h-4 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Icons.Zap className="w-4 h-4 mr-1" />
                      Test Connection
                    </>
                  )}
                </Button>

                {ollamaStatus === 'connected' && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Icons.Check className="w-4 h-4" />
                    Connected
                  </span>
                )}

                {ollamaStatus === 'disconnected' && !isTestingOllama && (
                  <span className="text-sm text-theme-text-muted">
                    Not connected
                  </span>
                )}
              </div>
            </div>
          </SettingRow>

          <SettingRow
            title="Default Model"
            description="Model to use for chat and generation"
            fullWidth
          >
            <Input
              type="text"
              value={aiSettings.ollamaModel}
              onChange={e => handleSettingChange('ollamaModel', e.target.value)}
              placeholder="llama2"
            />
          </SettingRow>
        </div>
      </FormSection>

      {/* Provider Status Section */}
      <FormSection
        title="Provider Status"
        description="Current AI provider information"
      >
        <div className="space-y-3">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            currentProvider !== 'none' ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-900/20"
          )}>
            {currentProvider !== 'none' ? (
              <>
                <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-theme-text-primary">AI Active</p>
                  <p className="text-sm text-theme-text-secondary">
                    Using {providerInfo.name} - {providerInfo.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Icons.AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-theme-text-primary">AI Inactive</p>
                  <p className="text-sm text-theme-text-secondary">
                    Enable AI assistant to use intelligent features
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={checkProviders}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Icons.Loader className="w-3 h-3 animate-spin mr-2" />
                Checking providers...
              </>
            ) : (
              <>
                <Icons.RefreshCw className="w-3 h-3 mr-2" />
                Refresh Provider Status
              </>
            )}
          </Button>
        </div>
      </FormSection>
    </div>
  )
}

export default AISettings
