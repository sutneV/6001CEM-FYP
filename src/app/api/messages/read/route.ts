import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/services/messaging'

export async function POST(request: NextRequest) {
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

    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this conversation
    const conversation = await messagingService.getConversationById(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const hasAccess = 
      conversation.adopterId === user.id || 
      (user.role === 'shelter' && conversation.shelter.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await messagingService.markMessagesAsRead(conversationId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}