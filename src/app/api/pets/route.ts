import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getServerSession } from 'next-auth/next'

// GET /api/pets - List all pets (for adopters) with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const age = searchParams.get('age')
    const size = searchParams.get('size')
    const status = searchParams.get('status') || 'available'

    // Build query conditions
    const conditions = []
    conditions.push(eq(pets.status, status as any))
    
    if (type) conditions.push(eq(pets.type, type as any))
    if (age) conditions.push(eq(pets.age, age as any))
    if (size) conditions.push(eq(pets.size, size as any))

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
        vaccinated: pets.vaccinated,
        neutered: pets.neutered,
        microchipped: pets.microchipped,
        houseTrained: pets.houseTrained,
        goodWithKids: pets.goodWithKids,
        goodWithDogs: pets.goodWithDogs,
        goodWithCats: pets.goodWithCats,
        specialNeeds: pets.specialNeeds,
        specialNeedsDescription: pets.specialNeedsDescription,
        status: pets.status,
        createdAt: pets.createdAt,
        updatedAt: pets.updatedAt,
        shelter: {
          id: shelters.id,
          name: shelters.name,
          address: shelters.address,
        },
      })
      .from(pets)
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(pets.createdAt))

    return NextResponse.json(petsWithShelters)
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    )
  }
}