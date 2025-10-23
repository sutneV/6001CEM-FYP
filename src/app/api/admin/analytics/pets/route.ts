import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, shelters } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'

// GET /api/admin/analytics/pets - Get pet analytics
export async function GET(request: NextRequest) {
  try {
    // Pet distribution by type
    const petsByType = await db
      .select({
        type: pets.type,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .groupBy(pets.type)

    // Pet distribution by size
    const petsBySize = await db
      .select({
        size: pets.size,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .where(sql`${pets.size} IS NOT NULL`)
      .groupBy(pets.size)

    // Pet distribution by age
    const petsByAge = await db
      .select({
        age: pets.age,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .groupBy(pets.age)

    // Pet distribution by gender
    const petsByGender = await db
      .select({
        gender: pets.gender,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .groupBy(pets.gender)

    // Pet distribution by status
    const petsByStatus = await db
      .select({
        status: pets.status,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .groupBy(pets.status)

    // Health statistics
    const healthStats = await db
      .select({
        vaccinated: sql<number>`cast(count(CASE WHEN vaccinated = true THEN 1 END) as int)`.as('vaccinated'),
        neutered: sql<number>`cast(count(CASE WHEN neutered = true THEN 1 END) as int)`.as('neutered'),
        microchipped: sql<number>`cast(count(CASE WHEN microchipped = true THEN 1 END) as int)`.as('microchipped'),
        houseTrained: sql<number>`cast(count(CASE WHEN house_trained = true THEN 1 END) as int)`.as('house_trained'),
        specialNeeds: sql<number>`cast(count(CASE WHEN special_needs = true THEN 1 END) as int)`.as('special_needs'),
        total: sql<number>`cast(count(*) as int)`.as('total'),
      })
      .from(pets)

    // Behavioral statistics
    const behavioralStats = await db
      .select({
        goodWithKids: sql<number>`cast(count(CASE WHEN good_with_kids = true THEN 1 END) as int)`.as('good_with_kids'),
        goodWithDogs: sql<number>`cast(count(CASE WHEN good_with_dogs = true THEN 1 END) as int)`.as('good_with_dogs'),
        goodWithCats: sql<number>`cast(count(CASE WHEN good_with_cats = true THEN 1 END) as int)`.as('good_with_cats'),
        total: sql<number>`cast(count(*) as int)`.as('total'),
      })
      .from(pets)

    // Top shelters by pet count
    const topShelters = await db
      .select({
        shelterName: shelters.name,
        shelterId: shelters.id,
        petCount: sql<number>`cast(count(*) as int)`.as('pet_count'),
      })
      .from(pets)
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .groupBy(shelters.id, shelters.name)
      .orderBy(sql`count(*) DESC`)
      .limit(10)

    // Most popular breeds (top 10)
    const topBreeds = await db
      .select({
        breed: pets.breed,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(pets)
      .where(sql`${pets.breed} IS NOT NULL AND ${pets.breed} != ''`)
      .groupBy(pets.breed)
      .orderBy(sql`count(*) DESC`)
      .limit(10)

    // Calculate percentages for health stats
    const total = healthStats[0]?.total || 1 // Avoid division by zero
    const healthPercentages = {
      vaccinated: ((healthStats[0]?.vaccinated || 0) / total * 100).toFixed(1),
      neutered: ((healthStats[0]?.neutered || 0) / total * 100).toFixed(1),
      microchipped: ((healthStats[0]?.microchipped || 0) / total * 100).toFixed(1),
      houseTrained: ((healthStats[0]?.houseTrained || 0) / total * 100).toFixed(1),
      specialNeeds: ((healthStats[0]?.specialNeeds || 0) / total * 100).toFixed(1),
    }

    // Calculate percentages for behavioral stats
    const behavioralPercentages = {
      goodWithKids: ((behavioralStats[0]?.goodWithKids || 0) / total * 100).toFixed(1),
      goodWithDogs: ((behavioralStats[0]?.goodWithDogs || 0) / total * 100).toFixed(1),
      goodWithCats: ((behavioralStats[0]?.goodWithCats || 0) / total * 100).toFixed(1),
    }

    return NextResponse.json({
      distribution: {
        byType: petsByType,
        bySize: petsBySize,
        byAge: petsByAge,
        byGender: petsByGender,
        byStatus: petsByStatus,
      },
      health: {
        stats: healthStats[0],
        percentages: healthPercentages,
      },
      behavioral: {
        stats: behavioralStats[0],
        percentages: behavioralPercentages,
      },
      topShelters,
      topBreeds,
    })
  } catch (error) {
    console.error('Error fetching pet analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet analytics' },
      { status: 500 }
    )
  }
}
