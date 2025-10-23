import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, applications, pets } from '@/lib/db/schema'
import { sql, gte } from 'drizzle-orm'

// GET /api/admin/analytics/trends - Get trend analytics over time
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // User registrations over time (daily)
    const userTrends = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`)

    // Applications over time (daily)
    const applicationTrends = await db
      .select({
        date: sql<string>`DATE(${applications.createdAt})`,
        total: sql<number>`COUNT(*)::int`,
        approved: sql<number>`COUNT(CASE WHEN ${applications.status} = 'approved' THEN 1 END)::int`,
        rejected: sql<number>`COUNT(CASE WHEN ${applications.status} = 'rejected' THEN 1 END)::int`,
        pending: sql<number>`COUNT(CASE WHEN ${applications.status} NOT IN ('approved', 'rejected', 'draft', 'withdrawn') THEN 1 END)::int`,
      })
      .from(applications)
      .where(gte(applications.createdAt, startDate))
      .groupBy(sql`DATE(${applications.createdAt})`)
      .orderBy(sql`DATE(${applications.createdAt})`)

    // Pets added over time (daily)
    const petTrends = await db
      .select({
        date: sql<string>`DATE(${pets.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
        available: sql<number>`COUNT(CASE WHEN ${pets.status} = 'available' THEN 1 END)::int`,
        adopted: sql<number>`COUNT(CASE WHEN ${pets.status} = 'adopted' THEN 1 END)::int`,
      })
      .from(pets)
      .where(gte(pets.createdAt, startDate))
      .groupBy(sql`DATE(${pets.createdAt})`)
      .orderBy(sql`DATE(${pets.createdAt})`)

    // Fill in missing dates with zero counts
    const fillMissingDates = (data: any[], startDate: Date, daysAgo: number) => {
      const filledData = []
      const dataMap = new Map(data.map(item => [item.date, item]))

      for (let i = 0; i < daysAgo; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateString = date.toISOString().split('T')[0]

        if (dataMap.has(dateString)) {
          filledData.push(dataMap.get(dateString))
        } else {
          filledData.push({
            date: dateString,
            count: 0,
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            available: 0,
            adopted: 0,
          })
        }
      }

      return filledData
    }

    // Fill missing dates for all trends
    const filledUserTrends = fillMissingDates(userTrends, startDate, daysAgo)
    const filledApplicationTrends = fillMissingDates(applicationTrends, startDate, daysAgo)
    const filledPetTrends = fillMissingDates(petTrends, startDate, daysAgo)

    // Calculate cumulative totals
    let cumulativeUsers = 0
    const userTrendsWithCumulative = filledUserTrends.map(item => {
      cumulativeUsers += item.count || 0
      return {
        ...item,
        cumulative: cumulativeUsers,
      }
    })

    let cumulativeApplications = 0
    const applicationTrendsWithCumulative = filledApplicationTrends.map(item => {
      cumulativeApplications += item.total || 0
      return {
        ...item,
        cumulative: cumulativeApplications,
      }
    })

    let cumulativePets = 0
    const petTrendsWithCumulative = filledPetTrends.map(item => {
      cumulativePets += item.count || 0
      return {
        ...item,
        cumulative: cumulativePets,
      }
    })

    return NextResponse.json({
      users: userTrendsWithCumulative,
      applications: applicationTrendsWithCumulative,
      pets: petTrendsWithCumulative,
      period: daysAgo,
    })
  } catch (error) {
    console.error('Error fetching trend analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trend analytics' },
      { status: 500 }
    )
  }
}
