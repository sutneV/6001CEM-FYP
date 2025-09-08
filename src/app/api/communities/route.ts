import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers, users, shelters } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  // In a real implementation, you'd parse session cookies or headers
  // For now, we'll expect the user ID to be passed in headers
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities - Fetch all public communities with member counts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const user = getUserFromSession(request)

    let query = db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        category: communities.category,
        bannerImage: communities.bannerImage,
        ownerId: communities.ownerId,
        ownerType: communities.ownerType,
        memberCount: communities.memberCount,
        isPublic: communities.isPublic,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .where(eq(communities.isPublic, true))
      .orderBy(desc(communities.createdAt))

    const result = await query

    // If user is authenticated, check membership status for each community
    let communitiesWithMembership = result
    if (user) {
      const memberships = await db
        .select({ communityId: communityMembers.communityId, role: communityMembers.role })
        .from(communityMembers)
        .where(eq(communityMembers.userId, user.userId))

      const membershipMap = new Map(
        memberships.map(m => [m.communityId, m.role])
      )

      communitiesWithMembership = result.map(community => ({
        ...community,
        isMember: membershipMap.has(community.id),
        memberRole: membershipMap.get(community.id) || null,
      }))
    } else {
      communitiesWithMembership = result.map(community => ({
        ...community,
        isMember: false,
        memberRole: null,
      }))
    }

    // Filter by category if provided
    let filteredCommunities = communitiesWithMembership
    if (category && category !== 'all') {
      filteredCommunities = communitiesWithMembership.filter(c => 
        c.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCommunities = filteredCommunities.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredCommunities,
    })
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, category, bannerImage, isPublic = true } = body

    if (!name || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, description, and category are required' },
        { status: 400 }
      )
    }

    // Get user details to determine owner type
    const userDetails = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1)

    if (userDetails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const ownerType = userDetails[0].role === 'shelter' ? 'shelter' : 'adopter'

    // Create the community
    const newCommunity = await db
      .insert(communities)
      .values({
        name,
        description,
        category,
        bannerImage,
        ownerId: user.userId,
        ownerType,
        memberCount: 1,
        isPublic,
      })
      .returning()

    // Add the creator as the first member with owner role
    await db.insert(communityMembers).values({
      communityId: newCommunity[0].id,
      userId: user.userId,
      role: 'owner',
    })

    return NextResponse.json({
      success: true,
      data: newCommunity[0],
    })
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create community' },
      { status: 500 }
    )
  }
}