"use client"

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent duplicate verification attempts
      if (hasVerified.current) {
        return
      }
      hasVerified.current = true

      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to verify email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-teal-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link href="/auth/signin" className="block">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                The verification link may be invalid or expired. Please contact support if you continue to experience issues.
              </p>
              <Link href="/auth/signin" className="block">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
          {status === 'loading' && (
            <p className="text-sm text-gray-600 text-center">
              Please wait while we verify your email address...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
