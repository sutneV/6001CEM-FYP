import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers, communityPosts, users } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities/[id]/posts - Get community posts (members only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromSession(request)
    const { id: communityId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Check if community exists
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

    // Check if user is authenticated and is a member
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to view community posts' },
        { status: 401 }
      )
    }

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
        { success: false, error: 'You must be a member to view posts in this community' },
        { status: 403 }
      )
    }

    // Get posts with author information
    const posts = await db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        content: communityPosts.content,
        type: communityPosts.type,
        images: communityPosts.images,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.authorId, users.id))
      .where(
        and(
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      )
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.communityId, communityId),
          eq(communityPosts.isDeleted, false)
        )
      )

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching community posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/communities/[id]/posts - Create a new post (members only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: communityId } = await params
    const body = await request.json()
    const { title, content, type = 'text', images = [] } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
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
        { success: false, error: 'You must be a member to post in this community' },
        { status: 403 }
      )
    }

    // Create the post
    const newPost = await db
      .insert(communityPosts)
      .values({
        communityId,
        authorId: user.userId,
        title,
        content,
        type,
        images,
      })
      .returning()

    // Get the post with author information
    const postWithAuthor = await db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        content: communityPosts.content,
        type: communityPosts.type,
        images: communityPosts.images,
        likesCount: communityPosts.likesCount,
        commentsCount: communityPosts.commentsCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.authorId, users.id))
      .where(eq(communityPosts.id, newPost[0].id))
      .limit(1)

    return NextResponse.json({
      success: true,
      data: postWithAuthor[0],
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}