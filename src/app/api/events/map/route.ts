import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityEvents, communityMembers, users, communities } from '@/lib/db/schema'
import { eq, and, isNotNull, desc } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/events/map - Get all events from communities the user has joined for map display
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromSession(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all community IDs where the user is a member
    const userMemberships = await db
      .select({ communityId: communityMembers.communityId })
      .from(communityMembers)
      .where(eq(communityMembers.userId, user.userId))

    const memberCommunityIds = userMemberships.map(m => m.communityId)

    if (memberCommunityIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Get all events from communities the user is a member of that have geolocation
    const events = await db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventDate: communityEvents.eventDate,
        eventTime: communityEvents.eventTime,
        location: communityEvents.location,
        latitude: communityEvents.latitude,
        longitude: communityEvents.longitude,
        fee: communityEvents.fee,
        maxParticipants: communityEvents.maxParticipants,
        currentParticipants: communityEvents.currentParticipants,
        createdAt: communityEvents.createdAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
        community: {
          id: communities.id,
          name: communities.name,
        }
      })
      .from(communityEvents)
      .innerJoin(users, eq(communityEvents.organizerId, users.id))
      .innerJoin(communities, eq(communityEvents.communityId, communities.id))
      .where(
        and(
          eq(communityEvents.isDeleted, false),
          isNotNull(communityEvents.latitude),
          isNotNull(communityEvents.longitude)
        )
      )
      .orderBy(desc(communityEvents.eventDate))

    // Filter events to only include those from communities the user is a member of
    const userEvents = events.filter(event => 
      memberCommunityIds.includes(event.community.id)
    )

    return NextResponse.json({
      success: true,
      data: userEvents,
    })
  } catch (error) {
    console.error('Error fetching map events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}