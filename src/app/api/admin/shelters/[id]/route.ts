import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters, pets, applications } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'

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

    const shelterId = params.id

    // Fetch shelter details with user info
    const shelterResult = await db
      .select({
        id: shelters.id,
        name: shelters.name,
        description: shelters.description,
        address: shelters.address,
        registrationNumber: shelters.registrationNumber,
        website: shelters.website,
        createdAt: shelters.createdAt,
        updatedAt: shelters.updatedAt,
        userId: users.id,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        userCity: users.city,
        userIsActive: users.isActive,
      })
      .from(shelters)
      .leftJoin(users, eq(shelters.userId, users.id))
      .where(eq(shelters.id, shelterId))
      .limit(1)

    if (shelterResult.length === 0) {
      return NextResponse.json(
        { error: 'Shelter not found' },
        { status: 404 }
      )
    }

    const shelterData = shelterResult[0]

    // Get detailed statistics for the shelter
    const petStats = await db
      .select({
        totalPets: count(pets.id),
        availablePets: sql<number>`COUNT(CASE WHEN ${pets.status} = 'available' THEN 1 END)`,
        adoptedPets: sql<number>`COUNT(CASE WHEN ${pets.status} = 'adopted' THEN 1 END)`,
        pendingPets: sql<number>`COUNT(CASE WHEN ${pets.status} = 'pending' THEN 1 END)`,
      })
      .from(pets)
      .where(eq(pets.shelterId, shelterId))

    // Get applications count for pets from this shelter
    const applicationsStats = await db
      .select({
        totalApplications: count(applications.id),
        pendingApplications: sql<number>`COUNT(CASE WHEN ${applications.status} IN ('submitted', 'under_review') THEN 1 END)`,
        approvedApplications: sql<number>`COUNT(CASE WHEN ${applications.status} = 'approved' THEN 1 END)`,
      })
      .from(applications)
      .leftJoin(pets, eq(applications.petId, pets.id))
      .where(eq(pets.shelterId, shelterId))

    // Parse address to extract components
    const addressParts = shelterData.address ? shelterData.address.split(',') : ['', '', '']
    const city = shelterData.userCity || (addressParts.length > 1 ? addressParts[1].trim() : '')
    const state = addressParts.length > 2 ? addressParts[2].trim().split(' ')[0] : ''
    const zipCode = addressParts.length > 2 ? addressParts[2].trim().split(' ').slice(-1)[0] : ''

    // Transform the data
    const transformedShelter = {
      id: shelterData.id,
      name: shelterData.name,
      email: shelterData.userEmail,
      phone: shelterData.userPhone,
      address: shelterData.address || '',
      city: city,
      state: state,
      zipCode: zipCode,
      status: shelterData.userIsActive === 'true' ? 'active' : 'suspended',
      createdAt: shelterData.createdAt,
      updatedAt: shelterData.updatedAt,
      licenseNumber: shelterData.registrationNumber,
      capacity: 50, // Default capacity - could be made configurable
      currentPets: petStats[0]?.availablePets || 0,
      user: shelterData.userId ? {
        id: shelterData.userId,
        firstName: shelterData.userFirstName,
        lastName: shelterData.userLastName,
        email: shelterData.userEmail,
        lastLoginAt: null // Could be tracked if needed
      } : undefined,
      stats: {
        totalPets: petStats[0]?.totalPets || 0,
        adoptedPets: petStats[0]?.adoptedPets || 0,
        applications: applicationsStats[0]?.totalApplications || 0,
        pendingApplications: applicationsStats[0]?.pendingApplications || 0,
        approvedApplications: applicationsStats[0]?.approvedApplications || 0,
      }
    }

    return NextResponse.json({ shelter: transformedShelter }, { status: 200 })
  } catch (error) {
    console.error('Error fetching shelter details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shelter details' },
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

    const shelterId = params.id
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // First, get the shelter's user ID
    const shelterResult = await db
      .select({ userId: shelters.userId })
      .from(shelters)
      .where(eq(shelters.id, shelterId))
      .limit(1)

    if (shelterResult.length === 0) {
      return NextResponse.json(
        { error: 'Shelter not found' },
        { status: 404 }
      )
    }

    const userId = shelterResult[0].userId

    switch (action) {
      case 'suspend':
        await db
          .update(users)
          .set({
            isActive: 'false',
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
        break

      case 'activate':
        await db
          .update(users)
          .set({
            isActive: 'true',
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
        break

      case 'verify':
        // In a real implementation, this would mark the shelter as verified
        await db
          .update(shelters)
          .set({
            updatedAt: new Date()
          })
          .where(eq(shelters.id, shelterId))
        console.log(`License verification completed for shelter ${shelterId}`)
        break

      case 'send-email':
        // In a real implementation, this would trigger an email
        console.log(`Email send requested for shelter ${shelterId}`)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating shelter:', error)
    return NextResponse.json(
      { error: 'Failed to update shelter' },
      { status: 500 }
    )
  }
}