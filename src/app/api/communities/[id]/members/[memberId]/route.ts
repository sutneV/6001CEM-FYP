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

// DELETE /api/communities/[id]/members/[memberId] - Remove member from community (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: communityId, memberId } = await params
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

    // Only allow community owner to remove members
    if (community[0].ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only community owners can remove members' },
        { status: 403 }
      )
    }

    // Prevent removing the community owner
    if (memberId === community[0].ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove community owner' },
        { status: 400 }
      )
    }

    // Check if member exists in the community
    const memberExists = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, memberId)
        )
      )
      .limit(1)

    if (memberExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Member not found in community' },
        { status: 404 }
      )
    }

    // Remove member from community and update count in a transaction
    await db.transaction(async (tx) => {
      // Remove member from community
      await tx
        .delete(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, memberId)
          )
        )

      // Update community member count
      await tx
        .update(communities)
        .set({
          memberCount: sql`${communities.memberCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Error removing community member:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}