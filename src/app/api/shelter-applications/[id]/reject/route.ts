import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shelterApplications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reviewedBy, rejectionReason } = body

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
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

    // Update application status
    await db
      .update(shelterApplications)
      .set({
        status: 'rejected',
        rejectionReason,
        reviewedBy: reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shelterApplications.id, id))

    // Send rejection email
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Penang Pet Pals <onboarding@resend.dev>',
        to: application.email,
        subject: 'Shelter Application Update - Penang Pet Pals',
        html: `
          <h1>Shelter Application Status Update</h1>
          <p>Dear ${application.firstName} ${application.lastName},</p>
          <p>Thank you for your interest in joining Penang Pet Pals as a shelter partner.</p>

          <p>After careful review, we regret to inform you that we are unable to approve your application for <strong>${application.shelterName}</strong> at this time.</p>

          <h2>Reason:</h2>
          <p>${rejectionReason}</p>

          <p>If you have any questions or would like to discuss this decision, please don't hesitate to contact us.</p>

          <p>You are welcome to submit a new application in the future if circumstances change.</p>

          <p>Best regards,<br>The Penang Pet Pals Team</p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Error rejecting application:', error)
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    )
  }
}
