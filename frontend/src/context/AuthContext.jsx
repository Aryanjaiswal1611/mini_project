import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const data = await api.get('/me')
      if (data.loggedIn) {
        setUser({
          id: data.user_id,
          name: data.user_name,
          role: data.role
        })
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const data = await api.post('/login', { email, password })
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role
      })
    }
    return data
  }

  const signup = async (userData) => {
    const data = await api.post('/signup', userData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser({
        id: data.user.id,
        name: data.user.name,
        role: data.user.role
      })
    }
    return data
  }

  const logout = async () => {
    try {
      await api.post('/logout', {})
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isRestaurant = user?.role === 'restaurant'
  const isDelivery = user?.role === 'delivery'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isRestaurant,
      isDelivery,
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
