import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { getMe } from '../api'

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setTokenState(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const setToken = (t: string) => {
    localStorage.setItem('token', t)
    setTokenState(t)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
