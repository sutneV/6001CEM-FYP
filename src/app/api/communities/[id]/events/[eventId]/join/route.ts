import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communityEvents, communityEventParticipants, communityMembers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

function getUserFromSession(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')
  
  if (!userId || !userRole) {
    return null
  }

  return { userId, role: userRole }
}

// POST /api/communities/[id]/events/[eventId]/join - Join an event
export async function POST(
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

    const { id: communityId, eventId } = await params

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
        { success: false, error: 'You must be a member to join events in this community' },
        { status: 403 }
      )
    }

    // Check if event exists and is not deleted
    const event = await db
      .select({
        id: communityEvents.id,
        maxParticipants: communityEvents.maxParticipants,
        currentParticipants: communityEvents.currentParticipants,
      })
      .from(communityEvents)
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

    const eventData = event[0]

    // Check if user is already a participant
    const existingParticipation = await db
      .select()
      .from(communityEventParticipants)
      .where(
        and(
          eq(communityEventParticipants.eventId, eventId),
          eq(communityEventParticipants.userId, user.userId)
        )
      )
      .limit(1)

    if (existingParticipation.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Check if event has reached max participants
    if (eventData.maxParticipants && eventData.currentParticipants >= eventData.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'This event is full' },
        { status: 400 }
      )
    }

    // Join the event
    await db
      .insert(communityEventParticipants)
      .values({
        eventId,
        userId: user.userId,
      })

    // Update participant count
    await db
      .update(communityEvents)
      .set({
        currentParticipants: sql`${communityEvents.currentParticipants} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(communityEvents.id, eventId))

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the event',
    })
  } catch (error) {
    console.error('Error joining event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join event' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/events/[eventId]/join - Leave an event
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

    // Check if user is a participant
    const participation = await db
      .select()
      .from(communityEventParticipants)
      .where(
        and(
          eq(communityEventParticipants.eventId, eventId),
          eq(communityEventParticipants.userId, user.userId)
        )
      )
      .limit(1)

    if (participation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'You are not registered for this event' },
        { status: 400 }
      )
    }

    // Leave the event
    await db
      .delete(communityEventParticipants)
      .where(
        and(
          eq(communityEventParticipants.eventId, eventId),
          eq(communityEventParticipants.userId, user.userId)
        )
      )

    // Update participant count
    await db
      .update(communityEvents)
      .set({
        currentParticipants: sql`${communityEvents.currentParticipants} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(communityEvents.id, eventId))

    return NextResponse.json({
      success: true,
      message: 'Successfully left the event',
    })
  } catch (error) {
    console.error('Error leaving event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to leave event' },
      { status: 500 }
    )
  }
}