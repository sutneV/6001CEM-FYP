import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { favorites, pets, shelters } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/favorites - Fetch user's favorites
export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)

    const userFavorites = await db
      .select({
        id: favorites.id,
        petId: favorites.petId,
        userId: favorites.userId,
        createdAt: favorites.createdAt,
        pet: {
          id: pets.id,
          name: pets.name,
          species: pets.type,
          breed: pets.breed,
          age: pets.age,
          gender: pets.gender,
          size: pets.size,
          description: pets.description,
          medicalHistory: pets.specialNeedsDescription,
          behavior: pets.story,
          images: pets.images,
          status: pets.status,
          shelterId: pets.shelterId,
          shelter: {
            id: shelters.id,
            name: shelters.name,
            address: shelters.address,
          },
        },
      })
      .from(favorites)
      .innerJoin(pets, eq(favorites.petId, pets.id))
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(favorites.createdAt)

    // Transform the data to match the expected format
    const formattedFavorites = userFavorites.map((fav) => ({
      id: fav.id,
      petId: fav.petId,
      userId: fav.userId,
      createdAt: fav.createdAt,
      pet: {
        ...fav.pet,
        shelter: fav.pet.shelter,
      },
    }))

    return NextResponse.json({ favorites: formattedFavorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST /api/favorites - Add a pet to favorites
export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const { petId } = await request.json()

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.petId, petId)))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Pet already in favorites' }, { status: 400 })
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        userId: user.id,
        petId,
      })
      .returning()

    return NextResponse.json({ favorite: newFavorite }, { status: 201 })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}
