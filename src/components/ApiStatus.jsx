import { useState, useEffect } from 'react'
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
    } catch (error) {
      console.error('API health check failed:', error)
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
        return 'text-solarized-base1'
      default:
        return 'text-solarized-base1'
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
    <div className="fixed bottom-4 left-4 bg-solarized-base02 border border-solarized-base01 rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-3">
        {/* Storage Mode Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getModeColor()}`}>
            {getModeIcon()}
            <span className="text-xs font-medium">{getStatusText()}</span>
          </div>

          {lastCheck && (
            <span className="text-xs text-solarized-base0">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Storage Mode Toggle */}
        <div className="flex items-center space-x-2 border-l border-solarized-base01 pl-3">
          <span className="text-xs text-solarized-base1">Storage:</span>
          <button
            onClick={onToggleApi}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isUsingApi
                ? 'bg-solarized-blue text-solarized-base5'
                : 'bg-solarized-base01 text-solarized-base3 hover:bg-solarized-base00'
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
            className="text-solarized-base1 hover:text-solarized-base3 transition-colors"
            title="Refresh API status"
          >
            <Icons.RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Status Details */}
      {apiStatus === 'offline' && (
        <div className="mt-2 pt-2 border-t border-solarized-base01">
          <p className="text-xs text-solarized-base0">
            Make sure the backend server is running on localhost:3001
          </p>
          <button
            onClick={checkApiHealth}
            className="text-xs text-solarized-blue hover:text-solarized-cyan transition-colors mt-1"
          >
            Retry connection
          </button>
        </div>
      )}

      {isUsingApi && apiStatus === 'online' && (
        <div className="mt-2 pt-2 border-t border-solarized-base01">
          <p className="text-xs text-solarized-base0">
            Using database storage via API
          </p>
        </div>
      )}

      {!isUsingApi && (
        <div className="mt-2 pt-2 border-t border-solarized-base01">
          <p className="text-xs text-solarized-base0">
            Using browser localStorage
          </p>
        </div>
      )}
    </div>
  )
}

export default ApiStatus
