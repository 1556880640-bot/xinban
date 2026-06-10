import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { auth as authApi, setToken, clearToken, getStoredUser, setStoredUser } from '@/lib/api'

interface User {
  id: string
  username: string
  email?: string
  inviteCode: string
  invitedBy?: string
  subscriptionTier: string
  subscriptionExpiresAt?: string
  trialEndsAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email?: string, inviteCode?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('xinban_token')
    if (token) {
      authApi.getMe()
        .then((u: any) => {
          setUser(u)
          setStoredUser(u)
        })
        .catch(() => {
          clearToken()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    setToken(res.token)
    setStoredUser(res.user)
    setUser(res.user)
  }

  const register = async (username: string, password: string, email?: string, inviteCode?: string) => {
    const res = await authApi.register({ username, password, email, inviteCode })
    setToken(res.token)
    setStoredUser(res.user)
    setUser(res.user)
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
