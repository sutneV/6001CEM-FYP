import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'

async function verifyAdmin(request: NextRequest) {
  const userDataHeader = request.headers.get('x-user-data')
  if (!userDataHeader) {
    return null
  }

  try {
    const userData = JSON.parse(userDataHeader)
    if (userData.role !== 'admin') {
      return null
    }
    return userData
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Fetch only adopter users (exclude shelter and admin accounts)
    const usersWithShelters = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        phone: users.phone,
        city: users.city,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        shelterId: shelters.id,
        shelterName: shelters.name,
      })
      .from(users)
      .leftJoin(shelters, eq(users.id, shelters.userId))
      .where(eq(users.role, 'adopter'))
      .orderBy(users.createdAt)

    // Transform the data to group shelter info
    const transformedUsers = usersWithShelters.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      status: user.isActive === 'true' ? 'active' : 'suspended',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      shelter: user.shelterId ? {
        id: user.shelterId,
        name: user.shelterName
      } : undefined
    }))

    return NextResponse.json({ users: transformedUsers }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}