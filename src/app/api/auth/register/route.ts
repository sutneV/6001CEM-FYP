import { NextRequest, NextResponse } from 'next/server'
import { createUser, createShelter } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, city, role, shelterName, shelterDescription } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (role === 'shelter' && !shelterName) {
      return NextResponse.json(
        { error: 'Shelter name is required for shelter accounts' },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      city,
      role: role as 'adopter' | 'shelter',
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create account. Email may already exist.' },
        { status: 400 }
      )
    }

    // If shelter, create shelter record
    if (role === 'shelter') {
      const shelterCreated = await createShelter(newUser.id, {
        name: shelterName,
        description: shelterDescription,
      })

      if (!shelterCreated) {
        return NextResponse.json(
          { error: 'Account created but failed to set up shelter profile.' },
          { status: 500 }
        )
      }

      // Add shelter info to user object
      newUser.shelter = {
        id: '', // This would be set by the createShelter function in a real implementation
        name: shelterName,
      }
    }

    // If adopter, send verification email
    if (role === 'adopter' && (newUser as any).verificationToken) {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${(newUser as any).verificationToken}`

      // Send verification email using Resend
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Penang Pet Pals <onboarding@resend.dev>',
          to: newUser.email,
          subject: 'Verify Your Email - Penang Pet Pals',
          html: `
            <h1>Welcome to Penang Pet Pals!</h1>
            <p>Dear ${newUser.firstName} ${newUser.lastName},</p>
            <p>Thank you for registering with Penang Pet Pals! To complete your registration, please verify your email address by clicking the button below:</p>

            <div style="margin: 30px 0; text-align: center;">
              <a href="${verificationUrl}"
                 style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #0d9488; word-break: break-all;">${verificationUrl}</p>

            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>

            <p>If you didn't create an account with Penang Pet Pals, please ignore this email.</p>

            <p>Best regards,<br>The Penang Pet Pals Team</p>
          `,
        })
        console.log(`Verification email sent to ${newUser.email}`)
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Log the URL as fallback
        console.log('='.repeat(80))
        console.log('EMAIL SENDING FAILED - VERIFICATION URL:')
        console.log(`User: ${newUser.email}`)
        console.log(`Verification URL: ${verificationUrl}`)
        console.log('='.repeat(80))
      }

      return NextResponse.json({
        user: newUser,
        message: 'Account created successfully! Please check your email to verify your account.',
        requiresVerification: true
      }, { status: 201 })
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}