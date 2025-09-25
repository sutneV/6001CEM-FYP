import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters, applications } from '@/lib/db/schema'
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

    // Fetch all pets with their associated shelter info
    const petsWithShelters = await db
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
      .orderBy(pets.createdAt)

    // Get application counts for each pet
    const applicationCounts = await db
      .select({
        petId: applications.petId,
        applicationCount: count(applications.id),
      })
      .from(applications)
      .groupBy(applications.petId)

    // Transform the data
    const transformedPets = petsWithShelters.map(pet => {
      const appStats = applicationCounts.find(ac => ac.petId === pet.id)

      return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        size: pet.size,
        weight: pet.weight,
        color: pet.color,
        description: pet.description,
        story: pet.story,
        images: pet.images || [],
        status: pet.status,
        vaccinated: pet.vaccinated,
        neutered: pet.neutered,
        microchipped: pet.microchipped,
        houseTrained: pet.houseTrained,
        goodWithKids: pet.goodWithKids,
        goodWithDogs: pet.goodWithDogs,
        goodWithCats: pet.goodWithCats,
        specialNeeds: pet.specialNeeds,
        specialNeedsDescription: pet.specialNeedsDescription,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt,
        shelter: {
          id: pet.shelterId,
          name: pet.shelterName,
          userId: pet.shelterUserId,
        },
        stats: {
          views: 0, // Could be implemented with a views tracking system
          favorites: 0, // Could be implemented with a favorites system
          applications: appStats?.applicationCount || 0,
        }
      }
    })

    return NextResponse.json({ pets: transformedPets }, { status: 200 })
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    )
  }
}