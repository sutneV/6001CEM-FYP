import { db } from '../db'
import { conversations, messages, users, shelters, pets } from '../db/schema'
import { eq, and, or, desc, sql, ne } from 'drizzle-orm'
import type { Conversation, Message, NewConversation, NewMessage, User, Shelter, Pet } from '../db/schema'

export interface ConversationWithDetails extends Conversation {
  adopter: User
  shelter: Shelter
  pet?: Pet
  lastMessage?: Message
  unreadCount: number
}

export interface MessageWithSender extends Message {
  sender: User
}

export class MessagingService {
  
  async getConversationsForUser(userId: string, userRole: 'adopter' | 'shelter'): Promise<ConversationWithDetails[]> {
    try {
      let whereCondition
      if (userRole === 'adopter') {
        whereCondition = eq(conversations.adopterId, userId)
      } else {
        // For shelter, userId is the shelter ID, not user ID
        whereCondition = eq(conversations.shelterId, userId)
      }

      const query = db
        .select({
          conversation: conversations,
          adopter: users,
          shelter: shelters,
          pet: pets,
        })
        .from(conversations)
        .leftJoin(users, eq(conversations.adopterId, users.id))
        .leftJoin(shelters, eq(conversations.shelterId, shelters.id))
        .leftJoin(pets, eq(conversations.petId, pets.id))
        .where(whereCondition)
        .orderBy(desc(conversations.lastMessageAt))

      const results = await query

      // For each conversation, get the last message and unread count
      const conversationsWithDetails: ConversationWithDetails[] = []
      
      for (const result of results) {
        if (!result.conversation || !result.adopter || !result.shelter) continue

        // Get last message
        const lastMessageResult = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, result.conversation.id))
          .orderBy(desc(messages.createdAt))
          .limit(1)

        // Get unread count - messages not sent by the current user that haven't been read
        const unreadCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, result.conversation.id),
              eq(messages.status, 'sent'),
              ne(messages.senderId, userId) // Messages NOT sent by current user
            )
          )

        conversationsWithDetails.push({
          ...result.conversation,
          adopter: result.adopter,
          shelter: result.shelter,
          pet: result.pet || undefined,
          lastMessage: lastMessageResult[0] || undefined,
          unreadCount: unreadCountResult[0]?.count || 0,
        })
      }

      return conversationsWithDetails
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw new Error('Failed to fetch conversations')
    }
  }

  async getConversationById(conversationId: string): Promise<ConversationWithDetails | null> {
    try {
      const result = await db
        .select({
          conversation: conversations,
          adopter: users,
          shelter: shelters,
          pet: pets,
        })
        .from(conversations)
        .leftJoin(users, eq(conversations.adopterId, users.id))
        .leftJoin(shelters, eq(conversations.shelterId, shelters.id))
        .leftJoin(pets, eq(conversations.petId, pets.id))
        .where(eq(conversations.id, conversationId))
        .limit(1)

      if (!result[0] || !result[0].conversation || !result[0].adopter || !result[0].shelter) {
        return null
      }

      const conversation = result[0]

      // Get last message
      const lastMessageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(1)

      return {
        ...conversation.conversation,
        adopter: conversation.adopter,
        shelter: conversation.shelter,
        pet: conversation.pet || undefined,
        lastMessage: lastMessageResult[0] || undefined,
        unreadCount: 0, // Will be calculated based on current user
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      throw new Error('Failed to fetch conversation')
    }
  }

  async getMessagesForConversation(conversationId: string, limit = 50): Promise<MessageWithSender[]> {
    try {
      const results = await db
        .select({
          message: messages,
          sender: users,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)

      return results
        .filter(result => result.message && result.sender)
        .map(result => ({
          ...result.message!,
          sender: result.sender!,
        }))
        .reverse() // Show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw new Error('Failed to fetch messages')
    }
  }

  async createConversation(data: {
    adopterId: string
    shelterId: string
    petId?: string
    initialMessage: string
  }): Promise<ConversationWithDetails> {
    try {
      // Check if conversation already exists
      let existingConversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.adopterId, data.adopterId),
            eq(conversations.shelterId, data.shelterId),
            data.petId ? eq(conversations.petId, data.petId) : sql`pet_id IS NULL`
          )
        )
        .limit(1)

      let conversation: Conversation

      if (existingConversation.length > 0) {
        conversation = existingConversation[0]
      } else {
        // Create new conversation
        const newConversationData: NewConversation = {
          adopterId: data.adopterId,
          shelterId: data.shelterId,
          petId: data.petId || null,
        }

        const newConversations = await db
          .insert(conversations)
          .values(newConversationData)
          .returning()

        conversation = newConversations[0]
      }

      // Create initial message
      await this.sendMessage({
        conversationId: conversation.id,
        senderId: data.adopterId,
        content: data.initialMessage,
      })

      // Return conversation with details
      const conversationWithDetails = await this.getConversationById(conversation.id)
      if (!conversationWithDetails) {
        throw new Error('Failed to retrieve created conversation')
      }

      return conversationWithDetails
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw new Error('Failed to create conversation')
    }
  }

  async sendMessage(data: {
    conversationId: string
    senderId: string
    content: string
  }): Promise<MessageWithSender> {
    try {
      const newMessageData: NewMessage = {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      }

      const newMessages = await db
        .insert(messages)
        .values(newMessageData)
        .returning()

      const message = newMessages[0]

      // Get sender details
      const senderResult = await db
        .select()
        .from(users)
        .where(eq(users.id, data.senderId))
        .limit(1)

      if (!senderResult[0]) {
        throw new Error('Sender not found')
      }

      return {
        ...message,
        sender: senderResult[0],
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Mark messages as read that were NOT sent by the current user
      await db
        .update(messages)
        .set({
          status: 'read',
          readAt: new Date(),
        })
        .where(
          and(
            eq(messages.conversationId, conversationId),
            ne(messages.senderId, userId), // Mark messages NOT sent by the current user
            eq(messages.status, 'sent')
          )
        )
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw new Error('Failed to mark messages as read')
    }
  }

  async getUnreadMessageCount(userId: string, userRole: 'adopter' | 'shelter'): Promise<number> {
    try {
      let whereCondition
      if (userRole === 'adopter') {
        whereCondition = eq(conversations.adopterId, userId)
      } else {
        whereCondition = eq(conversations.shelterId, userId)
      }

      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .leftJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(messages.status, 'sent'),
            ne(messages.senderId, userId), // Messages NOT sent by current user
            whereCondition
          )
        )

      return result[0]?.count || 0
    } catch (error) {
      console.error('Error getting unread message count:', error)
      return 0
    }
  }
}

export const messagingService = new MessagingService()