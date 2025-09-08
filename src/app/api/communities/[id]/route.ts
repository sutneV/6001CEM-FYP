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

// GET /api/communities/[id] - Get community details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = params.id

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

    const user = getUserFromSession(request)
    let isMember = false
    let memberRole = null

    if (user) {
      const membership = await db
        .select({ role: communityMembers.role })
        .from(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, user.userId)
          )
        )
        .limit(1)

      if (membership.length > 0) {
        isMember = true
        memberRole = membership[0].role
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...community[0],
        isMember,
        memberRole,
      },
    })
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community' },
      { status: 500 }
    )
  }
}

// PUT /api/communities/[id] - Update community (owner only)
export async function PUT(
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
    const body = await request.json()

    // Check if user is the owner of the community
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

    if (community[0].ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Only community owners can update communities' },
        { status: 403 }
      )
    }

    // Update the community
    const updatedCommunity = await db
      .update(communities)
      .set({
        name: body.name,
        description: body.description,
        category: body.category,
        bannerImage: body.bannerImage,
        isPublic: body.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(communities.id, communityId))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedCommunity[0],
    })
  } catch (error) {
    console.error('Error updating community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update community' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id] - Delete community (owner only)
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

    // Check if user is the owner of the community
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

    if (community[0].ownerId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Only community owners can delete communities' },
        { status: 403 }
      )
    }

    // Delete the community (cascade will handle members and posts)
    await db.delete(communities).where(eq(communities.id, communityId))

    return NextResponse.json({
      success: true,
      message: 'Community deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete community' },
      { status: 500 }
    )
  }
}