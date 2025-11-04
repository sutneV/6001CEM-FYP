"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { supabase } from "@/lib/db/config"

interface ConversationWithDetails {
  id: string
  adopterId: string
  shelterId: string
  petId?: string
  status: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  adopter: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  shelter: {
    id: string
    name: string
    userId: string
  }
  pet?: {
    id: string
    name: string
    images?: string[]
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
  }
  unreadCount: number
}

interface MessageWithSender {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: string
  readAt?: string
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export default function MessagesInterface() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileConversations, setShowMobileConversations] = useState(false)
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return

    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [user])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    const messageContent = newMessage
    setNewMessage("")

    try {
      setSendingMessage(true)
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: messageContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Optimistically add message to UI (Realtime will handle it for the other user)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.message.id)
        if (exists) return prev
        return [...prev, data.message]
      })

      // Update conversation list locally without refetching
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: {
                id: data.message.id,
                content: messageContent,
                createdAt: data.message.createdAt
              },
              lastMessageAt: data.message.createdAt,
              updatedAt: data.message.createdAt
            }
          : conv
      ).sort((a, b) => {
        const aTime = new Date(a.lastMessageAt || a.createdAt).getTime()
        const bTime = new Date(b.lastMessageAt || b.createdAt).getTime()
        return bTime - aTime
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      // Restore the message input on error
      setNewMessage(messageContent)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversation(conversationId)
    fetchMessages(conversationId)
    setShowMobileConversations(false)
    
    // Immediately update the unread count in the UI
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ))
    
    // Mark messages as read on server
    if (user) {
      try {
        await fetch('/api/messages/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-data': JSON.stringify(user),
          },
          body: JSON.stringify({
            conversationId,
          }),
        })
      } catch (error) {
        console.error('Error marking messages as read:', error)
        // Revert the unread count if the API call failed
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: prev.find(c => c.id === conversationId)?.unreadCount || 0 }
            : conv
        ))
      }
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedConversation || !user) return

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        async (payload) => {
          const newMessage = payload.new as any

          // Fetch sender details for the new message
          try {
            const response = await fetch(`/api/users/${newMessage.sender_id}`, {
              headers: {
                'x-user-data': JSON.stringify(user),
              },
            })

            if (response.ok) {
              const userData = await response.json()
              const formattedMessage: MessageWithSender = {
                id: newMessage.id,
                conversationId: newMessage.conversation_id,
                senderId: newMessage.sender_id,
                content: newMessage.content,
                status: newMessage.status,
                readAt: newMessage.read_at,
                createdAt: newMessage.created_at,
                updatedAt: newMessage.updated_at,
                sender: userData.user
              }

              // Only add if not already in messages (avoid duplicates from optimistic updates)
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === formattedMessage.id)
                if (exists) return prev
                return [...prev, formattedMessage]
              })

              // Update conversation list locally without refetching
              setConversations(prev => prev.map(conv =>
                conv.id === selectedConversation
                  ? {
                      ...conv,
                      lastMessage: {
                        id: newMessage.id,
                        content: newMessage.content,
                        createdAt: newMessage.created_at
                      },
                      lastMessageAt: newMessage.created_at,
                      updatedAt: newMessage.created_at,
                      // Increment unread count only if message is from other user and not currently viewing
                      unreadCount: newMessage.sender_id !== user.id ? conv.unreadCount + 1 : 0
                    }
                  : conv
              ).sort((a, b) => {
                const aTime = new Date(a.lastMessageAt || a.createdAt).getTime()
                const bTime = new Date(b.lastMessageAt || b.createdAt).getTime()
                return bTime - aTime
              }))
            }
          } catch (error) {
            console.error('Error fetching sender details:', error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, user])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showEmojiPicker])

  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😊', '😍', '🥰', '😘', '😗', '😙',
    '😚', '🙂', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏',
    '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛',
    '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲',
    '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨',
    '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵',
    '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '😇', '🤠', '🤡', '🥳', '🥺', '🤓', '🧐', '😎', '🤩', '🥸',
    '👍', '👎', '👏', '🙌', '👐', '🤝', '👊', '✊', '🤛', '🤜',
    '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆',
    '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🖕',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✨', '🌟', '💫', '⭐', '🌠', '☄️', '🎉', '🎊', '🎈', '🎁'
  ]

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev)
  }

  const filteredConversations = conversations.filter((conv) => {
    const participantName = user?.role === 'shelter' 
      ? `${conv.adopter.firstName} ${conv.adopter.lastName}`
      : conv.shelter.name
    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)

  const getConversationDisplayData = (conv: ConversationWithDetails) => {
    if (user?.role === 'shelter') {
      return {
        participantName: `${conv.adopter.firstName} ${conv.adopter.lastName}`,
        participantAvatar: (conv.adopter as any).avatar || undefined,
        petName: conv.pet?.name,
        petImage: conv.pet?.images?.[0]
      }
    } else {
      return {
        participantName: conv.shelter.name,
        participantAvatar: (conv as any).shelterUser?.avatar || undefined,
        petName: conv.pet?.name,
        petImage: conv.pet?.images?.[0]
      }
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)}m`
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`
    } else {
      return `${Math.round(diffInHours / 24)}d`
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Mobile Conversations Overlay */}
      {showMobileConversations && (
        <div className="absolute inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Messages</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileConversations(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredConversations.map((conversation) => {
                  const displayData = getConversationDisplayData(conversation)
                  return (
                    <Card
                      key={conversation.id}
                      className={`mb-6 mx-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 border-2 ${
                        selectedConversation === conversation.id 
                          ? "border-teal-500 shadow-lg" 
                          : "border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex space-x-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={displayData.participantAvatar} />
                            <AvatarFallback>
                              {displayData.participantName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-medium text-sm truncate flex-1">{displayData.participantName}</h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                  {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-teal-500 text-white text-xs">{conversation.unreadCount}</Badge>
                                )}
                              </div>
                            </div>
                            {displayData.petName && (
                              <p className="text-xs text-teal-600 font-medium">About {displayData.petName}</p>
                            )}
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Desktop Conversations List */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const displayData = getConversationDisplayData(conversation)
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                      selectedConversation === conversation.id
                        ? "border-teal-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={displayData.participantAvatar} />
                        <AvatarFallback>
                          {displayData.participantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate max-w-[140px]">{displayData.participantName}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {loadingMessages && selectedConversation === conversation.id && (
                              <div className="animate-spin rounded-full h-3 w-3 border border-teal-500 border-t-transparent"></div>
                            )}
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                            </span>
                          </div>
                        </div>
                        {displayData.petName && (
                          <p className="text-xs text-teal-600 font-medium">About {displayData.petName}</p>
                        )}
                        <p className="text-sm text-gray-600 truncate mt-0.5 max-w-[200px]">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-teal-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm">Start a conversation by asking a question about a pet!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowMobileConversations(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getConversationDisplayData(selectedConv).participantAvatar} />
                  <AvatarFallback>
                    {getConversationDisplayData(selectedConv).participantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{getConversationDisplayData(selectedConv).participantName}</h2>
                  {getConversationDisplayData(selectedConv).petName && (
                    <p className="text-sm text-gray-600">Regarding {getConversationDisplayData(selectedConv).petName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.senderId === user?.id
                            ? "bg-teal-500 text-white rounded-br-md"
                            : "bg-white border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user?.id ? "text-teal-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No messages in this conversation yet</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-3">
              <Button variant="ghost" size="sm" className="mb-1">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <div className="flex items-end bg-gray-50 rounded-lg border border-gray-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={sendingMessage || loadingMessages}
                  />
                  <div className="flex items-end p-2 relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={toggleEmojiPicker}
                      type="button"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div 
                        ref={emojiPickerRef}
                        className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-60 overflow-y-auto z-50"
                      >
                        <div className="grid grid-cols-10 gap-2">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="hover:bg-gray-100 rounded p-1 text-lg transition-colors"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                className="bg-teal-500 hover:bg-teal-600 h-11 px-4"
                disabled={!newMessage.trim() || sendingMessage || loadingMessages}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mt-4"
              onClick={() => setShowMobileConversations(true)}
            >
              View Conversations
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}