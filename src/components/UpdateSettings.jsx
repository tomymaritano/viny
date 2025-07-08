import { useState, useEffect } from 'react'
import Icons from './Icons'

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

  const handleAutoUpdateToggle = () => {
    const newValue = !autoUpdateEnabled
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-solarized-base5">
          Auto-Updates
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-solarized-base1">
            {autoUpdateEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={handleAutoUpdateToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoUpdateEnabled ? 'bg-solarized-green' : 'bg-solarized-base01'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoUpdateEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="text-sm text-solarized-base1">
        <p>
          Automatically check for and download updates in the background. You'll
          be notified when an update is ready to install.
        </p>
      </div>

      {/* Update Channel Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-solarized-base3">
          Update Channel
        </label>
        <div className="flex space-x-2">
          {['stable', 'beta'].map(channel => (
            <button
              key={channel}
              onClick={() => handleChannelChange(channel)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                updateChannel === channel
                  ? 'bg-solarized-blue text-solarized-base03 border-solarized-blue'
                  : 'text-solarized-base1 border-solarized-base01 hover:bg-solarized-base01'
              }`}
            >
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-solarized-base0">
          {updateChannel === 'stable'
            ? 'Receive only stable, tested releases (recommended)'
            : 'Receive beta releases with new features (may be less stable)'}
        </p>
      </div>

      {/* Last Update Check */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-solarized-base1">
            Last checked: {formatLastCheck()}
          </span>
          <button
            onClick={handleManualCheck}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-solarized-base01 text-solarized-base3 rounded hover:bg-solarized-base00 transition-colors"
          >
            <Icons.Download size={12} />
            <span>Check Now</span>
          </button>
        </div>
      </div>

      {/* Current Version Info */}
      <div className="pt-4 border-t border-solarized-base01">
        <div className="flex items-center justify-between text-sm">
          <span className="text-solarized-base1">Current Version</span>
          <span className="text-solarized-base3 font-mono">v1.1.0</span>
        </div>
      </div>
    </div>
  )
}

export default UpdateSettings
