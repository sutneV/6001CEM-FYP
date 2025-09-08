import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// POST /api/communities/[id]/join - Join a community
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const communityId = params.id

    // Check if community exists and is public
    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1)

    if (community.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      )
    }

    if (!community[0].isPublic) {
      return NextResponse.json(
        { success: false, error: 'Community is private' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, user.userId)
        )
      )
      .limit(1)

    if (existingMember.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already a member of this community' },
        { status: 400 }
      )
    }

    // Add user to community
    await db.insert(communityMembers).values({
      communityId,
      userId: user.userId,
      role: 'member',
    })

    // Update member count
    await db
      .update(communities)
      .set({
        memberCount: sql`${communities.memberCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(communities.id, communityId))

    return NextResponse.json({
      success: true,
      message: 'Successfully joined community',
    })
  } catch (error) {
    console.error('Error joining community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join community' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/join - Leave a community
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const communityId = params.id

    // Check if user is a member
    const membership = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, user.userId)
        )
      )
      .limit(1)

    if (membership.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not a member of this community' },
        { status: 400 }
      )
    }

    // Don't allow owner to leave their own community
    if (membership[0].role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Community owners cannot leave their own community' },
        { status: 400 }
      )
    }

    // Remove user from community
    await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, user.userId)
        )
      )

    // Update member count
    await db
      .update(communities)
      .set({
        memberCount: sql`${communities.memberCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(communities.id, communityId))

    return NextResponse.json({
      success: true,
      message: 'Successfully left community',
    })
  } catch (error) {
    console.error('Error leaving community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to leave community' },
      { status: 500 }
    )
  }
}