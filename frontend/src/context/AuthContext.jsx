import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize authentication state on application boot
  useEffect(() => {
    try {
      const stored = authService.getStoredAuth()
      if (stored) {
        setUser(stored.user)
        setToken(stored.token)
        setRole(stored.role)
      }
    } catch (err) {
      console.error('Failed to restore authentication state:', err)
      authService.logout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login handler
  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials)
    setToken(result.token)
    setRole(result.role)
    setUser(result.user)
    return result
  }, [])

  // Register handler
  const register = useCallback(async (userData) => {
    return await authService.register(userData)
  }, [])

  // Logout handler
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setToken(null)
    setRole(null)
  }, [])

  const value = {
    user,
    token,
    role,
    isAuthenticated: Boolean(token && role),
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
