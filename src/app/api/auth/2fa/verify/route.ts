import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, token } = body

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this user' },
        { status: 400 }
      )
    }

    // Try verifying with TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    })

    if (verified) {
      return NextResponse.json({
        success: true,
        message: '2FA verification successful',
      }, { status: 200 })
    }

    // If TOTP fails, try backup codes
    if (user.twoFactorBackupCodes) {
      const backupCodes = JSON.parse(user.twoFactorBackupCodes)
      const codeIndex = backupCodes.indexOf(token.toUpperCase())

      if (codeIndex !== -1) {
        // Remove the used backup code
        backupCodes.splice(codeIndex, 1)
        await db.update(users)
          .set({
            twoFactorBackupCodes: JSON.stringify(backupCodes),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))

        return NextResponse.json({
          success: true,
          message: '2FA verification successful (backup code used)',
          backupCodeUsed: true,
          remainingBackupCodes: backupCodes.length,
        }, { status: 200 })
      }
    }

    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    )
  }
}
