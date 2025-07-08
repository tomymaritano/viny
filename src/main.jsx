import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { runMigration } from './utils/migration.js'

// Run migration before app initialization
runMigration()
// Migration completed

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
