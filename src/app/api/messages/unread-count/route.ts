import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/services/messaging'
import { db } from '@/lib/db'
import { shelters } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = JSON.parse(userHeader)
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userRole = user.role as 'adopter' | 'shelter'
    let userId = user.id

    // If user is a shelter, we need to get the shelter ID
    if (userRole === 'shelter') {
      const shelter = await db
        .select()
        .from(shelters)
        .where(eq(shelters.userId, user.id))
        .limit(1)
      
      if (!shelter[0]) {
        return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
      }
      userId = shelter[0].id
    }

    const unreadCount = await messagingService.getUnreadMessageCount(userId, userRole)

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread message count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread message count' },
      { status: 500 }
    )
  }
}