import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { healthApi } from '../services/api'
import Icons from './Icons'

const ApiStatus = ({ storageMode, isUsingApi, onToggleApi }) => {
  const [apiStatus, setApiStatus] = useState('checking')
  const [lastCheck, setLastCheck] = useState(null)

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking')
      const health = await healthApi.check()
      setApiStatus(health.status === 'OK' ? 'online' : 'error')
      setLastCheck(new Date())
    } catch {
      // API health check failed - handled silently
      setApiStatus('offline')
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    checkApiHealth()

    // Check every 30 seconds if using API
    const interval = isUsingApi ? setInterval(checkApiHealth, 30000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isUsingApi])

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online':
        return 'text-green-400'
      case 'offline':
        return 'text-red-400'
      case 'error':
        return 'text-yellow-400'
      case 'checking':
        return 'text-theme-text-tertiary'
      default:
        return 'text-theme-text-tertiary'
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'online':
        return <Icons.CheckCircle size={14} />
      case 'offline':
        return <Icons.XCircle size={14} />
      case 'error':
        return <Icons.AlertTriangle size={14} />
      case 'checking':
        return <Icons.Clock size={14} />
      default:
        return <Icons.Circle size={14} />
    }
  }

  const getStatusText = () => {
    if (storageMode === 'localStorage') {
      return 'Local Mode'
    }

    switch (apiStatus) {
      case 'online':
        return 'API Online'
      case 'offline':
        return 'API Offline'
      case 'error':
        return 'API Error'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const getModeIcon = () => {
    if (storageMode === 'localStorage') {
      return <Icons.Circle size={14} />
    }
    return getStatusIcon()
  }

  const getModeColor = () => {
    if (storageMode === 'localStorage') {
      return 'text-blue-400'
    }
    return getStatusColor()
  }

  return (
    <div className="fixed bottom-4 left-4 theme-bg-secondary border border-theme-border-primary rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-3">
        {/* Storage Mode Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getModeColor()}`}>
            {getModeIcon()}
            <span className="text-xs font-medium">{getStatusText()}</span>
          </div>

          {lastCheck && (
            <span className="text-xs text-theme-text-muted">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Storage Mode Toggle */}
        <div className="flex items-center space-x-2 border-l border-theme-border-primary pl-3">
          <span className="text-xs text-theme-text-tertiary">Storage:</span>
          <button
            onClick={onToggleApi}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isUsingApi
                ? 'bg-theme-accent-primary text-theme-text-primary'
                : 'theme-bg-tertiary text-theme-text-secondary hover:theme-bg-quaternary'
            }`}
            title={isUsingApi ? 'Switch to localStorage' : 'Switch to API'}
          >
            {isUsingApi ? 'API' : 'Local'}
          </button>
        </div>

        {/* Refresh Button */}
        {isUsingApi && (
          <button
            onClick={checkApiHealth}
            className="text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
            title="Refresh API status"
          >
            <Icons.RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Status Details */}
      {apiStatus === 'offline' && (
        <div className="mt-2 pt-2 border-t border-theme-border-primary">
          <p className="text-xs text-theme-text-muted">
            Make sure the backend server is running on localhost:3001
          </p>
          <button
            onClick={checkApiHealth}
            className="text-xs text-theme-accent-primary hover:text-theme-accent-cyan transition-colors mt-1"
          >
            Retry connection
          </button>
        </div>
      )}

      {isUsingApi && apiStatus === 'online' && (
        <div className="mt-2 pt-2 border-t border-theme-border-primary">
          <p className="text-xs text-theme-text-muted">
            Using database storage via API
          </p>
        </div>
      )}

      {!isUsingApi && (
        <div className="mt-2 pt-2 border-t border-theme-border-primary">
          <p className="text-xs text-theme-text-muted">
            Using browser localStorage
          </p>
        </div>
      )}
    </div>
  )
}

ApiStatus.propTypes = {
  storageMode: PropTypes.oneOf(['localStorage', 'api']).isRequired,
  isUsingApi: PropTypes.bool.isRequired,
  onToggleApi: PropTypes.func.isRequired,
}

export default ApiStatus
