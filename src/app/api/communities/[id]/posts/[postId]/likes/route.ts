import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityPosts, communityPostLikes, communityMembers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// POST /api/communities/[id]/posts/[postId]/likes - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    console.log('POST /likes API called')
    const user = getUserFromSession(request)
    console.log('User from session:', user)
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = await params
    console.log('Community ID:', communityId, 'Post ID:', postId)

    // Check if user is a member of the community
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
        { success: false, error: 'You must be a member to like posts in this community' },
        { status: 403 }
      )
    }

    // Check if user has already liked this post
    const existingLike = await db
      .select()
      .from(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.postId, postId),
          eq(communityPostLikes.userId, user.userId)
        )
      )
      .limit(1)

    if (existingLike.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already liked this post' },
        { status: 400 }
      )
    }

    // Create the like
    await db.insert(communityPostLikes).values({
      postId,
      userId: user.userId,
    })

    // Update the likes count on the post
    await db
      .update(communityPosts)
      .set({ 
        likesCount: sql`${communityPosts.likesCount} + 1` 
      })
      .where(eq(communityPosts.id, postId))

    // Get actual likes count from likes table
    const actualLikesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPostLikes)
      .where(eq(communityPostLikes.postId, postId))

    return NextResponse.json({
      success: true,
      data: {
        liked: true,
        likesCount: actualLikesCount[0].count
      }
    })
  } catch (error) {
    console.error('Error liking post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/posts/[postId]/likes - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    console.log('DELETE /likes API called')
    const user = getUserFromSession(request)
    console.log('User from session:', user)
    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = await params
    console.log('Community ID:', communityId, 'Post ID:', postId)

    // Check if user is a member of the community
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
        { success: false, error: 'You must be a member to unlike posts in this community' },
        { status: 403 }
      )
    }

    // Delete the like
    await db
      .delete(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.postId, postId),
          eq(communityPostLikes.userId, user.userId)
        )
      )

    // Update the likes count on the post
    await db
      .update(communityPosts)
      .set({ 
        likesCount: sql`GREATEST(${communityPosts.likesCount} - 1, 0)` 
      })
      .where(eq(communityPosts.id, postId))

    // Get actual likes count from likes table
    const actualLikesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPostLikes)
      .where(eq(communityPostLikes.postId, postId))

    return NextResponse.json({
      success: true,
      data: {
        liked: false,
        likesCount: actualLikesCount[0].count
      }
    })
  } catch (error) {
    console.error('Error unliking post:', error)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    )
  }
}