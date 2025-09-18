import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities/[id]/members - Get community members (owner only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params
    const user = getUserFromSession(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if community exists and if user is the owner
    const community = await db
      .select({ ownerId: communities.ownerId })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1)

    if (community.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      )
    }

    // Only allow community owner to view members
    if (community[0].ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only community owners can view members' },
        { status: 403 }
      )
    }

    // Get all members with their user details
    const members = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        joinedAt: communityMembers.joinedAt,
      })
      .from(communityMembers)
      .innerJoin(users, eq(communityMembers.userId, users.id))
      .where(eq(communityMembers.communityId, communityId))
      .orderBy(communityMembers.joinedAt)

    return NextResponse.json({
      success: true,
      data: members
    })

  } catch (error) {
    console.error('Error fetching community members:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}