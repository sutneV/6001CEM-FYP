import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communities, communityMembers, communityEvents, communityEventParticipants, users } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities/[id]/events - Get community events (members only)
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
        { success: false, error: 'You must be logged in to view community events' },
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
        { success: false, error: 'You must be a member to view events in this community' },
        { status: 403 }
      )
    }

    // Get events with organizer information
    const events = await db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventDate: communityEvents.eventDate,
        eventTime: communityEvents.eventTime,
        location: communityEvents.location,
        fee: communityEvents.fee,
        maxParticipants: communityEvents.maxParticipants,
        currentParticipants: communityEvents.currentParticipants,
        images: communityEvents.images,
        createdAt: communityEvents.createdAt,
        updatedAt: communityEvents.updatedAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(communityEvents)
      .innerJoin(users, eq(communityEvents.organizerId, users.id))
      .where(
        and(
          eq(communityEvents.communityId, communityId),
          eq(communityEvents.isDeleted, false)
        )
      )
      .orderBy(desc(communityEvents.eventDate))
      .limit(limit)
      .offset(offset)

    // If user is authenticated, check which events they've joined
    let eventsWithParticipation = events
    if (user) {
      // Get user's participation status for all events
      const userParticipation = await db
        .select({
          eventId: communityEventParticipants.eventId,
        })
        .from(communityEventParticipants)
        .where(eq(communityEventParticipants.userId, user.userId))

      const participatedEventIds = new Set(userParticipation.map(p => p.eventId))

      // Add participation status to each event
      eventsWithParticipation = events.map(event => ({
        ...event,
        isUserParticipant: participatedEventIds.has(event.id)
      }))
    } else {
      // For unauthenticated users, set participation to false
      eventsWithParticipation = events.map(event => ({
        ...event,
        isUserParticipant: false
      }))
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityEvents)
      .where(
        and(
          eq(communityEvents.communityId, communityId),
          eq(communityEvents.isDeleted, false)
        )
      )

    return NextResponse.json({
      success: true,
      data: eventsWithParticipation,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching community events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/communities/[id]/events - Create a new event (members only)
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
    const { 
      title, 
      description, 
      eventDate, 
      eventTime, 
      location, 
      fee = 'Free',
      maxParticipants,
      images = [] 
    } = body

    if (!title || !description || !eventDate || !location) {
      return NextResponse.json(
        { success: false, error: 'Title, description, date, and location are required' },
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
        { success: false, error: 'You must be a member to create events in this community' },
        { status: 403 }
      )
    }

    // Parse eventDate (expecting YYYY-MM-DD format from frontend)
    const parsedEventDate = new Date(eventDate + 'T00:00:00.000Z')
    
    // Create the event
    const newEvent = await db
      .insert(communityEvents)
      .values({
        communityId,
        organizerId: user.userId,
        title,
        description,
        eventDate: parsedEventDate,
        eventTime,
        location,
        fee,
        maxParticipants,
        images,
      })
      .returning()

    // Get the event with organizer information
    const eventWithOrganizer = await db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventDate: communityEvents.eventDate,
        eventTime: communityEvents.eventTime,
        location: communityEvents.location,
        fee: communityEvents.fee,
        maxParticipants: communityEvents.maxParticipants,
        currentParticipants: communityEvents.currentParticipants,
        images: communityEvents.images,
        createdAt: communityEvents.createdAt,
        updatedAt: communityEvents.updatedAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(communityEvents)
      .innerJoin(users, eq(communityEvents.organizerId, users.id))
      .where(eq(communityEvents.id, newEvent[0].id))
      .limit(1)

    return NextResponse.json({
      success: true,
      data: eventWithOrganizer[0],
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}