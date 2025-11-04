import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/pets/[id] - Get specific pet with shelter information (public endpoint)
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context
  try {
    const [pet] = await db
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
        shelterId: pets.shelterId,
        shelter: {
          id: shelters.id,
          name: shelters.name,
          address: shelters.address,
          userId: shelters.userId,
        },
        shelterUser: {
          avatar: users.avatar,
        }
      })
      .from(pets)
      .leftJoin(shelters, eq(pets.shelterId, shelters.id))
      .leftJoin(users, eq(shelters.userId, users.id))
      .where(eq(pets.id, params.id))
      .limit(1)

    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error('Error fetching pet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet' },
      { status: 500 }
    )
  }
}