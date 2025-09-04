import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireRole } from '@/lib/auth-middleware'

// GET /api/shelter/pets/[id] - Get specific pet
export const GET = requireRole(['shelter', 'admin'])(async (
  request: NextRequest,
  user,
  context
) => {
  const { params } = context as { params: { id: string } }
  try {
    // Build where condition - admins can see all pets, shelters only their own
    const whereCondition = user.role === 'admin'
      ? eq(pets.id, params.id)
      : and(eq(pets.id, params.id), eq(pets.shelterId, user.shelterId!))

    const [pet] = await db
      .select()
      .from(pets)
      .where(whereCondition)
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
})

// PUT /api/shelter/pets/[id] - Update pet
export const PUT = requireRole(['shelter'])(async (
  request: NextRequest,
  user,
  context
) => {
  const { params } = context as { params: { id: string } }
  try {
    if (!user.shelterId) {
      return NextResponse.json(
        { error: 'No shelter associated with this account' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updateData = {
      name: body.name,
      type: body.type,
      breed: body.breed,
      age: body.age,
      gender: body.gender,
      size: body.size,
      weight: body.weight,
      color: body.color,
      description: body.description,
      story: body.story,
      images: body.images,
      vaccinated: body.vaccinated,
      neutered: body.neutered,
      microchipped: body.microchipped,
      houseTrained: body.houseTrained,
      goodWithKids: body.goodWithKids,
      goodWithDogs: body.goodWithDogs,
      goodWithCats: body.goodWithCats,
      specialNeeds: body.specialNeeds,
      specialNeedsDescription: body.specialNeedsDescription,
      status: body.status,
      updatedAt: new Date(),
    }

    // Only allow shelter to update their own pets
    const [updatedPet] = await db
      .update(pets)
      .set(updateData)
      .where(and(eq(pets.id, params.id), eq(pets.shelterId, user.shelterId)))
      .returning()

    if (!updatedPet) {
      return NextResponse.json(
        { error: 'Pet not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedPet)
  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    )
  }
})

// DELETE /api/shelter/pets/[id] - Delete pet
export const DELETE = requireRole(['shelter'])(async (
  request: NextRequest,
  user,
  context
) => {
  const { params } = context as { params: { id: string } }
  try {
    if (!user.shelterId) {
      return NextResponse.json(
        { error: 'No shelter associated with this account' },
        { status: 403 }
      )
    }

    // Only allow shelter to delete their own pets
    const [deletedPet] = await db
      .delete(pets)
      .where(and(eq(pets.id, params.id), eq(pets.shelterId, user.shelterId)))
      .returning()

    if (!deletedPet) {
      return NextResponse.json(
        { error: 'Pet not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Pet deleted successfully' })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    )
  }
})