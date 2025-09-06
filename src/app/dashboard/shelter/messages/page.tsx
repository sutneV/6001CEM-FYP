"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft, Menu } from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "shelter" | "adopter"
  content: string
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  participantName: string
  participantRole: "shelter" | "adopter"
  participantAvatar?: string
  petName?: string
  petImage?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: "active" | "archived"
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileConversations, setShowMobileConversations] = useState(false)

  // Mock data
  const conversations: Conversation[] = [
    {
      id: "1",
      participantName: "Penang Animal Shelter",
      participantRole: "shelter",
      participantAvatar: "/placeholder.svg?height=40&width=40",
      petName: "Buddy",
      petImage: "/placeholder.svg?height=60&width=60",
      lastMessage: "Thank you for your interest in Buddy! We'd love to schedule a meet and greet.",
      lastMessageTime: "2h",
      unreadCount: 2,
      status: "active",
    },
    {
      id: "2",
      participantName: "SPCA Penang",
      participantRole: "shelter",
      participantAvatar: "/placeholder.svg?height=40&width=40",
      petName: "Luna",
      petImage: "/placeholder.svg?height=60&width=60",
      lastMessage: "Your application has been approved! When would you like to visit?",
      lastMessageTime: "1d",
      unreadCount: 0,
      status: "active",
    },
    {
      id: "3",
      participantName: "Furry Friends Rescue",
      participantRole: "shelter",
      participantAvatar: "/placeholder.svg?height=40&width=40",
      petName: "Max",
      petImage: "/placeholder.svg?height=60&width=60",
      lastMessage: "We received your adoption application and will review it shortly.",
      lastMessageTime: "3d",
      unreadCount: 0,
      status: "active",
    },
  ]

  const messages: Message[] = [
    {
      id: "1",
      senderId: "shelter_1",
      senderName: "Penang Animal Shelter",
      senderRole: "shelter",
      content: "Hello! Thank you for your interest in adopting Buddy. We're excited to hear from you!",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "2",
      senderId: "user_1",
      senderName: "You",
      senderRole: "adopter",
      content:
        "Hi! I saw Buddy's profile and I'm very interested in adopting him. Could you tell me more about his temperament?",
      timestamp: "10:45 AM",
      read: true,
    },
    {
      id: "3",
      senderId: "shelter_1",
      senderName: "Penang Animal Shelter",
      senderRole: "shelter",
      content:
        "Buddy is a very gentle and friendly dog. He loves children and gets along well with other pets. He's house-trained and knows basic commands.",
      timestamp: "11:00 AM",
      read: true,
    },
    {
      id: "4",
      senderId: "shelter_1",
      senderName: "Penang Animal Shelter",
      senderRole: "shelter",
      content: "Would you like to schedule a meet and greet this weekend?",
      timestamp: "11:05 AM",
      read: false,
    },
  ]

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.petName?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
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
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`mb-6 mx-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 border-2 ${
                      selectedConversation === conversation.id 
                        ? "border-teal-500 shadow-lg" 
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      setShowMobileConversations(false)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={conversation.participantAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {conversation.participantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-sm truncate flex-1">{conversation.participantName}</h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-teal-500 text-white text-xs">{conversation.unreadCount}</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                  selectedConversation === conversation.id
                    ? "border-teal-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={conversation.participantAvatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {conversation.participantName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate max-w-[140px]">{conversation.participantName}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-0.5 max-w-[200px]">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-teal-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
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
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConv.participantAvatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedConv.participantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedConv.participantName}</h2>
                  <p className="text-sm text-gray-500">Online</p>
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === "adopter" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderRole === "adopter"
                        ? "bg-teal-500 text-white"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${message.senderRole === "adopter" ? "text-teal-100" : "text-gray-500"}`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[40px] max-h-32 resize-none border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                className="bg-teal-500 hover:bg-teal-600 text-white"
                disabled={!newMessage.trim()}
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
          </div>
        </div>
      )}
    </div>
  )
}
