import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiChatConversations, aiChatMessages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/ai-chat/[id]/messages - Save a message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const conversationId = params.id
    const { sender, content } = await request.json()

    // Verify conversation belongs to user
    const [conversation] = await db
      .select()
      .from(aiChatConversations)
      .where(
        and(
          eq(aiChatConversations.id, conversationId),
          eq(aiChatConversations.userId, user.id)
        )
      )

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Save the message
    const [newMessage] = await db
      .insert(aiChatMessages)
      .values({
        conversationId,
        sender,
        content
      })
      .returning()

    // Update conversation's updatedAt timestamp
    await db
      .update(aiChatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(aiChatConversations.id, conversationId))

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}
