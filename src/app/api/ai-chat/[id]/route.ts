import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiChatConversations, aiChatMessages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// DELETE /api/ai-chat/[id] - Delete a conversation
export async function DELETE(
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

    const deleted = await db
      .delete(aiChatConversations)
      .where(
        and(
          eq(aiChatConversations.id, conversationId),
          eq(aiChatConversations.userId, user.id)
        )
      )
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}

// PATCH /api/ai-chat/[id] - Update conversation title
export async function PATCH(
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
    const { title } = await request.json()

    const [updated] = await db
      .update(aiChatConversations)
      .set({
        title,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(aiChatConversations.id, conversationId),
          eq(aiChatConversations.userId, user.id)
        )
      )
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation: updated })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}
