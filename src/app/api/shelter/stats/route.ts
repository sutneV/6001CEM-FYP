import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pets, applications, users, shelters } from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Get user data from headers
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = JSON.parse(userDataHeader)
    const shelterId = userData?.shelter?.id

    if (!shelterId) {
      return NextResponse.json({ error: 'Shelter ID not found' }, { status: 400 })
    }

    // Fetch statistics in parallel
    const [
      availablePetsResult,
      pendingApplicationsResult,
      successfulAdoptionsResult,
      activeAdoptersResult,
      lastMonthAvailablePetsResult,
      lastMonthPendingApplicationsResult,
      lastMonthSuccessfulAdoptionsResult,
      lastMonthActiveAdoptersResult,
    ] = await Promise.all([
      // Current stats
      db.select({ count: count() })
        .from(pets)
        .where(and(
          eq(pets.shelterId, shelterId),
          eq(pets.status, 'available')
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          sql`${applications.status} IN ('submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval')`
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          eq(applications.status, 'approved')
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          sql`${applications.status} != 'draft'`
        ))
        .groupBy(applications.adopterId),

      // Last month stats (for comparison)
      db.select({ count: count() })
        .from(pets)
        .where(and(
          eq(pets.shelterId, shelterId),
          eq(pets.status, 'available'),
          sql`${pets.createdAt} < NOW() - INTERVAL '1 month'`
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          sql`${applications.status} IN ('submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval')`,
          sql`${applications.createdAt} < NOW() - INTERVAL '1 month'`
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          eq(applications.status, 'approved'),
          sql`${applications.updatedAt} < NOW() - INTERVAL '1 month'`
        )),

      db.select({ count: count() })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .where(and(
          eq(pets.shelterId, shelterId),
          sql`${applications.status} != 'draft'`,
          sql`${applications.createdAt} < NOW() - INTERVAL '1 month'`
        ))
        .groupBy(applications.adopterId),
    ])

    const availablePets = availablePetsResult[0]?.count || 0
    const pendingApplications = pendingApplicationsResult[0]?.count || 0
    const successfulAdoptions = successfulAdoptionsResult[0]?.count || 0
    const activeAdopters = activeAdoptersResult.length || 0

    const lastMonthAvailablePets = lastMonthAvailablePetsResult[0]?.count || 0
    const lastMonthPendingApplications = lastMonthPendingApplicationsResult[0]?.count || 0
    const lastMonthSuccessfulAdoptions = lastMonthSuccessfulAdoptionsResult[0]?.count || 0
    const lastMonthActiveAdopters = lastMonthActiveAdoptersResult.length || 0

    // Calculate changes
    const availablePetsChange = Number(availablePets) - Number(lastMonthAvailablePets)
    const pendingApplicationsChange = Number(pendingApplications) - Number(lastMonthPendingApplications)
    const successfulAdoptionsChange = Number(successfulAdoptions) - Number(lastMonthSuccessfulAdoptions)
    const activeAdoptersChange = Number(activeAdopters) - Number(lastMonthActiveAdopters)

    return NextResponse.json({
      availablePets: Number(availablePets),
      availablePetsChange,
      pendingApplications: Number(pendingApplications),
      pendingApplicationsChange,
      successfulAdoptions: Number(successfulAdoptions),
      successfulAdoptionsChange,
      activeAdopters: Number(activeAdopters),
      activeAdoptersChange,
    })
  } catch (error) {
    console.error('Error fetching shelter stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
