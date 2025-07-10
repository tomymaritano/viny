import { useState, useEffect } from 'react'
import Icons from './Icons'

const UpdateChecker = () => {
  const [updateStatus, setUpdateStatus] = useState('idle') // idle, checking, available, downloading, ready
  const [updateInfo, setUpdateInfo] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  // Check if running in Electron
  const isElectron = () => {
    return window && window.process && window.process.type
  }

  useEffect(() => {
    if (!isElectron()) return

    // Listen for update events from main process (would need IPC setup)
    // For now, we'll simulate the update checking process
    const checkForUpdates = () => {
      setUpdateStatus('checking')

      // Simulate update check (in real implementation, this would be handled by main process)
      setTimeout(() => {
        // Simulate no updates for now
        setUpdateStatus('idle')
      }, 2000)
    }

    // Auto-check for updates on component mount
    checkForUpdates()

    // Check for updates every hour
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleManualUpdateCheck = () => {
    if (!isElectron()) return

    setUpdateStatus('checking')
    // In real implementation, this would trigger IPC call to main process
    setTimeout(() => {
      setUpdateStatus('idle')
    }, 2000)
  }

  const handleInstallUpdate = () => {
    if (!isElectron()) return

    // In real implementation, this would trigger IPC call to main process
    // to quit and install the update
    console.log('Installing update...')
  }

  const handleDismissNotification = () => {
    setShowNotification(false)
  }

  if (!isElectron()) {
    return null // Don't show update checker in web version
  }

  return (
    <>
      {/* Update Status Indicator in Settings or Status Bar */}
      <div className="flex items-center space-x-2 text-xs text-theme-text-tertiary">
        {updateStatus === 'checking' && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-theme-accent-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Checking for updates...</span>
          </div>
        )}

        {updateStatus === 'idle' && (
          <button
            onClick={handleManualUpdateCheck}
            className="flex items-center space-x-1 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
          >
            <Icons.Download size={12} />
            <span>Check for updates</span>
          </button>
        )}

        {updateStatus === 'available' && (
          <div className="flex items-center space-x-1 text-theme-accent-green">
            <Icons.Download size={12} />
            <span>Update available</span>
          </div>
        )}

        {updateStatus === 'downloading' && (
          <div className="flex items-center space-x-2">
            <div className="w-12 h-1 theme-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-theme-accent-primary transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <span className="text-theme-accent-primary">
              {Math.round(downloadProgress)}%
            </span>
          </div>
        )}

        {updateStatus === 'ready' && (
          <button
            onClick={handleInstallUpdate}
            className="flex items-center space-x-1 text-theme-accent-green hover:text-theme-text-secondary transition-colors font-medium"
          >
            <Icons.Download size={12} />
            <span>Restart to update</span>
          </button>
        )}
      </div>

      {/* Update Notification Modal */}
      {showNotification && updateStatus === 'available' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl p-6 w-96">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-theme-accent-green/20 rounded-full flex items-center justify-center">
                <Icons.Download size={16} className="text-theme-accent-green" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-text-primary mb-2">
                  Update Available
                </h3>

                {updateInfo && (
                  <div className="space-y-2 text-sm text-theme-text-tertiary">
                    <p>
                      <strong>Version:</strong> {updateInfo.version}
                    </p>
                    {updateInfo.releaseNotes && (
                      <div>
                        <strong>What's new:</strong>
                        <div className="mt-1 text-theme-text-muted max-h-32 overflow-y-auto">
                          {updateInfo.releaseNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setUpdateStatus('downloading')
                      setShowNotification(false)
                      // Trigger download
                    }}
                    className="px-4 py-2 bg-theme-accent-green text-theme-bg-primary rounded hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Download Update
                  </button>

                  <button
                    onClick={handleDismissNotification}
                    className="px-4 py-2 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors text-sm"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismissNotification}
                className="flex-shrink-0 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
              >
                <Icons.X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress Notification */}
      {updateStatus === 'downloading' && (
        <div className="fixed bottom-4 right-4 theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Icons.Download size={20} className="text-theme-accent-primary" />
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-theme-text-primary mb-1">
                Downloading Update
              </div>

              <div className="w-full h-2 theme-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-theme-accent-primary transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>

              <div className="text-xs text-theme-text-tertiary mt-1">
                {Math.round(downloadProgress)}% complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready to Install Notification */}
      {updateStatus === 'ready' && (
        <div className="fixed bottom-4 right-4 theme-bg-secondary border border-theme-border-primary rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-theme-accent-green/20 rounded-full flex items-center justify-center">
              <Icons.Check size={16} className="text-theme-accent-green" />
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-theme-text-primary mb-1">
                Update Ready
              </div>
              <div className="text-xs text-theme-text-tertiary mb-3">
                Restart Nototo to install the update
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleInstallUpdate}
                  className="px-3 py-1 bg-theme-accent-green text-theme-bg-primary rounded hover:bg-green-600 transition-colors text-xs font-medium"
                >
                  Restart Now
                </button>
                <button
                  onClick={() => setUpdateStatus('idle')}
                  className="px-3 py-1 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors text-xs"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UpdateChecker
