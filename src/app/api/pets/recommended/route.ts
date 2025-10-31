import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// GET /api/pets/recommended - Get random available pets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by type if specified
    const limit = parseInt(searchParams.get('limit') || '4')

    // Get user data from header
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json(
        { error: 'User data not provided' },
        { status: 401 }
      )
    }

    // Build base conditions
    const conditions = [eq(pets.status, 'available')]

    // Apply type filter if specified
    if (type && type !== 'all') {
      conditions.push(eq(pets.type, type as any))
    }

    // Fetch available pets with shelter information (consistent ordering)
    const availablePets = await db
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
        images: pets.images,
        vaccinated: pets.vaccinated,
        neutered: pets.neutered,
        microchipped: pets.microchipped,
        houseTrained: pets.houseTrained,
        goodWithKids: pets.goodWithKids,
        goodWithDogs: pets.goodWithDogs,
        goodWithCats: pets.goodWithCats,
        specialNeeds: pets.specialNeeds,
        status: pets.status,
        createdAt: pets.createdAt,
        shelter: {
          id: shelters.id,
          name: shelters.name,
          address: shelters.address,
        },
      })
      .from(pets)
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(and(...conditions))
      .orderBy(pets.createdAt)
      .limit(limit)

    return NextResponse.json(availablePets)
  } catch (error) {
    console.error('Error fetching recommended pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommended pets' },
      { status: 500 }
    )
  }
}
