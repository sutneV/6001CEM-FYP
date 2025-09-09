import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityEvents, communityEventParticipants, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// GET /api/communities/[id]/events/[eventId] - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params

    // Get event with organizer information
    const event = await db
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
          eq(communityEvents.id, eventId),
          eq(communityEvents.isDeleted, false)
        )
      )
      .limit(1)

    if (event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event[0],
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/communities/[id]/events/[eventId] - Update event (organizer only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params
    const body = await request.json()
    const { 
      title, 
      description, 
      eventDate, 
      eventTime, 
      location, 
      fee,
      maxParticipants 
    } = body

    // Check if user is the organizer of this event
    const event = await db
      .select()
      .from(communityEvents)
      .where(
        and(
          eq(communityEvents.id, eventId),
          eq(communityEvents.organizerId, user.userId)
        )
      )
      .limit(1)

    if (event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found or you are not the organizer' },
        { status: 404 }
      )
    }

    // Update the event
    const updatedEvent = await db
      .update(communityEvents)
      .set({
        title,
        description,
        eventDate: eventDate ? new Date(eventDate + 'T00:00:00.000Z') : undefined,
        eventTime,
        location,
        fee,
        maxParticipants,
        updatedAt: new Date(),
      })
      .where(eq(communityEvents.id, eventId))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedEvent[0],
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/events/[eventId] - Delete event (organizer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const user = getUserFromSession(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params

    // Check if user is the organizer of this event
    const event = await db
      .select()
      .from(communityEvents)
      .where(
        and(
          eq(communityEvents.id, eventId),
          eq(communityEvents.organizerId, user.userId)
        )
      )
      .limit(1)

    if (event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found or you are not the organizer' },
        { status: 404 }
      )
    }

    // Soft delete the event
    await db
      .update(communityEvents)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(communityEvents.id, eventId))

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}