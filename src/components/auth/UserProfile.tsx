import React, { useState } from 'react'
import { BaseModal } from '../ui/BaseModal'
import { useStyles } from '../../hooks/useStyles'
import { useAppStore } from '../../stores/newSimpleStore'
import { Icons } from '../Icons'
import StyledButton from '../ui/StyledButton'
import { useToast } from '../../hooks/useToast'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

interface ProfileFormData {
  name: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type TabType = 'profile' | 'password' | 'account'

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const { 
    user, 
    isLoading, 
    error, 
    clearError, 
    updateProfile, 
    changePassword, 
    logout 
  } = useAppStore()
  const { showSuccess, showError } = useToast()
  const styles = useStyles()

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        name: user.name || '',
        email: user.email,
      })
    }
  }, [isOpen, user])

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateProfileForm()) {
      return
    }

    try {
      await updateProfile({
        name: profileData.name,
      })
      showSuccess('Your profile has been updated successfully.')
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validatePasswordForm()) {
      return
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      showSuccess('Your password has been changed successfully. Please sign in again.')
      onClose()
    } catch (error) {
      console.error('Password change error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      showSuccess('You have been signed out successfully.')
      onClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (activeTab === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }))
    } else if (activeTab === 'password') {
      setPasswordData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const renderProfileTab = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-theme-text-primary mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={profileData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={styles.cn(
            'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent-primary',
            errors.name
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-theme-border-primary bg-theme-bg-secondary'
          )}
          placeholder="Enter your full name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-theme-text-primary mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={profileData.email}
          className="w-full px-3 py-2 border border-theme-border-primary bg-theme-bg-tertiary rounded-lg text-theme-text-secondary cursor-not-allowed"
          disabled
        />
        <p className="text-xs text-theme-text-secondary mt-1">
          Email cannot be changed at this time
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <StyledButton
          variant="primary"
          onClick={handleProfileSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Icons.Loader className="animate-spin" size={16} />
              Updating...
            </span>
          ) : (
            'Update Profile'
          )}
        </StyledButton>
        <StyledButton
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </StyledButton>
      </div>
    </form>
  )

  const renderPasswordTab = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-theme-text-primary mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            value={passwordData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            className={styles.cn(
              'w-full px-3 py-2 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent-primary',
              errors.currentPassword
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-theme-border-primary bg-theme-bg-secondary'
            )}
            placeholder="Enter current password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-2 top-2 p-1 text-theme-text-secondary hover:text-theme-text-primary"
            disabled={isLoading}
          >
            {showPasswords.current ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-theme-text-primary mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            value={passwordData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className={styles.cn(
              'w-full px-3 py-2 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent-primary',
              errors.newPassword
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-theme-border-primary bg-theme-bg-secondary'
            )}
            placeholder="Enter new password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-2 top-2 p-1 text-theme-text-secondary hover:text-theme-text-primary"
            disabled={isLoading}
          >
            {showPasswords.new ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text-primary mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={styles.cn(
              'w-full px-3 py-2 pr-10 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent-primary',
              errors.confirmPassword
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-theme-border-primary bg-theme-bg-secondary'
            )}
            placeholder="Confirm new password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-2 top-2 p-1 text-theme-text-secondary hover:text-theme-text-primary"
            disabled={isLoading}
          >
            {showPasswords.confirm ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <StyledButton
          variant="primary"
          onClick={handlePasswordSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Icons.Loader className="animate-spin" size={16} />
              Changing...
            </span>
          ) : (
            'Change Password'
          )}
        </StyledButton>
        <StyledButton
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </StyledButton>
      </div>
    </form>
  )

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-lg">
            <div>
              <p className="text-sm font-medium text-theme-text-primary">Email</p>
              <p className="text-sm text-theme-text-secondary">{user?.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-lg">
            <div>
              <p className="text-sm font-medium text-theme-text-primary">Member Since</p>
              <p className="text-sm text-theme-text-secondary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-theme-bg-secondary rounded-lg">
            <div>
              <p className="text-sm font-medium text-theme-text-primary">Last Login</p>
              <p className="text-sm text-theme-text-secondary">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-theme-border-primary pt-6">
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Sign Out
        </h3>
        <p className="text-sm text-theme-text-secondary mb-4">
          Sign out of your account on this device.
        </p>
        <StyledButton
          variant="outline"
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Icons.Loader className="animate-spin" size={16} />
              Signing out...
            </span>
          ) : (
            <>
              <Icons.LogOut className="mr-2" size={16} />
              Sign Out
            </>
          )}
        </StyledButton>
      </div>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      maxWidth="md"
      icon={<Icons.User size={20} />}
    >
      <div className="border-b border-theme-border-primary">
        <div className="flex">
          {[
            { id: 'profile', label: 'Profile', icon: Icons.User },
            { id: 'password', label: 'Password', icon: Icons.Lock },
            { id: 'account', label: 'Account', icon: Icons.Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={styles.cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-theme-accent-primary border-b-2 border-theme-accent-primary'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Server error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'password' && renderPasswordTab()}
        {activeTab === 'account' && renderAccountTab()}
      </div>
    </BaseModal>
  )
}

export default UserProfile