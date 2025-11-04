import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with matching token that hasn't expired
    const userResult = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationTokenExpiry, new Date())
        )
      )
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    const user = userResult[0]

    // Update user to mark email as verified
    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
