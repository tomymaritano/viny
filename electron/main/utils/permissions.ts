import { session } from 'electron'

/**
 * Set up permission handlers for enhanced security
 */
export function setupPermissionHandlers(): void {
  // Handle permission requests
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Define which permissions to allow
    const allowedPermissions = [
      'clipboard-read',
      'clipboard-write'
    ]
    
    // Deny all permissions not explicitly allowed
    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      console.warn(`Permission denied: ${permission}`)
      callback(false)
    }
  })
  
  // Set permission check handler
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    // Only allow permissions from our app
    if (requestingOrigin === 'file://') {
      const allowedPermissions = [
        'clipboard-read',
        'clipboard-write'
      ]
      return allowedPermissions.includes(permission)
    }
    
    return false
  })
  
  // Disable device enumeration
  session.defaultSession.setDevicePermissionHandler(() => {
    return false
  })
  
  // Don't clear storage data on app start to preserve user data
}