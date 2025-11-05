import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, user.id)).limit(1)

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dbUser = userResult[0]

    if (!dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: dbUser.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    })

    if (!verified) {
      // Check backup codes
      if (dbUser.twoFactorBackupCodes) {
        const backupCodes = JSON.parse(dbUser.twoFactorBackupCodes)
        if (!backupCodes.includes(token.toUpperCase())) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        )
      }
    }

    // Disable 2FA
    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({
      message: '2FA disabled successfully',
      success: true,
    }, { status: 200 })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
