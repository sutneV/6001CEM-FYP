"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function AuthGuard({ children, allowedRoles = [], redirectTo = '/auth/signin' }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'adopter':
            router.push('/dashboard')
            break
          case 'shelter':
            router.push('/dashboard/shelter')
            break
          case 'admin':
            router.push('/dashboard/admin')
            break
          default:
            router.push('/auth/signin')
        }
        return
      }
    }
  }, [user, isLoading, router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}