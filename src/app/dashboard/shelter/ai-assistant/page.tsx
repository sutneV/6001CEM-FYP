"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, Building, Paperclip, Smile, MoreVertical, Plus, MessageSquare, Trash2, PanelLeftOpen, PanelLeftClose, X, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  images?: string[]
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function ShelterAIAssistantPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
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
          timestamp: new Date(msg.createdAt),
          images: msg.images
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
    if ((!newMessage.trim() && selectedImages.length === 0) || !currentChat || !user) return

    const messageContent = newMessage
    const messageImages = [...selectedImages]
    setNewMessage("")
    setSelectedImages([])

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
      images: messageImages.length > 0 ? messageImages : undefined
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
          content: messageContent,
          images: messageImages.length > 0 ? messageImages : undefined
        }),
      })
    } catch (error) {
      console.error('Error saving user message:', error)
    }

    // Create placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date()
    }

    // Add empty AI message to start streaming into
    setChatHistories(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, aiMessage],
            updatedAt: new Date()
          }
        : chat
    ))

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
        images: msg.images
      }))

      // Call the streaming AI assistant API
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          images: messageImages.length > 0 ? messageImages : undefined,
          userRole: 'shelter',
          conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiMessageContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          aiMessageContent += chunk

          // Update the AI message with streaming content
          setChatHistories(prev => prev.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: aiMessageContent }
                      : msg
                  ),
                  updatedAt: new Date()
                }
              : chat
          ))
        }
      }

      // Save complete AI message to database
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

      // Update the placeholder message with error
      setChatHistories(prev => prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }
                  : msg
              ),
              updatedAt: new Date()
            }
          : chat
      ))
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return

    const fileArray = Array.from(files)

    // Limit to 4 images total
    const remainingSlots = 4 - selectedImages.length
    const filesToProcess = fileArray.slice(0, remainingSlots)

    // Upload images to Supabase Storage
    for (const file of filesToProcess) {
      if (file.type.startsWith('image/')) {
        try {
          // Upload to Supabase Storage
          const fileExt = file.name.split('.').pop()
          const fileName = `chat-${user.id}-${Date.now()}.${fileExt}`
          const formData = new FormData()
          formData.append('file', file)
          formData.append('fileName', fileName)
          formData.append('bucket', 'ai-chat-images')

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'x-user-data': JSON.stringify(user),
            },
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            console.error('Failed to upload image:', errorData)
            alert(`Failed to upload image: ${errorData.error || 'Unknown error'}`)
            continue
          }

          const { url } = await uploadResponse.json()
          setSelectedImages(prev => [...prev, url])
        } catch (error) {
          console.error('Error uploading image:', error)
        }
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
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
                <p className="text-sm text-gray-600">Shelter management helper</p>
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
                      <Building className="h-4 w-4" />
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
                  {/* Display images if present */}
                  {message.images && message.images.length > 0 && (
                    <div className="mb-2 flex gap-2 flex-wrap">
                      {message.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Attachment ${imgIndex + 1}`}
                          className="max-w-xs rounded-lg border-2 border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {message.sender === 'ai' ? (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-teal-600 prose-code:text-teal-600 prose-pre:bg-gray-100">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <>
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </>
                  )}
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


            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="mb-3 flex gap-2 flex-wrap">
              {selectedImages.map((image, index) => (
                <div key={`img-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

        <div className="flex items-end space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            className="mb-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedImages.length >= 4}
            title="Upload images"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-end bg-gray-50 rounded-lg border border-gray-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Input
                placeholder="Ask me about shelter management..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
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
            disabled={!newMessage.trim() && selectedImages.length === 0}
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
            onClick={() => setNewMessage("How can I improve our adoption process?")}
          >
            Improve adoption process
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("Best practices for volunteer management?")}
          >
            Volunteer management
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("Fundraising ideas for our shelter?")}
          >
            Fundraising ideas
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setNewMessage("How to create effective pet profiles?")}
          >
            Pet profile tips
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}