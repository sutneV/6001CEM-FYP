import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters, pets, applications } from '@/lib/db/schema'
import { eq, count, sql, and, gte } from 'drizzle-orm'

// GET /api/admin/analytics/overview - Get overview statistics
export async function GET(request: NextRequest) {
  try {
    // Get date ranges for comparisons
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total users count and breakdown by role
    const totalUsersResult = await db
      .select({
        total: sql<number>`cast(count(*) as int)`.as('total'),
        role: users.role
      })
      .from(users)
      .groupBy(users.role)

    const totalUsers = totalUsersResult.reduce((sum, item) => sum + item.total, 0)
    const adoptersCount = totalUsersResult.find(u => u.role === 'adopter')?.total || 0
    const sheltersUserCount = totalUsersResult.find(u => u.role === 'shelter')?.total || 0
    const adminsCount = totalUsersResult.find(u => u.role === 'admin')?.total || 0

    // New users in last 30 days
    const newUsersResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.as('count') })
      .from(users)
      .where(gte(users.createdAt, last30Days))

    const newUsers = newUsersResult[0]?.count || 0

    // Active shelters count
    const activeSheltersResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.as('count') })
      .from(shelters)

    const activeShelters = activeSheltersResult[0]?.count || 0

    // Pets statistics
    const petsStatsResult = await db
      .select({
        total: sql<number>`cast(count(*) as int)`.as('total'),
        status: pets.status
      })
      .from(pets)
      .groupBy(pets.status)

    const totalPets = petsStatsResult.reduce((sum, item) => sum + item.total, 0)
    const availablePets = petsStatsResult.find(p => p.status === 'available')?.total || 0
    const pendingPets = petsStatsResult.find(p => p.status === 'pending')?.total || 0
    const adoptedPets = petsStatsResult.find(p => p.status === 'adopted')?.total || 0

    // Applications statistics
    const applicationsStatsResult = await db
      .select({
        total: sql<number>`cast(count(*) as int)`.as('total'),
        status: applications.status
      })
      .from(applications)
      .groupBy(applications.status)

    const totalApplications = applicationsStatsResult.reduce((sum, item) => sum + item.total, 0)
    const pendingApplications = applicationsStatsResult.filter(a =>
      ['submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval'].includes(a.status)
    ).reduce((sum, item) => sum + item.total, 0)
    const approvedApplications = applicationsStatsResult.find(a => a.status === 'approved')?.total || 0
    const rejectedApplications = applicationsStatsResult.find(a => a.status === 'rejected')?.total || 0

    // Calculate approval rate
    const submittedApplications = totalApplications - (applicationsStatsResult.find(a => a.status === 'draft')?.total || 0)
    const approvalRate = submittedApplications > 0
      ? ((approvedApplications / submittedApplications) * 100).toFixed(1)
      : 0

    // New applications in last 30 days
    const newApplicationsResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.as('count') })
      .from(applications)
      .where(gte(applications.createdAt, last30Days))

    const newApplications = newApplicationsResult[0]?.count || 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        adopters: adoptersCount,
        shelters: sheltersUserCount,
        admins: adminsCount,
        newLast30Days: newUsers,
      },
      shelters: {
        active: activeShelters,
      },
      pets: {
        total: totalPets,
        available: availablePets,
        pending: pendingPets,
        adopted: adoptedPets,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        approvalRate: parseFloat(approvalRate as string),
        newLast30Days: newApplications,
      },
    })
  } catch (error) {
    console.error('Error fetching overview analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overview analytics' },
      { status: 500 }
    )
  }
}
