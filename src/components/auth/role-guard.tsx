"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRole, hasPermission, type UserRole } from "@/lib/auth"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  fallbackPath?: string
}

export function RoleGuard({ children, requiredRole, fallbackPath = "/dashboard" }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkPermission = () => {
      const hasAccess = hasPermission(requiredRole)
      setIsAuthorized(hasAccess)

      if (!hasAccess) {
        const userRole = getUserRole()
        // Redirect to appropriate dashboard based on user role
        switch (userRole) {
          case "admin":
            router.push("/dashboard/admin")
            break
          case "shelter":
            router.push("/dashboard/shelter")
            break
          case "adopter":
          default:
            router.push("/dashboard")
            break
        }
      }
    }

    checkPermission()
  }, [requiredRole, router, fallbackPath])

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Authorized
  return <>{children}</>
}
