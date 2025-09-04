"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

function getRedirectPath(role: string): string {
  switch (role) {
    case 'adopter':
      return '/dashboard'
    case 'shelter':
      return '/dashboard/shelter'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/dashboard'
  }
}

interface GuestGuardProps {
  children: ReactNode
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      const redirectPath = getRedirectPath(user.role)
      router.push(redirectPath)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return null
  }

  if (user) {
    return null
  }

  return <>{children}</>
}