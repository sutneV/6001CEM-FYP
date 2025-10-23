import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications, pets, users, shelters } from '@/lib/db/schema'
import { eq, count, sql, and } from 'drizzle-orm'

// GET /api/admin/analytics/applications - Get application analytics
export async function GET(request: NextRequest) {
  try {
    // Application distribution by status - using raw SQL count
    const applicationsByStatus = await db
      .select({
        status: applications.status,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(applications)
      .groupBy(applications.status)

    // Calculate status percentages
    const totalApps = applicationsByStatus.reduce((sum, item) => sum + item.count, 0)
    const statusWithPercentages = totalApps > 0
      ? applicationsByStatus.map(item => ({
          ...item,
          percentage: ((item.count / totalApps) * 100).toFixed(1),
        }))
      : []

    // Application funnel (conversion rates)
    const submitted = applicationsByStatus.filter(a =>
      !['draft', 'withdrawn'].includes(a.status)
    ).reduce((sum, item) => sum + item.count, 0)

    const underReview = applicationsByStatus.find(a => a.status === 'under_review')?.count || 0
    const interviewStage = applicationsByStatus.filter(a =>
      ['interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled'].includes(a.status)
    ).reduce((sum, item) => sum + item.count, 0)
    const pendingApproval = applicationsByStatus.find(a => a.status === 'pending_approval')?.count || 0
    const approved = applicationsByStatus.find(a => a.status === 'approved')?.count || 0
    const rejected = applicationsByStatus.find(a => a.status === 'rejected')?.count || 0

    const funnel = {
      submitted,
      underReview,
      interviewStage,
      pendingApproval,
      approved,
      rejected,
      approvalRate: submitted > 0 ? ((approved / submitted) * 100).toFixed(1) : 0,
      rejectionRate: submitted > 0 ? ((rejected / submitted) * 100).toFixed(1) : 0,
    }

    // Applications by pet type
    const applicationsByPetType = await db
      .select({
        petType: pets.type,
        count: sql<number>`cast(count(*) as int)`.as('count'),
      })
      .from(applications)
      .innerJoin(pets, eq(applications.petId, pets.id))
      .groupBy(pets.type)

    // Applications by shelter
    const applicationsByShelter = await db
      .select({
        shelterName: shelters.name,
        shelterId: shelters.id,
        count: sql<number>`cast(count(*) as int)`.as('count'),
        approved: sql<number>`cast(count(CASE WHEN ${applications.status} = 'approved' THEN 1 END) as int)`.as('approved'),
      })
      .from(applications)
      .innerJoin(pets, eq(applications.petId, pets.id))
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .groupBy(shelters.id, shelters.name)
      .orderBy(sql`count(*) DESC`)
      .limit(10)

    // Calculate shelter success rates
    const sheltersWithSuccessRate = applicationsByShelter.map(shelter => ({
      ...shelter,
      successRate: shelter.count > 0
        ? ((shelter.approved / shelter.count) * 100).toFixed(1)
        : 0,
    }))

    // Top applicants (users with most applications)
    const topApplicants = await db
      .select({
        userId: users.id,
        userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('user_name'),
        email: users.email,
        applicationCount: sql<number>`cast(count(*) as int)`.as('application_count'),
        approved: sql<number>`cast(count(CASE WHEN ${applications.status} = 'approved' THEN 1 END) as int)`.as('approved'),
      })
      .from(applications)
      .innerJoin(users, eq(applications.adopterId, users.id))
      .groupBy(users.id, users.firstName, users.lastName, users.email)
      .orderBy(sql`count(*) DESC`)
      .limit(10)

    // Average time to approval (in days)
    // This calculates the average time from submission to approval
    const avgTimeToApproval = await db
      .select({
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (${applications.reviewedAt} - ${applications.submittedAt})) / 86400)`,
      })
      .from(applications)
      .where(
        and(
          eq(applications.status, 'approved'),
          sql`${applications.submittedAt} IS NOT NULL`,
          sql`${applications.reviewedAt} IS NOT NULL`
        )
      )

    const averageProcessingDays = avgTimeToApproval[0]?.avgDays != null
      ? parseFloat(Number(avgTimeToApproval[0].avgDays).toFixed(1))
      : null

    return NextResponse.json({
      byStatus: statusWithPercentages,
      funnel,
      byPetType: applicationsByPetType,
      byShelter: sheltersWithSuccessRate,
      topApplicants,
      averageProcessingDays,
    })
  } catch (error) {
    console.error('Error fetching application analytics:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Failed to fetch application analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
