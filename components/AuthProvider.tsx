"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

type User = {
  id: string
  name?: string
  username: string
  email?: string
  first_name?: string
  last_name?: string
  role?: string
}

type AuthContextValue = {
  user: User | null
  access: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<User | null>
  register: (data: Record<string, unknown>) => Promise<void>
  registerAgent: (data: Record<string, unknown>) => Promise<void>
  setSession: (user: User, accessToken: string, refreshToken?: string | null) => void
  logout: () => void
  refreshAccess: () => Promise<boolean>
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

type AuthErrorBody = {
  detail?: string
}

import { getPublicApiUrl } from "@/lib/apiConfig";

const resolveApiBase = () => getPublicApiUrl()

const normalizeUser = (user: Partial<User> & { username?: string; first_name?: string; last_name?: string }) => ({
  id: user.id || '',
  name: user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'User',
  username: user.username || '',
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  role: user.role,
}) as User

const unwrapResponse = <T extends Record<string, unknown>>(payload: unknown): T => {
  if (!payload || typeof payload !== 'object') return {} as T
  const response = payload as Record<string, unknown>
  if (response.data && typeof response.data === 'object') {
    return response.data as T
  }
  return response as T
}

const setBrowserCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

const getBrowserCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}

const clearBrowserCookie = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

const persistTokens = (accessToken: string, refreshToken?: string | null) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_KEY, accessToken)
  setBrowserCookie(ACCESS_KEY, accessToken, 60 * 60)
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken)
    setBrowserCookie(REFRESH_KEY, refreshToken, 60 * 60 * 24)
  }
}

const getStoredToken = (key: string) => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key) || getBrowserCookie(key)
}

const clearStoredTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  clearBrowserCookie(ACCESS_KEY)
  clearBrowserCookie(REFRESH_KEY)
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [access, setAccess] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Try to rehydrate from browser storage/cookies and attempt profile fetch
    const tryRestore = async () => {
      setIsLoading(true)
      const storedAccess = getStoredToken(ACCESS_KEY)
      const storedRefresh = getStoredToken(REFRESH_KEY)

      if (storedAccess) {
        setAccess(storedAccess)
      }

      if (storedRefresh && !storedAccess) {
        const ok = await refreshAccess()
        if (ok) await loadProfile()
        setIsLoading(false)
        return
      }

      if (storedAccess) {
        await loadProfile(storedAccess)
      }
      setIsLoading(false)
    }
    tryRestore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveTokens = (accessToken: string, refreshToken?: string | null) => {
    setAccess(accessToken)
    persistTokens(accessToken, refreshToken)
  }

  const setSession = (userData: User, accessToken: string, refreshToken?: string | null) => {
    saveTokens(accessToken, refreshToken)
    setUser(normalizeUser(userData))
  }

  const clearTokens = () => {
    setAccess(null)
    clearStoredTokens()
  }

  const login = async (username: string, password: string) => {
    const apiBase = resolveApiBase()
    const url = `${apiBase}/auth/login/`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!res.ok) {
      let detail = ''
          try {
            const json = await res.json() as AuthErrorBody | Record<string, unknown>
            detail = (json.detail as string) || JSON.stringify(json)
          } catch {
        detail = await res.text().catch(() => '')
      }
      console.error('Login error', res.status, detail, 'requested URL', url)
      throw new Error(`Login failed (${res.status}) ${detail || '- configure NEXT_PUBLIC_API_URL to your backend base URL -'}`)
    }
    const data = unwrapResponse<{ access?: string; refresh?: string; user?: Partial<User> }>(await res.json())
    if (!data.access) throw new Error('Login response did not include an access token')
    saveTokens(data.access, data.refresh)
    
    let userData: User | null = null
    if (data.user) {
      userData = normalizeUser(data.user)
    } else {
      try {
        const profileRes = await fetch(`${apiBase}/auth/profile/`, {
          headers: { 'Authorization': `Bearer ${data.access}` }
        })
        if (profileRes.ok) {
          const d = unwrapResponse<Partial<User>>(await profileRes.json())
          userData = normalizeUser(d)
        }
      } catch (err) {
        console.error('Failed to load user profile during login:', err)
      }
    }
    setUser(userData)
    return userData
  }

  const register = async (payload: Record<string, unknown>) => {
    const apiBase = resolveApiBase()
    const url = `${apiBase}/auth/register/`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      let detail = ''
          try {
            const json = await res.json() as AuthErrorBody | Record<string, unknown>
            detail = (json.detail as string) || JSON.stringify(json)
          } catch {
        detail = await res.text().catch(() => '')
      }
      console.error('Register error', res.status, detail, 'requested URL', url)
      throw new Error(`Registration failed (${res.status}) ${detail || '- configure NEXT_PUBLIC_API_URL to your backend base URL -'}`)
    }
    const data = unwrapResponse<{ access?: string; refresh?: string; user?: Partial<User> }>(await res.json())
    if (!data.access) throw new Error('Registration response did not include an access token')
    saveTokens(data.access, data.refresh)
    setUser(data.user ? normalizeUser(data.user) : null)
  }

  const registerAgent = async (payload: Record<string, unknown>) => {
    const apiBase = resolveApiBase()
    const url = `${apiBase}/auth/agent/register/`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      let detail = ''
      try {
        const json = await res.json() as AuthErrorBody | Record<string, unknown>
        detail = (json.detail as string) || JSON.stringify(json)
      } catch {
        detail = await res.text().catch(() => '')
      }
      console.error('Agent register error', res.status, detail, 'requested URL', url)
      throw new Error(`Agent registration failed (${res.status}) ${detail || '- configure NEXT_PUBLIC_API_URL to your backend base URL -'}`)
    }
    const data = unwrapResponse<{ access?: string; refresh?: string; user?: Partial<User> }>(await res.json())
    if (!data.access) throw new Error('Agent registration response did not include an access token')
    saveTokens(data.access, data.refresh)
    setUser(data.user ? normalizeUser(data.user) : null)
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  // Listen for global events so named exports can control the modal
  useEffect(() => {
    const onOpen = () => setIsAuthModalOpen(true)
    const onClose = () => setIsAuthModalOpen(false)
    if (typeof window !== 'undefined') {
      window.addEventListener('openAuthModal', onOpen)
      window.addEventListener('closeAuthModal', onClose)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openAuthModal', onOpen)
        window.removeEventListener('closeAuthModal', onClose)
      }
    }
  }, [])

  const refreshAccess = async (): Promise<boolean> => {
    const refresh = getStoredToken(REFRESH_KEY)
    if (!refresh) return false
    try {
      const res = await fetch(`${resolveApiBase()}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      })
      if (!res.ok) {
        clearTokens()
        return false
      }
      const data = unwrapResponse<{ access?: string }>(await res.json())
      if (data.access) {
        persistTokens(data.access, refresh)
        setAccess(data.access)
        return true
      }
      return false
    } catch {
      clearTokens()
      return false
    }
  }

  const loadProfile = async (tokenOverride?: string | null) => {
    const token = tokenOverride || access || getStoredToken(ACCESS_KEY)
    if (!token) return
    try {
      const res = await fetch(`${resolveApiBase()}/auth/profile/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const d = unwrapResponse<Partial<User>>(await res.json())
        setUser(normalizeUser(d))
      }
    } catch {
      // ignore
    }
  }

  const value: AuthContextValue = {
    user,
    access,
    isLoading,
    login,
    register,
    registerAgent,
    setSession,
    logout,
    refreshAccess,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider

// Named exports for global usage (dispatch events handled by AuthProvider)
export const openAuthModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('openAuthModal'))
  }
}

export const closeAuthModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('closeAuthModal'))
  }
}
