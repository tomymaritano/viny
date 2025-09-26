import type { StateCreator } from 'zustand'
import { apiLogger } from '../../utils/logger'

export interface User {
  id: number
  email: string
  name?: string
  avatar?: string
  emailVerified?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  accessToken: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>
  verifyToken: () => Promise<boolean>
}

export type AuthSlice = AuthState & AuthActions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken:
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()

      // Store access token
      localStorage.setItem('accessToken', data.data.accessToken)

      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: data.data.accessToken,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
        user: null,
        isAuthenticated: false,
        accessToken: null,
      })
      localStorage.removeItem('accessToken')
      throw error
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()

      // Store access token
      localStorage.setItem('accessToken', data.data.accessToken)

      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: data.data.accessToken,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        user: null,
        isAuthenticated: false,
        accessToken: null,
      })
      localStorage.removeItem('accessToken')
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })

    try {
      const { accessToken } = get()
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        })
      }
    } catch (error) {
      apiLogger.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('accessToken')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
      })
    }
  },

  refreshToken: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()

      // Store new access token
      localStorage.setItem('accessToken', data.data.accessToken)

      set({
        accessToken: data.data.accessToken,
        error: null,
      })

      return data.data.accessToken
    } catch (error) {
      // If refresh fails, logout user
      localStorage.removeItem('accessToken')
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        error: 'Session expired',
      })
      throw error
    }
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    set({ isLoading: true, error: null })

    try {
      const { accessToken } = get()
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Profile update failed')
      }

      const responseData = await response.json()

      set({
        user: responseData.data.user,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      })
      throw error
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null })

    try {
      const { accessToken } = get()
      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Password change failed')
      }

      // Password change successful, user needs to login again
      localStorage.removeItem('accessToken')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
      })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Password change failed',
      })
      throw error
    }
  },

  verifyToken: async () => {
    const { accessToken } = get()
    if (!accessToken) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Token verification failed')
      }

      const data = await response.json()

      set({
        user: data.data.user,
        isAuthenticated: true,
        error: null,
      })

      return true
    } catch (error) {
      localStorage.removeItem('accessToken')
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        error: null,
      })
      return false
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setUser: (user: User | null) => set({ user }),
  setAccessToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
    set({ accessToken: token })
  },
})

// Initialize auth state from localStorage
export const initializeAuth = (store: AuthSlice) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) {
    store.setAccessToken(token)
    // Verify token on initialization
    store.verifyToken().catch(() => {
      // If verification fails, token will be cleared automatically
    })
  }
}
