import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import CenteredLoader from './CenteredLoader'
import ContentLoader from './ContentLoader'
import { LoadingOverlay, AppLoading, SavingIndicator, ButtonLoading } from '../LoadingStates'

/**
 * Showcase component to demonstrate all loading variants
 * Only for development/testing purposes
 */
const LoadingShowcase: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-theme-bg-primary">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-theme-text-primary">Loading Components Showcase</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-theme-accent-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Spinners */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-theme-text-primary border-b border-theme-border-primary pb-2">
              Basic Spinners
            </h2>
            
            <div className="bg-theme-bg-secondary rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-theme-text-primary">Spinner Variants</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" variant="spinner" />
                  <p className="text-sm text-theme-text-secondary">Spinner</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" variant="dots" />
                  <p className="text-sm text-theme-text-secondary">Dots</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" variant="pulse" />
                  <p className="text-sm text-theme-text-secondary">Pulse</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" variant="gradient" />
                  <p className="text-sm text-theme-text-secondary">Gradient</p>
                </div>
              </div>
            </div>

            <div className="bg-theme-bg-secondary rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-theme-text-primary">Sizes</h3>
              <div className="flex items-center justify-around">
                <div className="text-center space-y-2">
                  <LoadingSpinner size="xs" />
                  <p className="text-xs text-theme-text-secondary">XS</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="sm" />
                  <p className="text-xs text-theme-text-secondary">SM</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-theme-text-secondary">MD</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs text-theme-text-secondary">LG</p>
                </div>
                <div className="text-center space-y-2">
                  <LoadingSpinner size="xl" />
                  <p className="text-xs text-theme-text-secondary">XL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Loaders */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-theme-text-primary border-b border-theme-border-primary pb-2">
              Content Loaders
            </h2>
            
            <div className="bg-theme-bg-secondary rounded-lg p-6">
              <h3 className="font-medium text-theme-text-primary mb-4">Content Loader</h3>
              <ContentLoader 
                message="Loading your content"
                submessage="This might take a moment"
                variant="pulse"
              />
            </div>

            <div className="bg-theme-bg-secondary rounded-lg p-6">
              <h3 className="font-medium text-theme-text-primary mb-4">Compact Content Loader</h3>
              <ContentLoader 
                message="Loading data..."
                compact={true}
              />
            </div>
          </div>

          {/* Button Loading */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-theme-text-primary border-b border-theme-border-primary pb-2">
              Button Loading States
            </h2>
            
            <div className="bg-theme-bg-secondary rounded-lg p-6 space-y-4">
              <div className="space-y-3">
                <ButtonLoading text="Saving changes..." size="sm" />
                <ButtonLoading text="Loading data..." size="md" variant="dots" />
                <ButtonLoading text="Processing..." size="lg" />
              </div>
            </div>
          </div>

          {/* Centered Loader */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-theme-text-primary border-b border-theme-border-primary pb-2">
              Centered Loader
            </h2>
            
            <div className="bg-theme-bg-secondary rounded-lg p-6 h-64 relative">
              <CenteredLoader 
                message="App initializing..."
                variant="gradient"
                showLogo={true}
                fullScreen={false}
              />
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-theme-text-primary border-b border-theme-border-primary pb-2 mb-6">
            Floating Elements
          </h2>
          
          {/* Saving Indicator */}
          <SavingIndicator visible={true} variant="dots" />
          
          <div className="bg-theme-bg-secondary rounded-lg p-6">
            <p className="text-theme-text-secondary">
              Check the top-right corner for the floating saving indicator!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingShowcase