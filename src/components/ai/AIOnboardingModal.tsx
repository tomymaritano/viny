/**
 * AIOnboardingModal - First-time setup for AI features
 */

import React, { useState, useEffect } from 'react'
import { StandardModal } from '../ui/StandardModal'
import { Icons } from '../Icons'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { ollamaInstaller, type InstallProgress } from '../../services/ai/OllamaInstaller'
import { ollamaService } from '../../services/ai/OllamaService'
// import { webLLMService } from '../../services/ai/WebLLMService' // Temporarily disabled
import { aiService } from '../../services/ai/AIService'
import { useAppStore } from '../../stores/newSimpleStore'
import { logger } from '../../utils/logger'

interface AIOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export const AIOnboardingModal: React.FC<AIOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { settings, updateSettings } = useAppStore()
  const [currentStep, setCurrentStep] = useState<'intro' | 'provider' | 'install' | 'complete'>('intro')
  const [installProgress, setInstallProgress] = useState<InstallProgress | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'ollama'>('ollama')
  const [webGPUAvailable, setWebGPUAvailable] = useState(false) // WebLLM temporarily disabled

  // Check AI availability when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAvailability()
    }
  }, [isOpen])

  const checkAvailability = async () => {
    setIsChecking(true)
    try {
      const availability = await aiService.checkProviderAvailability()
      
      // Check WebGPU support - temporarily disabled
      // const webgpuSupported = await webLLMService.isAvailable()
      // setWebGPUAvailable(webgpuSupported)
      
      // If Ollama is already installed, skip to complete
      if (availability.ollama) {
        setCurrentStep('complete')
      }
    } catch (error) {
      logger.error('Failed to check AI availability:', error)
    } finally {
      setIsChecking(false)
    }
  }


  const handleInstall = async () => {
    setCurrentStep('install')
    
    if (selectedProvider === 'ollama') {
      // Set up progress callback
      ollamaInstaller.onProgress(setInstallProgress)

      try {
        await ollamaInstaller.install()
        
        // Enable AI features in settings
        await updateSettings({
          ...settings,
          ai: {
            ...settings.ai,
            enableSemanticSearch: true,
            enableAIAssistant: true,
            provider: 'ollama',
            ollamaModel: 'llama3.2:latest'
          }
        })

        setCurrentStep('complete')
      } catch (error) {
        logger.error('Installation failed:', error)
        // Stay on install step to show error
      }
    }
    // WebLLM temporarily disabled
  }

  const handleSkip = async () => {
    // Mark as seen but not installed
    await updateSettings({
      ...settings,
      ai: {
        ...settings.ai,
        onboardingCompleted: true,
        skipInstallation: true
      }
    })
    onClose()
  }

  const handleComplete = async () => {
    // Mark onboarding as completed
    await updateSettings({
      ...settings,
      ai: {
        ...settings.ai,
        onboardingCompleted: true,
        enableAIAssistant: true
      }
    })
    onComplete?.()
    onClose()
  }

  const renderIntroStep = () => (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-theme-accent-primary/20 to-theme-accent-secondary/20 flex items-center justify-center">
        <Icons.Brain className="w-10 h-10 text-theme-accent-primary" />
      </div>

      <h2 className="text-2xl font-semibold text-theme-text-primary mb-4">
        AI-Powered Note Taking
      </h2>

      <p className="text-theme-text-secondary mb-6 max-w-md mx-auto">
        Viny now includes a local AI assistant that can answer questions about your notes, 
        help you find information, and provide intelligent search.
      </p>

      <div className="space-y-4 text-left max-w-md mx-auto mb-8">
        <div className="flex items-start gap-3">
          <Icons.Shield className="w-5 h-5 text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-theme-text-primary">100% Private</h4>
            <p className="text-sm text-theme-text-secondary">
              AI runs locally on your device. Your notes never leave your computer.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icons.Zap className="w-5 h-5 text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-theme-text-primary">Intelligent Search</h4>
            <p className="text-sm text-theme-text-secondary">
              Ask questions in natural language and get answers from your notes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icons.Sparkles className="w-5 h-5 text-theme-accent-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-theme-text-primary">Free Forever</h4>
            <p className="text-sm text-theme-text-secondary">
              No subscription required. Uses open-source AI models.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={handleSkip}>
          Maybe Later
        </Button>
        <Button 
          variant="primary" 
          onClick={handleInstall} // Skip provider selection for now
          disabled={isChecking}
          className="min-w-[140px]"
        >
          {isChecking ? (
            <>
              <Icons.Loader className="w-4 h-4 animate-spin mr-2" />
              Checking...
            </>
          ) : (
            'Install AI Assistant'
          )}
        </Button>
      </div>

      <p className="text-xs text-theme-text-muted mt-4">
        Requires ~5GB disk space. You can uninstall anytime from Settings.
      </p>
    </div>
  )

  const renderProviderStep = () => (
    <div className="py-6">
      <h2 className="text-xl font-semibold text-theme-text-primary mb-4 text-center">
        Choose Your AI Provider
      </h2>

      <div className="space-y-4 mb-6">
        {/* Ollama Option */}
        <button
          onClick={() => setSelectedProvider('ollama')}
          className={cn(
            "w-full p-4 rounded-lg border-2 transition-all text-left",
            selectedProvider === 'ollama'
              ? "border-theme-accent-primary bg-theme-accent-primary/5"
              : "border-theme-border hover:border-theme-border-hover"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-theme-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <Icons.Server className="w-5 h-5 text-theme-accent-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-theme-text-primary mb-1">
                Ollama (Recommended)
              </h3>
              <p className="text-sm text-theme-text-secondary mb-2">
                Fast, native desktop app with best performance
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                  Best Performance
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  ~5GB Storage
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* WebLLM Option */}
        <button
          onClick={() => setSelectedProvider('webllm')}
          disabled={!webGPUAvailable}
          className={cn(
            "w-full p-4 rounded-lg border-2 transition-all text-left",
            !webGPUAvailable && "opacity-50 cursor-not-allowed",
            selectedProvider === 'webllm'
              ? "border-theme-accent-primary bg-theme-accent-primary/5"
              : "border-theme-border hover:border-theme-border-hover"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-theme-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <Icons.Globe className="w-5 h-5 text-theme-accent-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-theme-text-primary mb-1">
                WebLLM (Browser-based)
              </h3>
              <p className="text-sm text-theme-text-secondary mb-2">
                {webGPUAvailable
                  ? "Runs in your browser, no installation needed"
                  : "Not available - requires WebGPU support"}
              </p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                  No Install
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  ~1GB Download
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setCurrentStep('intro')}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleInstall}
          disabled={!selectedProvider}
        >
          Continue with {selectedProvider === 'ollama' ? 'Ollama' : 'WebLLM'}
        </Button>
      </div>
    </div>
  )

  const renderInstallStep = () => {
    const instructions = ollamaInstaller.getInstallInstructions()
    const isWebVersion = !window.electronAPI

    return (
      <div className="py-6">
        <div className="text-center mb-6">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
            installProgress?.status === 'error' ? 'bg-red-100' : 'bg-theme-accent-primary/10'
          )}>
            {installProgress?.status === 'error' ? (
              <Icons.AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Icons.Download className="w-8 h-8 text-theme-accent-primary animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-theme-text-primary mb-2">
            {installProgress?.status === 'error' ? 'Installation Failed' : 'Installing AI Assistant'}
          </h3>
        </div>

        {installProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-theme-text-secondary mb-2">
              <span>{installProgress.message}</span>
              <span>{Math.round(installProgress.progress)}%</span>
            </div>
            <div className="h-2 bg-theme-bg-tertiary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300",
                  installProgress.status === 'error' 
                    ? 'bg-red-500' 
                    : 'bg-theme-accent-primary'
                )}
                style={{ width: `${installProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {installProgress?.status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{installProgress.error}</p>
          </div>
        )}

        {isWebVersion && installProgress?.status === 'installing' && (
          <div className="space-y-4">
            <div className="p-4 bg-theme-bg-secondary rounded-lg">
              <h4 className="font-medium text-theme-text-primary mb-3">
                Installation Instructions for {instructions.os}:
              </h4>
              <ol className="space-y-2">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-2 text-sm text-theme-text-secondary">
                    <span className="font-medium text-theme-accent-primary">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open('https://ollama.ai/download', '_blank')}
              >
                <Icons.ExternalLink className="w-4 h-4 mr-2" />
                Download Ollama
              </Button>
              <Button 
                variant="primary"
                onClick={checkAvailability}
              >
                Check Installation
              </Button>
            </div>
          </div>
        )}

        {installProgress?.status === 'completed' && (
          <div className="text-center">
            <Icons.CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-theme-text-secondary mb-6">
              AI Assistant installed successfully!
            </p>
            <Button variant="primary" onClick={handleComplete}>
              Get Started
            </Button>
          </div>
        )}

        {installProgress?.status === 'error' && (
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleSkip}>
              Skip for Now
            </Button>
            <Button variant="primary" onClick={handleInstall}>
              Retry Installation
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderCompleteStep = () => (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <Icons.CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-semibold text-theme-text-primary mb-4">
        AI Assistant Ready!
      </h2>

      <p className="text-theme-text-secondary mb-8 max-w-md mx-auto">
        Your AI assistant is installed and ready to help. Try asking questions about your notes!
      </p>

      <div className="bg-theme-bg-secondary rounded-lg p-4 mb-8 max-w-md mx-auto">
        <h4 className="font-medium text-theme-text-primary mb-2">Quick Tips:</h4>
        <ul className="space-y-2 text-sm text-theme-text-secondary text-left">
          <li className="flex gap-2">
            <span>•</span>
            <span>Press <kbd className="px-1 py-0.5 bg-theme-bg-tertiary rounded text-xs">Cmd+K</kbd> to open search</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Type questions like "What did I write about React?"</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>AI answers are based only on your notes</span>
          </li>
        </ul>
      </div>

      <Button variant="primary" onClick={handleComplete}>
        Start Using AI
      </Button>
    </div>
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={currentStep === 'intro' ? onClose : undefined}
      showCloseButton={currentStep === 'intro'}
      size="md"
      title=""
    >
      <div className="min-h-[400px]">
        {currentStep === 'intro' && renderIntroStep()}
        {/* {currentStep === 'provider' && renderProviderStep()} // Temporarily disabled */}
        {currentStep === 'install' && renderInstallStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </StandardModal>
  )
}