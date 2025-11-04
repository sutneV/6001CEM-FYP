import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user with this email who is not verified and is an adopter
    const userResult = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.emailVerified, false),
          eq(users.role, 'adopter')
        )
      )
      .limit(1)

    if (userResult.length === 0) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { success: false, error: 'If an unverified account exists with this email, a verification link will be sent.' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await db
      .update(users)
      .set({
        verificationToken,
        verificationTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Penang Pet Pals <onboarding@resend.dev>',
        to: user.email,
        subject: 'Verify Your Email - Penang Pet Pals',
        html: `
          <h1>Email Verification</h1>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>You requested a new verification link for your Penang Pet Pals account. Please verify your email address by clicking the button below:</p>

          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationUrl}"
               style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #0d9488; word-break: break-all;">${verificationUrl}</p>

          <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>

          <p>If you didn't request this email, please ignore it.</p>

          <p>Best regards,<br>The Penang Pet Pals Team</p>
        `,
      })
      console.log(`Verification email resent to ${user.email}`)
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
