import type { UserWithRole } from './auth-client'

export interface SessionData {
  user: UserWithRole
  isAuthenticated: boolean
}

export function saveSession(user: UserWithRole): void {
  const sessionData: SessionData = {
    user,
    isAuthenticated: true,
  }
  
  if (typeof window !== 'undefined') {
    const port = window.location.port || '80'
    localStorage.setItem(`userSession_${port}`, JSON.stringify(sessionData))
  }
}

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const port = window.location.port || '80'
    const sessionData = localStorage.getItem(`userSession_${port}`)
    if (!sessionData) {
      return null
    }
    
    return JSON.parse(sessionData) as SessionData
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    const port = window.location.port || '80'
    localStorage.removeItem(`userSession_${port}`)
  }
}

export function isAuthenticated(): boolean {
  const session = getSession()
  return session?.isAuthenticated === true
}

export function getCurrentUser(): UserWithRole | null {
  const session = getSession()
  return session?.user || null
}

export function hasRole(requiredRole: string): boolean {
  const user = getCurrentUser()
  return user?.role === requiredRole
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUser()
  return user ? roles.includes(user.role) : false
}