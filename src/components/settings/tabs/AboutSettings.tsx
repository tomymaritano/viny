import React from 'react'
import Icons from '../../Icons'

const AboutSettings: React.FC = () => {
  const appInfo = {
    version: '1.2.4',
    electron: window.electronAPI?.isElectron ? 'Desktop' : 'Web',
    platform: navigator.platform,
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          About Viny
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-theme-accent-primary/10 rounded-lg flex items-center justify-center">
              <Icons.NotebookText size={32} className="text-theme-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-theme-text-primary">Viny</h1>
              <p className="text-sm text-theme-text-secondary">
                A beautiful note-taking app for developers
              </p>
            </div>
          </div>

          <div className="bg-theme-bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">Version:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {appInfo.version}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">Platform:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {appInfo.electron}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-theme-text-secondary">System:</span>
              <span className="text-sm font-medium text-theme-text-primary">
                {appInfo.platform}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h4 className="text-sm font-medium text-theme-text-primary mb-3">
          Resources
        </h4>
        <div className="space-y-2">
          <a
            href="https://github.com/tomymaritano/viny"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-theme-accent-primary hover:underline"
          >
            <Icons.Globe size={14} />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://github.com/tomymaritano/viny/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-theme-accent-primary hover:underline"
          >
            <Icons.AlertTriangle size={14} />
            <span>Report an Issue</span>
          </a>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h4 className="text-sm font-medium text-theme-text-primary mb-3">
          Credits
        </h4>
        <div className="space-y-2 text-sm text-theme-text-secondary">
          <p>Built with React, Electron, and TypeScript</p>
          <p>Icons by Lucide</p>
          <p>Markdown rendering by markdown-it</p>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <div className="bg-theme-bg-secondary rounded-lg p-4">
          <p className="text-xs text-theme-text-muted text-center">
            Made with ❤️ by the Viny team
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutSettings