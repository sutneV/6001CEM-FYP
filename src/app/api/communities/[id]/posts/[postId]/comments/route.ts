import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityPosts, communityPostComments, communityMembers, users } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities/[id]/posts/[postId]/comments - Get post comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

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
        { success: false, error: 'You must be a member to view comments in this community' },
        { status: 403 }
      )
    }

    // Get comments with author information
    const comments = await db
      .select({
        id: communityPostComments.id,
        content: communityPostComments.content,
        createdAt: communityPostComments.createdAt,
        updatedAt: communityPostComments.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          avatar: users.avatar,
        },
      })
      .from(communityPostComments)
      .innerJoin(users, eq(communityPostComments.authorId, users.id))
      .where(
        and(
          eq(communityPostComments.postId, postId),
          eq(communityPostComments.isDeleted, false)
        )
      )
      .orderBy(desc(communityPostComments.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPostComments)
      .where(
        and(
          eq(communityPostComments.postId, postId),
          eq(communityPostComments.isDeleted, false)
        )
      )

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/communities/[id]/posts/[postId]/comments - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId, postId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }

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
        { success: false, error: 'You must be a member to comment in this community' },
        { status: 403 }
      )
    }

    // Verify the post exists and belongs to the community
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

    // Create the comment
    const newComment = await db
      .insert(communityPostComments)
      .values({
        postId,
        authorId: user.userId,
        content: content.trim(),
      })
      .returning()

    // Update the comments count on the post
    await db
      .update(communityPosts)
      .set({ 
        commentsCount: sql`${communityPosts.commentsCount} + 1` 
      })
      .where(eq(communityPosts.id, postId))

    // Get the comment with author information
    const commentWithAuthor = await db
      .select({
        id: communityPostComments.id,
        content: communityPostComments.content,
        createdAt: communityPostComments.createdAt,
        updatedAt: communityPostComments.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          avatar: users.avatar,
        },
      })
      .from(communityPostComments)
      .innerJoin(users, eq(communityPostComments.authorId, users.id))
      .where(eq(communityPostComments.id, newComment[0].id))
      .limit(1)

    // Get updated comments count
    const updatedPost = await db
      .select({ commentsCount: communityPosts.commentsCount })
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1)

    return NextResponse.json({
      success: true,
      data: {
        comment: commentWithAuthor[0],
        commentsCount: updatedPost[0].commentsCount
      }
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}