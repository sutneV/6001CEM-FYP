import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

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

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}