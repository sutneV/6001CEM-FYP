"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Paperclip, Smile, MoreVertical, Plus, MessageSquare, Trash2, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function AIAssistantPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chatHistories.find(chat => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/ai-chat', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) throw new Error('Failed to load conversations')

      const data = await response.json()
      const formattedConversations = data.conversations.map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        messages: conv.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt)
        })),
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }))

      setChatHistories(formattedConversations)

      // Set current chat to the first one if available, or create one if none exist
      if (formattedConversations.length > 0) {
        setCurrentChatId(formattedConversations[0].id)
        setLoading(false)
      } else {
        // Create initial conversation if none exist
        await createNewChatOnLoad()
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      // Create initial conversation on error
      await createNewChatOnLoad()
    }
  }

  const createNewChatOnLoad = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ title: 'New Chat' }),
      })

      if (!response.ok) throw new Error('Failed to create conversation')

      const data = await response.json()
      const newChat: ChatHistory = {
        id: data.conversation.id,
        title: data.conversation.title,
        messages: data.conversation.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt)
        })),
        createdAt: new Date(data.conversation.createdAt),
        updatedAt: new Date(data.conversation.updatedAt)
      }

      setChatHistories([newChat])
      setCurrentChatId(newChat.id)
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewChat = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ title: 'New Chat' }),
      })

      if (!response.ok) throw new Error('Failed to create conversation')

      const data = await response.json()
      const newChat: ChatHistory = {
        id: data.conversation.id,
        title: data.conversation.title,
        messages: data.conversation.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.createdAt)
        })),
        createdAt: new Date(data.conversation.createdAt),
        updatedAt: new Date(data.conversation.updatedAt)
      }

      setChatHistories(prev => [newChat, ...prev])
      setCurrentChatId(newChat.id)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (chatHistories.length <= 1) return // Don't allow deleting the last chat
    if (!user) return

    try {
      const response = await fetch(`/api/ai-chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      setChatHistories(prev => prev.filter(chat => chat.id !== chatId))

      if (currentChatId === chatId) {
        // Switch to the first available chat
        const remainingChats = chatHistories.filter(chat => chat.id !== chatId)
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id)
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const updateChatTitle = async (chatId: string, firstUserMessage: string) => {
    if (!user) return

    const title = firstUserMessage.length > 30
      ? firstUserMessage.substring(0, 30) + '...'
      : firstUserMessage

    try {
      const response = await fetch(`/api/ai-chat/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) throw new Error('Failed to update title')

      setChatHistories(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title, updatedAt: new Date() }
          : chat
      ))
    } catch (error) {
      console.error('Error updating title:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !user) return

    const messageContent = newMessage
    setNewMessage("")
    setIsTyping(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    }

    // Update the current chat with the new message (optimistic update)
    setChatHistories(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, userMessage],
            updatedAt: new Date()
          }
        : chat
    ))

    // Update chat title if this is the first user message
    if (currentChat.messages.length === 1 && currentChat.title === 'New Chat') {
      updateChatTitle(currentChatId!, messageContent)
    }

    // Save user message to database
    try {
      await fetch(`/api/ai-chat/${currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          sender: 'user',
          content: messageContent
        }),
      })
    } catch (error) {
      console.error('Error saving user message:', error)
    }

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      // Call the RAG-enabled AI assistant API
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          userRole: 'adopter', // Adopter role for this dashboard
          conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const aiMessageContent = data.response || "Sorry, I couldn't generate a response at this time."

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiMessageContent,
        sender: 'ai',
        timestamp: new Date()
      }

      setChatHistories(prev => prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date()
            }
          : chat
      ))

      // Save AI message to database
      try {
        await fetch(`/api/ai-chat/${currentChatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-data': JSON.stringify(user),
          },
          body: JSON.stringify({
            sender: 'ai',
            content: aiMessageContent
          }),
        })
      } catch (error) {
        console.error('Error saving AI message:', error)
      }

    } catch (error) {
      console.error('Error getting AI response:', error)

      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      }

      setChatHistories(prev => prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, errorMessage],
              updatedAt: new Date()
            }
          : chat
      ))
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="w-80 bg-white border-r border-gray-200 flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Chat History</h3>
              <Button onClick={createNewChat} size="sm" className="bg-teal-500 hover:bg-teal-600">
                <Plus className="h-4 w-4 mr-1" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Chat History List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chatHistories.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ x: 2 }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? "bg-teal-50 border border-teal-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    {chatHistories.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-900"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-teal-100 text-teal-600">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Pet adoption and care helper</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.sender === 'ai' ? (
                    <AvatarFallback className="bg-teal-100 text-teal-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? "bg-teal-500 text-white rounded-br-md"
                      : "bg-white border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? "text-teal-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-xs lg:max-w-md">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-teal-100 text-teal-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <Button variant="ghost" size="sm" className="mb-1">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-end bg-gray-50 rounded-lg border border-gray-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Input
                placeholder="Ask me anything about pet adoption..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isTyping}
              />
              <div className="flex items-end p-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-teal-500 hover:bg-teal-600 text-white"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("What's the best pet for a small apartment?")}
          >
            Best pets for apartments
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("How do I prepare for pet adoption?")}
          >
            Adoption preparation
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("What are the costs of pet ownership?")}
          >
            Pet ownership costs
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}