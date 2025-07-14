import React from 'react'
import SettingsModal from './components/settings/SettingsModal'
import './App.css'

const SettingsStandalone: React.FC = () => {
  return (
    <div className="app">
      <SettingsModal
        isOpen={true}
        onClose={() => {
          // In Electron, close the window
          if ((window as any).electronAPI?.isElectron) {
            window.close()
          }
        }}
      />
    </div>
  )
}

export default SettingsStandalone
