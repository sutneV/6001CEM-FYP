import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/services/messaging'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversationId = params.id
    const conversation = await messagingService.getConversationById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user has access to this conversation
    const hasAccess = 
      conversation.adopterId === user.id || 
      (user.role === 'shelter' && conversation.shelter.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const messages = await messagingService.getMessagesForConversation(conversationId)

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error('Error fetching conversation details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation details' },
      { status: 500 }
    )
  }
}