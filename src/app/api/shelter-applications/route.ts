import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shelterApplications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, city, shelterName, shelterDescription, registrationNumber, address, website } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !shelterName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already has a pending or approved application
    const existingApplications = await db
      .select()
      .from(shelterApplications)
      .where(eq(shelterApplications.email, email))
      .limit(1)

    if (existingApplications.length > 0) {
      const status = existingApplications[0].status
      if (status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending application. Please wait for admin review.' },
          { status: 400 }
        )
      }
      if (status === 'approved') {
        return NextResponse.json(
          { error: 'You already have an approved shelter account.' },
          { status: 400 }
        )
      }
    }

    // Create shelter application
    const newApplication = await db.insert(shelterApplications).values({
      email,
      firstName,
      lastName,
      phone,
      city,
      shelterName,
      shelterDescription,
      registrationNumber,
      address,
      website,
      status: 'pending',
    }).returning()

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. You will receive an email once it is reviewed.',
      application: newApplication[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Shelter application error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Get all shelter applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const applications = await db
      .select()
      .from(shelterApplications)
      .orderBy(shelterApplications.createdAt)

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
