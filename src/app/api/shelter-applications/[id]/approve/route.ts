import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shelterApplications, users, shelters } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reviewedBy, password } = body

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'A valid password (min 8 characters) is required' },
        { status: 400 }
      )
    }

    // Get the application
    const applications = await db
      .select()
      .from(shelterApplications)
      .where(eq(shelterApplications.id, id))
      .limit(1)

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = applications[0]

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been reviewed' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, application.email))
      .limit(1)

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user account
    const newUser = await db.insert(users).values({
      email: application.email,
      password: hashedPassword,
      firstName: application.firstName,
      lastName: application.lastName,
      phone: application.phone,
      city: application.city,
      role: 'shelter',
    }).returning()

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create shelter record
    await db.insert(shelters).values({
      userId: newUser[0].id,
      name: application.shelterName,
      description: application.shelterDescription,
      address: application.address,
      registrationNumber: application.registrationNumber,
      website: application.website,
    })

    // Update application status
    await db
      .update(shelterApplications)
      .set({
        status: 'approved',
        reviewedBy: reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shelterApplications.id, id))

    // Send approval email
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Penang Pet Pals <onboarding@resend.dev>',
        to: application.email,
        subject: 'Shelter Application Approved - Welcome to Penang Pet Pals!',
        html: `
          <h1>Congratulations! Your Shelter Application Has Been Approved</h1>
          <p>Dear ${application.firstName} ${application.lastName},</p>
          <p>We're excited to inform you that your shelter application for <strong>${application.shelterName}</strong> has been approved!</p>

          <h2>Your Account Details:</h2>
          <ul>
            <li><strong>Email:</strong> ${application.email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>

          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>

          <p>You can now log in to your shelter dashboard and start managing pet adoptions.</p>

          <p>Best regards,<br>The Penang Pet Pals Team</p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application approved and account created successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error approving application:', error)
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    )
  }
}
