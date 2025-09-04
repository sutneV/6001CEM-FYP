import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-middleware'

// GET /api/shelter/pets - List shelter's pets
export const GET = requireRole(['shelter', 'admin'])(async (request: NextRequest, user) => {
  try {
    if (!user.shelterId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No shelter associated with this account' },
        { status: 403 }
      )
    }

    // For admin, show all pets; for shelter, show only their pets
    const whereCondition = user.role === 'admin' 
      ? undefined 
      : eq(pets.shelterId, user.shelterId!)

    const shelterPets = await db
      .select()
      .from(pets)
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(whereCondition)
      .orderBy(desc(pets.createdAt))

    return NextResponse.json(shelterPets.map(row => ({
      ...row.pets,
      shelter: row.shelters
    })))
  } catch (error) {
    console.error('Error fetching shelter pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    )
  }
})

// POST /api/shelter/pets - Create new pet
export const POST = requireRole(['shelter'])(async (request: NextRequest, user) => {
  try {
    if (!user.shelterId) {
      return NextResponse.json(
        { error: 'No shelter associated with this account' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const petData = {
      shelterId: user.shelterId, // Use the authenticated user's shelter
      name: body.name,
      type: body.type,
      breed: body.breed || null,
      age: body.age,
      gender: body.gender,
      size: body.size || null,
      weight: body.weight || null,
      color: body.color || null,
      description: body.description,
      story: body.story || null,
      images: body.images || [],
      vaccinated: body.vaccinated || false,
      neutered: body.neutered || false,
      microchipped: body.microchipped || false,
      houseTrained: body.houseTrained || false,
      goodWithKids: body.goodWithKids || false,
      goodWithDogs: body.goodWithDogs || false,
      goodWithCats: body.goodWithCats || false,
      specialNeeds: body.specialNeeds || false,
      specialNeedsDescription: body.specialNeedsDescription || null,
      status: 'available' as const,
    }

    const [newPet] = await db.insert(pets).values(petData).returning()

    return NextResponse.json(newPet, { status: 201 })
  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    )
  }
})