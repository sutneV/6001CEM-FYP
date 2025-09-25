import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters, applications } from '@/lib/db/schema'
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

    const petId = params.id

    // Fetch pet details with shelter info
    const petResult = await db
      .select({
        id: pets.id,
        name: pets.name,
        type: pets.type,
        breed: pets.breed,
        age: pets.age,
        gender: pets.gender,
        size: pets.size,
        weight: pets.weight,
        color: pets.color,
        description: pets.description,
        story: pets.story,
        images: pets.images,
        status: pets.status,
        vaccinated: pets.vaccinated,
        neutered: pets.neutered,
        microchipped: pets.microchipped,
        houseTrained: pets.houseTrained,
        goodWithKids: pets.goodWithKids,
        goodWithDogs: pets.goodWithDogs,
        goodWithCats: pets.goodWithCats,
        specialNeeds: pets.specialNeeds,
        specialNeedsDescription: pets.specialNeedsDescription,
        createdAt: pets.createdAt,
        updatedAt: pets.updatedAt,
        shelterId: shelters.id,
        shelterName: shelters.name,
        shelterUserId: shelters.userId,
      })
      .from(pets)
      .leftJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(eq(pets.id, petId))
      .limit(1)

    if (petResult.length === 0) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      )
    }

    const petData = petResult[0]

    // Get detailed statistics for the pet
    const applicationStats = await db
      .select({
        totalApplications: count(applications.id),
        pendingApplications: sql<number>`COUNT(CASE WHEN ${applications.status} IN ('submitted', 'under_review') THEN 1 END)`,
        approvedApplications: sql<number>`COUNT(CASE WHEN ${applications.status} = 'approved' THEN 1 END)`,
        rejectedApplications: sql<number>`COUNT(CASE WHEN ${applications.status} = 'rejected' THEN 1 END)`,
      })
      .from(applications)
      .where(eq(applications.petId, petId))

    // Transform the data
    const transformedPet = {
      id: petData.id,
      name: petData.name,
      type: petData.type,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      size: petData.size,
      weight: petData.weight,
      color: petData.color,
      description: petData.description,
      story: petData.story,
      images: petData.images || [],
      status: petData.status,
      vaccinated: petData.vaccinated,
      neutered: petData.neutered,
      microchipped: petData.microchipped,
      houseTrained: petData.houseTrained,
      goodWithKids: petData.goodWithKids,
      goodWithDogs: petData.goodWithDogs,
      goodWithCats: petData.goodWithCats,
      specialNeeds: petData.specialNeeds,
      specialNeedsDescription: petData.specialNeedsDescription,
      createdAt: petData.createdAt,
      updatedAt: petData.updatedAt,
      shelter: {
        id: petData.shelterId,
        name: petData.shelterName,
        userId: petData.shelterUserId,
      },
      stats: {
        views: 0, // Could be implemented with a views tracking system
        favorites: 0, // Could be implemented with a favorites system
        applications: applicationStats[0]?.totalApplications || 0,
        pendingApplications: applicationStats[0]?.pendingApplications || 0,
        approvedApplications: applicationStats[0]?.approvedApplications || 0,
        rejectedApplications: applicationStats[0]?.rejectedApplications || 0,
      }
    }

    return NextResponse.json({ pet: transformedPet }, { status: 200 })
  } catch (error) {
    console.error('Error fetching pet details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet details' },
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

    const petId = params.id
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Verify the pet exists
    const petCheck = await db
      .select({ id: pets.id, status: pets.status })
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1)

    if (petCheck.length === 0) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'remove':
        // Remove from listing (could set status to inactive or actually delete)
        await db
          .update(pets)
          .set({
            status: 'adopted', // Or we could add an 'inactive' status
            updatedAt: new Date()
          })
          .where(eq(pets.id, petId))
        break

      case 'make-available':
        await db
          .update(pets)
          .set({
            status: 'available',
            updatedAt: new Date()
          })
          .where(eq(pets.id, petId))
        break

      case 'approve-adoption':
        await db
          .update(pets)
          .set({
            status: 'adopted',
            updatedAt: new Date()
          })
          .where(eq(pets.id, petId))
        break

      case 'feature':
        // In a real implementation, this could add the pet to a featured list
        // For now, just update the timestamp
        await db
          .update(pets)
          .set({
            updatedAt: new Date()
          })
          .where(eq(pets.id, petId))
        console.log(`Pet ${petId} featured successfully`)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    )
  }
}