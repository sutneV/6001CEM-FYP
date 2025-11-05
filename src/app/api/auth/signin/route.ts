import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, authenticateUserWith2FA } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let email = ''
  let password = ''

  try {
    const body = await request.json()
    email = body.email
    password = body.password
    const { twoFactorToken, userId } = body

    // If 2FA token is provided, verify it
    if (twoFactorToken && userId) {
      // Verify the 2FA token
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, token: twoFactorToken }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyResult.success) {
        return NextResponse.json(
          { error: verifyResult.error || 'Invalid 2FA code' },
          { status: 401 }
        )
      }

      // Get user after successful 2FA verification
      const user = await authenticateUserWith2FA(userId)

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }

      return NextResponse.json({ user }, { status: 200 })
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user (including admin stored in database)
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)

    // Check if the error is due to unverified email
    if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
      return NextResponse.json(
        { error: 'Please verify your email before signing in. Check your email for the verification link.' },
        { status: 403 }
      )
    }

    // Check if 2FA is required
    if (error instanceof Error && error.message === '2FA_REQUIRED') {
      // Get user ID to send back to client
      if (email) {
        try {
          const userResult = await db.select().from(users).where(
            and(
              eq(users.email, email),
              eq(users.isActive, 'true')
            )
          ).limit(1)

          if (userResult.length > 0) {
            return NextResponse.json(
              {
                error: '2FA verification required',
                requires2FA: true,
                userId: userResult[0].id
              },
              { status: 403 }
            )
          }
        } catch (dbError) {
          console.error('Database error when fetching user for 2FA:', dbError)
        }
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}