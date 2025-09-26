# Configuration Options

## General Settings

### Theme

- **Dark Mode**: Enable/disable dark theme
- **System Theme**: Follow system preference
- **Custom Colors**: Customize accent colors

### Language

- **Interface Language**: Select UI language
- **Date Format**: Customize date display format
- **Time Format**: 12-hour or 24-hour format

## Editor Settings

### Font Configuration

```javascript
{
  "editor": {
    "fontFamily": "Monaco, 'Courier New', monospace",
    "fontSize": "14px",
    "lineHeight": "1.5",
    "showLineNumbers": true,
    "wordWrap": true
  }
}
```

### Markdown Settings

```javascript
{
  "markdown": {
    "fontFamily": "system-ui, -apple-system, sans-serif",
    "fontSize": "16px",
    "lineHeight": "1.6",
    "mathSupport": true,
    "codeHighlighting": true
  }
}
```

## Storage Configuration

### Local Storage

- **Auto-save Interval**: 1-60 seconds
- **Backup Frequency**: Daily/Weekly/Monthly
- **Storage Location**: Browser localStorage

### Sync Settings

- **Auto-sync**: Enable/disable automatic sync
- **Sync Interval**: 5-300 seconds
- **Conflict Resolution**: Choose merge strategy

## Privacy Settings

### Data Collection

- **Analytics**: Enable/disable usage analytics
- **Error Reporting**: Automatic error reports
- **Telemetry**: System performance data

### Security

- **Auto-lock**: Lock after inactivity
- **Session Timeout**: Automatic logout
- **Secure Storage**: Encrypt local data

## Advanced Configuration

### Performance

```javascript
{
  "performance": {
    "enableVirtualization": true,
    "searchIndexing": true,
    "lazyLoading": true,
    "maxCacheSize": "100MB"
  }
}
```

### Plugins

```javascript
{
  "plugins": {
    "enabled": true,
    "allowExternalPlugins": false,
    "sandboxMode": true,
    "pluginDirectory": "./plugins"
  }
}
```

## Environment Variables

### Development

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_PLUGINS=true
VITE_DEBUG_MODE=true
```

### Production

```env
VITE_API_BASE_URL=https://api.viny.app
VITE_ENABLE_PLUGINS=false
VITE_DEBUG_MODE=false
```

## Configuration File

Create a `.viny.config.js` file in your project root:

```javascript
export default {
  // Theme configuration
  theme: {
    default: 'dark',
    colors: {
      primary: '#007acc',
      secondary: '#6b7280',
    },
  },

  // Editor configuration
  editor: {
    defaultFontSize: '14px',
    showLineNumbers: true,
    wordWrap: true,
  },

  // Feature flags
  features: {
    enablePlugins: true,
    enableExport: true,
    enableBackup: true,
  },
}
```

## Importing/Exporting Settings

### Export Settings

```javascript
// Export current settings
const settings = viny.exportSettings()
console.log(JSON.stringify(settings, null, 2))
```

### Import Settings

```javascript
// Import settings from JSON
const settingsData = {
  /* your settings */
}
viny.importSettings(settingsData)
```

## Resetting Configuration

### Reset to Defaults

1. Open Settings
2. Go to "Advanced"
3. Click "Reset to Defaults"
4. Confirm the action

### Manual Reset

```javascript
// Clear all settings
localStorage.removeItem('viny-settings')
// Reload the page
location.reload()
```

## Validation

Settings are validated on import/change:

- Required fields must be present
- Values must be within acceptable ranges
- Invalid settings are rejected with error messages
- Fallback to defaults for invalid values
