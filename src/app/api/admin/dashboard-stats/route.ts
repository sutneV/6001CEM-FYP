import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters, pets, applications, shelterApplications } from '@/lib/db/schema'
import { count, sql, desc, and, gte, lt, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Get current date for time-based queries
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch all stats in parallel
    const [
      totalUsersResult,
      lastMonthUsersResult,
      activeSheltersResult,
      availablePetsResult,
      adoptedPetsResult,
      pendingPetsResult,
      pendingApplicationsResult,
      pendingShelterApplicationsResult,
      recentUsers,
      recentPets,
      recentShelters,
      recentApplications,
      todayUsersResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),

      // Last month users for growth calculation
      db.select({ count: count() }).from(users).where(lt(users.createdAt, lastMonth)),

      // Active shelters
      db.select({ count: count() }).from(shelters),

      // Available pets
      db.select({ count: count() }).from(pets).where(eq(pets.status, 'available')),

      // Adopted pets
      db.select({ count: count() }).from(pets).where(eq(pets.status, 'adopted')),

      // Pending pets
      db.select({ count: count() }).from(pets).where(eq(pets.status, 'pending')),

      // Pending applications
      db.select({ count: count() }).from(applications).where(
        sql`${applications.status} IN ('submitted', 'under_review', 'pending_approval')`
      ),

      // Pending shelter applications
      db.select({ count: count() }).from(shelterApplications).where(
        eq(shelterApplications.status, 'pending')
      ),

      // Recent users (last 5)
      db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt)).limit(5),

      // Recent pets (last 5)
      db.select({
        id: pets.id,
        name: pets.name,
        type: pets.type,
        status: pets.status,
        createdAt: pets.createdAt,
      }).from(pets).orderBy(desc(pets.createdAt)).limit(5),

      // Recent shelters (last 5)
      db.select({
        id: shelters.id,
        name: shelters.name,
        createdAt: shelters.createdAt,
      }).from(shelters).orderBy(desc(shelters.createdAt)).limit(5),

      // Recent applications (last 5)
      db.select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
      }).from(applications).orderBy(desc(applications.createdAt)).limit(5),

      // Today's new users
      db.select({ count: count() }).from(users).where(gte(users.createdAt, today)),
    ])

    const totalUsers = totalUsersResult[0].count
    const lastMonthUsers = lastMonthUsersResult[0].count
    const userGrowth = lastMonthUsers > 0
      ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0

    const activeShelters = activeSheltersResult[0].count
    const availablePets = availablePetsResult[0].count
    const adoptedPets = adoptedPetsResult[0].count
    const pendingPets = pendingPetsResult[0].count
    const pendingApplications = pendingApplicationsResult[0].count
    const pendingShelterApps = pendingShelterApplicationsResult[0].count
    const todayNewUsers = todayUsersResult[0].count

    // Calculate total pets and success rate
    const totalPets = availablePets + adoptedPets + pendingPets
    const successRate = totalPets > 0
      ? Math.round((adoptedPets / totalPets) * 100)
      : 0

    // Build recent activity feed
    const recentActivity = []

    // Add recent shelters
    for (const shelter of recentShelters.slice(0, 2)) {
      recentActivity.push({
        type: 'shelter_registered',
        action: 'New shelter registered',
        details: `${shelter.name} joined`,
        time: shelter.createdAt,
        icon: 'Building',
        color: 'bg-green-100 text-green-700',
      })
    }

    // Add recent pets
    for (const pet of recentPets.slice(0, 2)) {
      if (pet.status === 'adopted') {
        recentActivity.push({
          type: 'pet_adopted',
          action: 'Pet adopted',
          details: `${pet.name} (${pet.type}) was adopted`,
          time: pet.createdAt,
          icon: 'CheckCircle2',
          color: 'bg-blue-100 text-blue-700',
        })
      } else {
        recentActivity.push({
          type: 'pet_added',
          action: 'New pet added',
          details: `${pet.name} (${pet.type})`,
          time: pet.createdAt,
          icon: 'PawPrint',
          color: 'bg-purple-100 text-purple-700',
        })
      }
    }

    // Sort by time and get top 4
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const sortedActivity = recentActivity.slice(0, 4)

    // Build system alerts
    const systemAlerts = []

    if (pendingApplications > 0) {
      systemAlerts.push({
        title: 'Pending Applications',
        description: `${pendingApplications} adoption applications need review`,
        priority: pendingApplications > 20 ? 'high' : 'medium',
        icon: 'ClipboardList',
      })
    }

    if (pendingShelterApps > 0) {
      systemAlerts.push({
        title: 'Shelter Applications Pending',
        description: `${pendingShelterApps} shelter applications awaiting approval`,
        priority: pendingShelterApps > 5 ? 'high' : 'medium',
        icon: 'Building',
      })
    }

    if (todayNewUsers > 0) {
      systemAlerts.push({
        title: 'New User Registrations',
        description: `${todayNewUsers} new users registered today`,
        priority: 'info',
        icon: 'Users',
      })
    }

    // Always add a system info alert
    systemAlerts.push({
      title: 'System Status',
      description: 'All services operating normally',
      priority: 'low',
      icon: 'Settings',
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        userGrowth,
        activeShelters,
        availablePets,
        adoptedPets,
        pendingPets,
        totalPets,
        pendingApplications,
        pendingShelterApps,
        successRate,
        todayNewUsers,
      },
      recentActivity: sortedActivity,
      systemAlerts: systemAlerts.slice(0, 4),
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Stack trace:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
