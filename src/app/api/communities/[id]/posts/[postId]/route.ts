import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers, communityPosts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// PUT /api/communities/[id]/posts/[postId] - Update a post (author only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = params
    const body = await request.json()
    const { title, content, type, images } = body

    // Get the post
    const post = await db
      .select()
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, postId),
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      )
      .limit(1)

    if (post.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    if (post[0].authorId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the author can edit this post' },
        { status: 403 }
      )
    }

    // Update the post
    const updatedPost = await db
      .update(communityPosts)
      .set({
        title,
        content,
        type,
        images,
        updatedAt: new Date(),
      })
      .where(eq(communityPosts.id, postId))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedPost[0],
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/posts/[postId] - Delete a post (author or community owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = params

    // Get the post
    const post = await db
      .select()
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, postId),
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      )
      .limit(1)

    if (post.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get community info
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

    // Check if user is the author or the community owner
    const isAuthor = post[0].authorId === user.userId
    const isCommunityOwner = community[0].ownerId === user.userId

    if (!isAuthor && !isCommunityOwner) {
      return NextResponse.json(
        { success: false, error: 'Only the author or community owner can delete this post' },
        { status: 403 }
      )
    }

    // Soft delete the post (mark as deleted instead of actual deletion)
    await db
      .update(communityPosts)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(communityPosts.id, postId))

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}