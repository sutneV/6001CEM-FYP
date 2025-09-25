import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters, applications, messages } from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

async function verifyAdmin(request: NextRequest) {
  const userDataHeader = request.headers.get('x-user-data')
  if (!userDataHeader) {
    return null
  }

  try {
    const userData = JSON.parse(userDataHeader)
    if (userData.role !== 'admin') {
      return null
    }
    return userData
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const userId = params.id

    // Fetch user details with shelter info (only adopters)
    const userResult = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        phone: users.phone,
        city: users.city,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        shelterId: shelters.id,
        shelterName: shelters.name,
      })
      .from(users)
      .leftJoin(shelters, eq(users.id, shelters.userId))
      .where(and(eq(users.id, userId), eq(users.role, 'adopter')))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userResult[0]

    // Get additional stats for the user
    let stats = {}

    if (userData.role === 'adopter') {
      // Get applications count
      const applicationsCount = await db
        .select({ count: count() })
        .from(applications)
        .where(eq(applications.adopterId, userId))

      stats = {
        totalApplications: applicationsCount[0]?.count || 0
      }
    }

    // Transform the data
    const transformedUser = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      city: userData.city,
      status: userData.isActive === 'true' ? 'active' : 'suspended',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      profile: {
        phone: userData.phone,
        address: userData.city
      },
      shelter: userData.shelterId ? {
        id: userData.shelterId,
        name: userData.shelterName
      } : undefined,
      stats
    }

    return NextResponse.json({ user: transformedUser }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const userId = params.id
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Verify the user is an adopter (not shelter or admin)
    const userCheck = await db
      .select({ role: users.role })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.role, 'adopter')))
      .limit(1)

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: 'User not found or not authorized to modify' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'suspend':
        await db
          .update(users)
          .set({
            isActive: 'false',
            updatedAt: new Date()
          })
          .where(and(eq(users.id, userId), eq(users.role, 'adopter')))
        break

      case 'activate':
        await db
          .update(users)
          .set({
            isActive: 'true',
            updatedAt: new Date()
          })
          .where(and(eq(users.id, userId), eq(users.role, 'adopter')))
        break

      case 'reset-password':
        // In a real implementation, this would generate a password reset token
        // and send an email to the user
        console.log(`Password reset requested for user ${userId}`)
        break

      case 'send-email':
        // In a real implementation, this would trigger an email
        console.log(`Email send requested for user ${userId}`)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}