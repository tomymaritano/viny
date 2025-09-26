import React, { useState, useEffect } from 'react'
import { Label } from '../../ui/Label'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Icons } from '../../Icons'
import { useToast } from '../../../hooks/useToast'
import { SettingRow } from '../components/SettingRow'
import { FormSection } from '../components/FormSection'
import { ToggleSwitch } from '../components/ToggleSwitch'
import { settingsLogger } from '../../../utils/logger'

interface MCPStatus {
  enabled: boolean
  version: string
  resources: string[]
  tools: string[]
  configuration: {
    serverPath: string
    configLocation: {
      mac: string
      windows: string
      linux: string
    }
  }
}

export const MCPSettings: React.FC = () => {
  const { showToast } = useToast()
  const [status, setStatus] = useState<MCPStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => {
    fetchMCPStatus()
  }, [])

  const fetchMCPStatus = async () => {
    try {
      const response = await fetch('/api/auth/mcp-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      settingsLogger.error('Failed to fetch MCP status:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateToken = async () => {
    if (!email || !password) {
      showToast('error', 'Please enter your email and password')
      return
    }

    setGeneratingToken(true)
    try {
      const response = await fetch('/api/auth/mcp-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        showToast('success', 'MCP token generated successfully')
        setEmail('')
        setPassword('')
      } else {
        showToast('error', 'Failed to generate token. Check your credentials.')
      }
    } catch (error) {
      showToast('error', 'Failed to generate token')
    } finally {
      setGeneratingToken(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', 'Copied to clipboard')
  }

  const getPlatformConfig = () => {
    const platform = navigator.platform.toLowerCase()
    if (platform.includes('mac'))
      return status?.configuration.configLocation.mac
    if (platform.includes('win'))
      return status?.configuration.configLocation.windows
    return status?.configuration.configLocation.linux
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="MCP Integration"
        description="Connect Viny with Claude Desktop using Model Context Protocol"
      >
        <div className="space-y-4">
          <SettingRow
            label="Status"
            description="Current MCP integration status"
          >
            <div className="flex items-center gap-2">
              {status?.enabled ? (
                <>
                  <Icons.CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Enabled (v{status.version})</span>
                </>
              ) : (
                <>
                  <Icons.XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Disabled</span>
                </>
              )}
            </div>
          </SettingRow>

          <SettingRow
            label="Enable MCP"
            description="Allow Claude Desktop to access your notes"
          >
            <ToggleSwitch
              enabled={status?.enabled || false}
              onChange={enabled => {
                // In a real implementation, this would update the server config
                showToast('info', 'MCP settings require server restart')
              }}
            />
          </SettingRow>
        </div>
      </FormSection>

      <FormSection
        title="Generate MCP Token"
        description="Create a secure token for Claude Desktop authentication"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your Viny password"
            />
          </div>

          <Button
            onClick={generateToken}
            disabled={generatingToken || !email || !password}
          >
            {generatingToken ? (
              <>
                <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Icons.Key className="w-4 h-4 mr-2" />
                Generate Token
              </>
            )}
          </Button>

          {token && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <Label className="text-sm font-medium">Your MCP Token</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(token)}
                >
                  <Icons.Copy className="w-4 h-4" />
                </Button>
              </div>
              <code className="block text-xs break-all bg-gray-200 dark:bg-gray-700 p-2 rounded">
                {token}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                This token expires in 30 days. Keep it secure!
              </p>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Setup Instructions"
        description="How to configure Claude Desktop with Viny"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Configuration File Location</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <code className="text-sm">{getPlatformConfig()}</code>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={() => copyToClipboard(getPlatformConfig() || '')}
              >
                <Icons.Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Server Path</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <code className="text-sm">
                {status?.configuration.serverPath}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={() =>
                  copyToClipboard(status?.configuration.serverPath || '')
                }
              >
                <Icons.Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Add to Configuration</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Add this configuration to your Claude Desktop config file:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
              {`{
  "mcpServers": {
    "viny": {
      "command": "node",
      "args": ["${status?.configuration.serverPath}"],
      "env": {
        "MCP_JWT_SECRET": "your-jwt-secret",
        "DATABASE_URL": "file:/path/to/nototo.db"
      }
    }
  }
}`}
            </pre>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Available Resources"
        description="Resources exposed to Claude Desktop"
      >
        <div className="grid grid-cols-2 gap-4">
          {status?.resources.map(resource => (
            <div key={resource} className="flex items-center gap-2">
              <Icons.FileText className="w-4 h-4 text-gray-500" />
              <code className="text-sm">{resource}</code>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Available Tools"
        description="Actions Claude can perform on your notes"
      >
        <div className="grid grid-cols-2 gap-4">
          {status?.tools.map(tool => (
            <div key={tool} className="flex items-center gap-2">
              <Icons.Tool className="w-4 h-4 text-gray-500" />
              <code className="text-sm">{tool}</code>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Security"
        description="Control MCP access and permissions"
      >
        <div className="space-y-4">
          <SettingRow
            label="Audit Logging"
            description="Log all MCP requests for security monitoring"
          >
            <ToggleSwitch
              enabled={true}
              onChange={() =>
                showToast('info', 'Audit logging is always enabled')
              }
            />
          </SettingRow>

          <SettingRow
            label="Token Expiry"
            description="MCP tokens expire after this period"
          >
            <span className="text-sm">30 days</span>
          </SettingRow>

          <div className="pt-4">
            <Button variant="outline" className="text-red-600">
              <Icons.Trash className="w-4 h-4 mr-2" />
              Revoke All Tokens
            </Button>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
