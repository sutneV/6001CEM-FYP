import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiChatConversations, aiChatMessages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/ai-chat/[id]/messages - Save a message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const { id: conversationId } = await params
    const { sender, content, images } = await request.json()

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

    // Ensure images is a proper array
    let imageArray = []
    if (images !== undefined && images !== null) {
      if (Array.isArray(images)) {
        imageArray = images
      } else if (typeof images === 'string') {
        try {
          imageArray = JSON.parse(images)
        } catch {
          imageArray = []
        }
      }
    }

    // Save the message - explicitly set images to the array or undefined
    const [newMessage] = await db
      .insert(aiChatMessages)
      .values({
        conversationId,
        sender,
        content,
        ...(imageArray.length > 0 ? { images: imageArray } : {})
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
