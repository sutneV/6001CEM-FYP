import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters, applications, favorites } from '@/lib/db/schema'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'

// GET /api/pets/recommended - Get recommended pets for an adopter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by type if specified
    const limit = parseInt(searchParams.get('limit') || '8')

    // Get user data from header
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json(
        { error: 'User data not provided' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userDataHeader)

    // Get user's favorited pet IDs to exclude them (they're already saved)
    const userFavorites = await db
      .select({ petId: favorites.petId })
      .from(favorites)
      .where(eq(favorites.userId, user.id))

    const favoritedPetIds = userFavorites.map(f => f.petId)

    // Get user's application history to understand preferences
    const userApplications = await db
      .select({
        petId: applications.petId,
        petType: pets.type,
        petSize: pets.size,
        petAge: pets.age
      })
      .from(applications)
      .innerJoin(pets, eq(applications.petId, pets.id))
      .where(eq(applications.adopterId, user.id))
      .limit(10)

    // Extract preferred types, sizes, and ages
    const preferredTypes = [...new Set(userApplications.map(app => app.petType).filter(Boolean))]
    const preferredSizes = [...new Set(userApplications.map(app => app.petSize).filter(Boolean))]
    const preferredAges = [...new Set(userApplications.map(app => app.petAge).filter(Boolean))]

    // Build base conditions
    const conditions = [eq(pets.status, 'available')]

    // Apply type filter if specified
    if (type && type !== 'all') {
      conditions.push(eq(pets.type, type as any))
    }

    // Exclude favorited pets
    if (favoritedPetIds.length > 0) {
      conditions.push(sql`${pets.id} NOT IN ${favoritedPetIds}`)
    }

    // Fetch pets with shelter information
    let recommendedPets = await db
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
      .orderBy(desc(pets.createdAt))
      .limit(50) // Get more than needed for better sorting

    // Calculate compatibility score for each pet
    const petsWithScore = recommendedPets.map(pet => {
      let score = 0
      const maxScore = 100 // Maximum possible score

      // Prefer pets matching user's historical preferences (40% weight)
      if (preferredTypes.includes(pet.type)) score += 25
      if (preferredSizes.includes(pet.size)) score += 10
      if (preferredAges.includes(pet.age)) score += 10

      // Prefer vaccinated, neutered pets (20% weight)
      if (pet.vaccinated) score += 10
      if (pet.neutered) score += 10

      // Prefer pets good with kids, dogs, cats (15% weight)
      if (pet.goodWithKids) score += 5
      if (pet.goodWithDogs) score += 5
      if (pet.goodWithCats) score += 5

      // Base score for any available pet (15% weight)
      score += 15

      // Add some randomness to avoid always showing the same pets (10% weight)
      score += Math.random() * 10

      // Ensure score is capped at 100
      const finalScore = Math.min(Math.round(score), maxScore)

      return {
        ...pet,
        compatibilityScore: finalScore
      }
    })

    // Sort by compatibility score and limit
    const sortedPets = petsWithScore
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit)

    return NextResponse.json(sortedPets)
  } catch (error) {
    console.error('Error fetching recommended pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommended pets' },
      { status: 500 }
    )
  }
}
