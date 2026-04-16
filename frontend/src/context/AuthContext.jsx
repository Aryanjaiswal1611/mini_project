import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

function buildUser(data) {
  return {
    id: data.user_id,
    name: data.user_name,
    role: data.role
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const data = await authApi.getMe()
      if (data.loggedIn) {
        setUser(buildUser(data))
      } else {
        localStorage.removeItem('token')
      }
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  const signup = async (userData) => {
    const data = await authApi.signup(userData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isRestaurant: user?.role === 'restaurant',
      isDelivery: user?.role === 'delivery',
      login,
      signup,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
