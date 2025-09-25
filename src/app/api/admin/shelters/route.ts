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

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Fetch all shelters with their associated user info and stats
    const sheltersWithDetails = await db
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
      .orderBy(shelters.createdAt)

    // Get pet counts for each shelter
    const petCounts = await db
      .select({
        shelterId: pets.shelterId,
        totalPets: count(pets.id),
        availablePets: sql<number>`COUNT(CASE WHEN ${pets.status} = 'available' THEN 1 END)`,
        adoptedPets: sql<number>`COUNT(CASE WHEN ${pets.status} = 'adopted' THEN 1 END)`,
      })
      .from(pets)
      .groupBy(pets.shelterId)

    // Transform the data
    const transformedShelters = sheltersWithDetails.map(shelter => {
      const petStats = petCounts.find(pc => pc.shelterId === shelter.id)

      // Parse address to extract city, state, zip
      const addressParts = shelter.address ? shelter.address.split(',') : ['', '', '']
      const city = shelter.userCity || (addressParts.length > 1 ? addressParts[1].trim() : '')
      const state = addressParts.length > 2 ? addressParts[2].trim().split(' ')[0] : ''
      const zipCode = addressParts.length > 2 ? addressParts[2].trim().split(' ').slice(-1)[0] : ''

      return {
        id: shelter.id,
        name: shelter.name,
        email: shelter.userEmail,
        phone: shelter.userPhone,
        address: shelter.address || '',
        city: city,
        state: state,
        zipCode: zipCode,
        status: shelter.userIsActive === 'true' ? 'active' : 'suspended',
        createdAt: shelter.createdAt,
        updatedAt: shelter.updatedAt,
        licenseNumber: shelter.registrationNumber,
        capacity: 50, // Default capacity - could be made configurable
        currentPets: petStats?.availablePets || 0,
        user: shelter.userId ? {
          id: shelter.userId,
          firstName: shelter.userFirstName,
          lastName: shelter.userLastName,
          email: shelter.userEmail,
        } : undefined,
        stats: {
          totalPets: petStats?.totalPets || 0,
          adoptedPets: petStats?.adoptedPets || 0,
          applications: 0 // Could be calculated if needed
        }
      }
    })

    return NextResponse.json({ shelters: transformedShelters }, { status: 200 })
  } catch (error) {
    console.error('Error fetching shelters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shelters' },
      { status: 500 }
    )
  }
}