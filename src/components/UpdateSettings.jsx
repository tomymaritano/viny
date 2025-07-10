import { useState, useEffect } from 'react'
import Icons from './Icons'
import CustomSwitch from './ui/CustomSwitch'
import packageInfo from '../../package.json'

const UpdateSettings = () => {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)
  const [updateChannel, setUpdateChannel] = useState('stable')
  const [lastUpdateCheck, setLastUpdateCheck] = useState(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('nototo_update_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setAutoUpdateEnabled(settings.autoUpdateEnabled ?? true)
      setUpdateChannel(settings.updateChannel ?? 'stable')
      setLastUpdateCheck(settings.lastUpdateCheck)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = newSettings => {
    const settings = {
      autoUpdateEnabled,
      updateChannel,
      lastUpdateCheck,
      ...newSettings,
    }
    localStorage.setItem('nototo_update_settings', JSON.stringify(settings))
  }

  const handleAutoUpdateToggle = newValue => {
    setAutoUpdateEnabled(newValue)
    saveSettings({ autoUpdateEnabled: newValue })
  }

  const handleChannelChange = channel => {
    setUpdateChannel(channel)
    saveSettings({ updateChannel: channel })
  }

  const handleManualCheck = () => {
    const now = new Date().toISOString()
    setLastUpdateCheck(now)
    saveSettings({ lastUpdateCheck: now })

    // In a real implementation, this would trigger the update check
    console.log('Manual update check triggered')
  }

  const formatLastCheck = () => {
    if (!lastUpdateCheck) return 'Never'

    const date = new Date(lastUpdateCheck)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Current Version */}
      <div className="theme-bg-tertiary rounded-lg p-4 border border-theme-border-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-theme-accent-primary/20 rounded-full flex items-center justify-center">
            <Icons.Info size={16} className="text-theme-accent-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-text-secondary">
              Current Version
            </h4>
            <p className="text-lg font-mono text-theme-text-primary">
              v{packageInfo.version}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-theme-text-primary">
          Auto-Updates
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-theme-text-tertiary">
            {autoUpdateEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <CustomSwitch
            checked={autoUpdateEnabled}
            onChange={handleAutoUpdateToggle}
            size="md"
          />
        </div>
      </div>

      <div className="text-sm text-theme-text-tertiary">
        <p>
          Automatically check for and download updates in the background. You'll
          be notified when an update is ready to install.
        </p>
      </div>

      {/* Update Channel Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-theme-text-secondary">
          Update Channel
        </label>
        <div className="flex space-x-2">
          {['stable', 'beta'].map(channel => (
            <button
              key={channel}
              onClick={() => handleChannelChange(channel)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                updateChannel === channel
                  ? 'bg-theme-accent-primary text-theme-bg-primary border-theme-accent-primary'
                  : 'text-theme-text-tertiary border-theme-border-primary hover:theme-bg-tertiary'
              }`}
            >
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-theme-text-muted">
          {updateChannel === 'stable'
            ? 'Receive only stable, tested releases (recommended)'
            : 'Receive beta releases with new features (may be less stable)'}
        </p>
      </div>

      {/* Last Update Check */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-text-tertiary">
            Last checked: {formatLastCheck()}
          </span>
          <button
            onClick={handleManualCheck}
            className="flex items-center space-x-1 px-3 py-1 text-xs theme-bg-tertiary text-theme-text-secondary rounded hover:theme-bg-quaternary transition-colors"
          >
            <Icons.Download size={12} />
            <span>Check Now</span>
          </button>
        </div>
      </div>

      {/* Current Version Info */}
      <div className="pt-4 border-t border-theme-border-primary">
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-text-tertiary">Current Version</span>
          <span className="text-theme-text-secondary font-mono">v1.1.1</span>
        </div>
      </div>
    </div>
  )
}

export default UpdateSettings
