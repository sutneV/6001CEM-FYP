"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserWithRole } from '@/lib/auth-client'
import { getSession, saveSession, clearSession } from '@/lib/session'

interface AuthContextType {
  user: UserWithRole | null
  isLoading: boolean
  login: (user: UserWithRole) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session?.isAuthenticated && session.user) {
      setUser(session.user)
    }
    setIsLoading(false)
  }, [])

  const login = (userData: UserWithRole) => {
    setUser(userData)
    saveSession(userData)
  }

  const logout = () => {
    setUser(null)
    clearSession()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext