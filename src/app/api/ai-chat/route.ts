import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiChatConversations, aiChatMessages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/ai-chat - Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)

    const conversations = await db
      .select()
      .from(aiChatConversations)
      .where(eq(aiChatConversations.userId, user.id))
      .orderBy(desc(aiChatConversations.updatedAt))

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await db
          .select()
          .from(aiChatMessages)
          .where(eq(aiChatMessages.conversationId, conv.id))
          .orderBy(aiChatMessages.createdAt)

        return {
          ...conv,
          messages
        }
      })
    )

    return NextResponse.json({ conversations: conversationsWithMessages })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/ai-chat - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const { title = 'New Chat' } = await request.json()

    const [newConversation] = await db
      .insert(aiChatConversations)
      .values({
        userId: user.id,
        title,
      })
      .returning()

    // Add initial AI greeting message
    const [initialMessage] = await db
      .insert(aiChatMessages)
      .values({
        conversationId: newConversation.id,
        sender: 'ai',
        content: "Hello! I'm your AI assistant for shelter management. I can help you with pet care advice, adoption processes, volunteer coordination, fundraising ideas, and shelter operations. How can I assist you today?"
      })
      .returning()

    return NextResponse.json({
      conversation: {
        ...newConversation,
        messages: [initialMessage]
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
