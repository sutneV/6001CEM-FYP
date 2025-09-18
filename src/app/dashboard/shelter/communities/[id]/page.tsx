"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign, Users, ArrowLeft, Plus, Loader2, Send, Settings, Crown, UserMinus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCommunities, type Community } from "@/hooks/useCommunities"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import MapLocationPicker from "@/components/MapLocationPicker"

export default function CommunityPostsPage() {
  const params = useParams()
  const communityId = params.id as string
  const { user } = useAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  const [posts, setPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [userEventParticipation, setUserEventParticipation] = useState<{[eventId: string]: boolean}>({})
  const [isNewPostOpen, setIsNewPostOpen] = useState(false)
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "general",
  })
  const [newEvent, setNewEvent] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    fee: "",
  })
  const [postComments, setPostComments] = useState<{[postId: string]: any[]}>({}) 
  const [postLikeStates, setPostLikeStates] = useState<{[postId: string]: {isLiked: boolean, count: number}}>({})
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({})
  const [newComment, setNewComment] = useState<{[postId: string]: string}>({})
  const [commentsLoading, setCommentsLoading] = useState<{[postId: string]: boolean}>({})

  // Member management states
  const [members, setMembers] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  const handleJoinCommunity = async () => {
    if (!user) return

    try {
      setJoining(true)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers,
      })

      const data = await response.json()

      if (data.success) {
        // Update community state to reflect membership
        setCommunity(prev => prev ? {
          ...prev,
          isMember: true,
          memberCount: prev.memberCount + 1
        } : null)

        toast.success('Successfully joined the community!')
      } else {
        throw new Error(data.error || 'Failed to join community')
      }
    } catch (error) {
      console.error('Error joining community:', error)
      toast.error('Failed to join community')
    } finally {
      setJoining(false)
    }
  }

  const fetchMembers = async () => {
    if (!(community?.isOwner || (community?.ownerId && user?.id === community.ownerId))) return

    try {
      setMembersLoading(true)

      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/members`, {
        headers,
      })

      const data = await response.json()

      if (data.success) {
        setMembers(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch members')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
    } finally {
      setMembersLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!(community?.isOwner || (community?.ownerId && user?.id === community.ownerId)) || !confirm('Are you sure you want to remove this member?')) return

    try {
      setRemovingMember(memberId)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/members/${memberId}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (data.success) {
        // Remove member from list
        setMembers(prev => prev.filter(member => member.id !== memberId))

        // Update community member count
        setCommunity(prev => prev ? {
          ...prev,
          memberCount: prev.memberCount - 1
        } : null)

        toast.success('Member removed successfully')
      } else {
        throw new Error(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
    } finally {
      setRemovingMember(null)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const currentState = postLikeStates[postId]
      const isCurrentlyLiked = currentState?.isLiked || false
      const method = isCurrentlyLiked ? 'DELETE' : 'POST'
      
      console.log(`Attempting to ${method === 'POST' ? 'like' : 'unlike'} post ${postId}. Current state: ${isCurrentlyLiked}`)
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const requestUrl = `/api/communities/${communityId}/posts/${postId}/likes`
      console.log('Making request to:', requestUrl)
      console.log('Request method:', method)
      console.log('Request headers:', headers)

      let response
      try {
        response = await fetch(requestUrl, {
          method,
          headers,
        })
        console.log('Fetch completed successfully')
      } catch (fetchError) {
        console.error('Fetch failed:', fetchError)
        throw new Error(`Network error: ${fetchError.message}`)
      }

      console.log('API response status:', response.status)
      console.log('API response ok:', response.ok)
      console.log('API response statusText:', response.statusText)
      
      let data
      try {
        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        console.log('Raw response length:', responseText.length)
        
        if (responseText.trim() === '') {
          console.error('Empty response received')
          throw new Error('Empty response from server')
        }
        
        data = JSON.parse(responseText)
        console.log('Parsed API response data:', data)
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        console.error('Response text that failed to parse:', responseText)
        throw new Error(`Invalid JSON response: ${parseError.message}`)
      }

      if (data.success) {
        console.log('Like API success response:', data)
        // Update like state
        setPostLikeStates(prev => ({
          ...prev,
          [postId]: {
            isLiked: data.data.liked,
            count: data.data.likesCount
          }
        }))
        
        // Update posts array for immediate UI feedback
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: data.data.likesCount }
            : post
        ))
      } else {
        // Log the error and show user-friendly message
        console.error('Like operation failed:', data.error)
        toast.error(data.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to toggle like')
    }
  }

  const toggleComments = async (postId: string) => {
    const isCurrentlyShowing = showComments[postId]
    
    if (isCurrentlyShowing) {
      // Hide comments
      setShowComments(prev => ({ ...prev, [postId]: false }))
    } else {
      // Show comments and fetch them if not already loaded
      setShowComments(prev => ({ ...prev, [postId]: true }))
      
      if (!postComments[postId]) {
        await fetchComments(postId)
      }
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }))
      
      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`, {
        headers,
      })

      const data = await response.json()

      if (data.success) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data.data
        }))
      } else {
        throw new Error(data.error || 'Failed to fetch comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim()
    if (!content || !user) return

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (data.success) {
        // Add new comment to the comments list
        setPostComments(prev => ({
          ...prev,
          [postId]: [data.data.comment, ...(prev[postId] || [])]
        }))
        
        // Update comment count in posts
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: data.data.commentsCount }
            : post
        ))
        
        // Clear input
        setNewComment(prev => ({ ...prev, [postId]: '' }))
      } else {
        throw new Error(data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          type: mapTypeToDbType(newPost.type),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add the new post to the beginning of the posts array
        setPosts([data.data, ...posts])
        
        // Initialize like state for the new post
        setPostLikeStates(prev => ({
          ...prev,
          [data.data.id]: {
            isLiked: false,
            count: 0
          }
        }))
        
        setNewPost({ title: "", content: "", type: "general" })
        setIsNewPostOpen(false)
        toast.success('Post created successfully!')
      } else {
        throw new Error(data.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.content.trim() || !newEvent.date.trim() || !newEvent.location.trim()) return

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.content,
          eventDate: newEvent.date,
          eventTime: newEvent.time,
          location: newEvent.location,
          latitude: newEvent.latitude,
          longitude: newEvent.longitude,
          fee: newEvent.fee || 'Free',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add the new event to the events list
        setEvents([data.data, ...events])
        setNewEvent({ title: "", content: "", date: "", time: "", location: "", latitude: null, longitude: null, fee: "" })
        setIsNewEventOpen(false)
        toast.success('Event created successfully!')
      } else {
        throw new Error(data.error || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    }
  }

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string }) => {
    setNewEvent({
      ...newEvent,
      latitude: location.latitude,
      longitude: location.longitude,
      location: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    })
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const isCurrentlyJoined = userEventParticipation[eventId]
      const method = isCurrentlyJoined ? 'DELETE' : 'POST'
      const response = await fetch(`/api/communities/${communityId}/events/${eventId}/join`, {
        method,
        headers,
      })

      const data = await response.json()

      if (data.success) {
        // Update participation status
        setUserEventParticipation(prev => ({
          ...prev,
          [eventId]: !isCurrentlyJoined
        }))

        // Update the event's participant count in the events list
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? {
                ...event, 
                currentParticipants: isCurrentlyJoined 
                  ? event.currentParticipants - 1 
                  : event.currentParticipants + 1
              }
            : event
        ))

        toast.success(isCurrentlyJoined ? 'Left event successfully!' : 'Joined event successfully!')
      } else {
        throw new Error(data.error || 'Failed to update event participation')
      }
    } catch (error) {
      console.error('Error updating event participation:', error)
      toast.error('Failed to update event participation')
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-50 text-blue-800"
      case "image":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Discussion"
      case "image":
        return "Image"
      case "event":
        return "Event"
      default:
        return "Discussion"
    }
  }

  // Map user-friendly types to database types
  const mapTypeToDbType = (uiType: string) => {
    switch (uiType) {
      case "general":
      case "help":
      case "success":
      case "question":
        return "text"
      case "image":
        return "image"
      case "event":
        return "event"
      default:
        return "text"
    }
  }

  // Map database types back to user-friendly labels for display
  const getDisplayTypeLabel = (dbType: string, originalType?: string) => {
    // If we have the original type stored, use it for better display
    if (originalType) {
      switch (originalType) {
        case "general": return "General"
        case "help": return "Help Needed"
        case "success": return "Success Story"
        case "question": return "Question"
        case "image": return "Image"
        case "event": return "Event"
        default: return "Discussion"
      }
    }
    
    // Fallback to database type
    return getPostTypeLabel(dbType)
  }

  const getDisplayTypeColor = (dbType: string, originalType?: string) => {
    if (originalType) {
      switch (originalType) {
        case "help": return "bg-red-100 text-red-800"
        case "success": return "bg-green-100 text-green-800"
        case "question": return "bg-yellow-100 text-yellow-800"
        case "general": return "bg-gray-100 text-gray-800"
        case "image": return "bg-green-100 text-green-800"
        case "event": return "bg-blue-100 text-blue-800"
        default: return "bg-gray-100 text-gray-800"
      }
    }
    return getPostTypeColor(dbType)
  }

  const fetchPosts = async () => {
    try {
      setPostsLoading(true)
      
      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        headers,
      })

      const data = await response.json()

      if (data.success) {
        setPosts(data.data)
        
        // Initialize like states for all posts using API data
        const likeStates: {[postId: string]: {isLiked: boolean, count: number}} = {}
        data.data.forEach((post: any) => {
          likeStates[post.id] = {
            isLiked: post.isLikedByUser || false,
            count: post.likesCount || 0
          }
        })
        setPostLikeStates(likeStates)
      } else {
        console.error('Failed to fetch posts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      
      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}/events`, {
        headers,
      })

      const data = await response.json()

      if (data.success) {
        setEvents(data.data)
        
        // Initialize participation status from API data
        const participationStatus: {[eventId: string]: boolean} = {}
        data.data.forEach((event: any) => {
          participationStatus[event.id] = event.isUserParticipant || false
        })
        setUserEventParticipation(participationStatus)
      } else {
        console.error('Failed to fetch events:', data.error)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true)
        
        const headers: HeadersInit = {}
        if (user) {
          headers['x-user-id'] = user.id
          headers['x-user-role'] = user.role
        }

        const response = await fetch(`/api/communities/${communityId}`, {
          headers,
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const responseText = await response.text()
        console.log('Raw API response:', responseText)

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError)
          console.error('Response was:', responseText)
          throw new Error('Invalid JSON response from server')
        }

        if (data.success) {
          console.log('Community data:', data.data) // Debug log
          console.log('Current user:', user) // Debug log
          setCommunity(data.data)
          // Only fetch posts and events if user is a member
          if (data.data.isMember) {
            await Promise.all([fetchPosts(), fetchEvents()])
          }
        } else {
          throw new Error(data.error || 'Failed to fetch community')
        }
      } catch (error) {
        console.error('Error fetching community:', error)
        toast.error('Failed to load community')
      } finally {
        setLoading(false)
      }
    }

    if (communityId) {
      fetchCommunity()
    }
  }, [communityId, user])

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading community...</span>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Community not found</p>
          <Link href="/dashboard/shelter/communities">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show join prompt for non-members
  if (!community.isMember) {
    return (
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/shelter/communities">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communities
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Join Community</h1>
              <p className="text-gray-600">You need to be a member to view this community's content</p>
            </div>
          </div>
        </div>

        {/* Community Info Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <h2 className="text-xl font-semibold mb-2">{community.name}</h2>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.memberCount} members
              </div>
              <Badge variant="secondary">{community.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-6">
              This community is for members only. Join to access posts, events, and discussions.
            </p>
            <Button
              onClick={handleJoinCommunity}
              disabled={joining || !user}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8"
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Join Community
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shelter/communities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Community Posts</h1>
            <p className="text-gray-600">Join the discussion with other community members</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-medium">{community.name}'s Posts</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Users className="h-4 w-4" />
            {community.memberCount} members
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        {/* Community Management Button (Owner Only) */}
        {(community?.isOwner || (community?.ownerId && user?.id === community.ownerId)) && (
          <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={fetchMembers}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Manage Community Members
                </DialogTitle>
                <DialogDescription>
                  View and manage members of {community.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading members...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {members.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No members found
                      </div>
                    ) : (
                      members.map((member) => {
                        const memberName = `${member.firstName} ${member.lastName}`
                        const memberInitials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()
                        const joinedDate = new Date(member.joinedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })

                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>{memberInitials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{memberName}</span>
                                  {member.role === 'shelter' && (
                                    <Badge variant="secondary" className="text-xs">
                                      Shelter
                                    </Badge>
                                  )}
                                  {member.id === community.ownerId && (
                                    <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Owner
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  Joined {joinedDate}
                                </span>
                              </div>
                            </div>
                            {member.id !== community.ownerId && member.id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={removingMember === member.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {removingMember === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserMinus className="h-4 w-4 mr-1" />
                                    Remove
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Total: {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                  <Button variant="outline" onClick={() => setIsMembersOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Share something with the {community.name} community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-title">Post Title</Label>
                <Input
                  id="post-title"
                  placeholder="What's your post about?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="post-type">Post Type</Label>
                <Select value={newPost.type} onValueChange={(value) => setNewPost({ ...newPost, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Discussion</SelectItem>
                    <SelectItem value="help">Help Needed</SelectItem>
                    <SelectItem value="success">Success Story</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts, experiences, or ask for help..."
                  className="min-h-32"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsNewPostOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={handleCreatePost}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Organize an event for the {community.name} community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  placeholder="What's your event called?"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Map Location Picker */}
              <div>
                <Label>Event Location</Label>
                <MapLocationPicker 
                  onLocationSelect={handleLocationSelect}
                  height="300px"
                  className="mt-2"
                />
              </div>
              
              {/* Manual Location Input (fallback) */}
              <div>
                <Label htmlFor="event-location">Location (Manual Entry)</Label>
                <Input
                  id="event-location"
                  placeholder="You can also type the address manually"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="event-fee">Fee (optional)</Label>
                <Input
                  id="event-fee"
                  placeholder="e.g., RM 20 or Free"
                  value={newEvent.fee}
                  onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-content">Event Description</Label>
                <Textarea
                  id="event-content"
                  placeholder="Describe your event, what to expect, what to bring..."
                  className="min-h-32"
                  value={newEvent.content}
                  onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsNewEventOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts and Events Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          {postsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading posts...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts yet in this community</p>
              <p className="text-sm text-gray-400">Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => {
              const authorName = `${post.author.firstName} ${post.author.lastName}`
              const authorInitials = `${post.author.firstName?.[0] || ''}${post.author.lastName?.[0] || ''}`.toUpperCase()
              const timestamp = new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
              
              return (
            <Card key={post.id} className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{authorName}</span>
                        <Badge className={`text-xs ${getPostTypeColor(post.type)}`}>{getPostTypeLabel(post.type)}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">{timestamp}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                    View Discussion
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-3">{post.title}</h3>
                <div className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed">{post.content}</div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      postLikeStates[post.id]?.isLiked 
                        ? 'text-red-600' 
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${postLikeStates[post.id]?.isLiked ? 'fill-current' : ''}`} />
                    {postLikeStates[post.id]?.count || post.likesCount || 0}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.commentsCount || 0}
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                    0
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                    {/* Add Comment Input */}
                    <div className="flex gap-3 mb-4">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ 
                            ...prev, 
                            [post.id]: e.target.value 
                          }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="bg-teal-500 hover:bg-teal-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {commentsLoading[post.id] ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading comments...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(postComments[post.id] || []).map((comment) => {
                          const commentAuthorName = `${comment.author.firstName} ${comment.author.lastName}`
                          const commentAuthorInitials = `${comment.author.firstName?.[0] || ''}${comment.author.lastName?.[0] || ''}`.toUpperCase()
                          const commentTimestamp = new Date(comment.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          
                          return (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-7 w-7 flex-shrink-0">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="text-xs">{commentAuthorInitials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{commentAuthorName}</span>
                                  <span className="text-xs text-gray-500">{commentTimestamp}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                              </div>
                            </div>
                          )
                        })}
                        
                        {(postComments[post.id] || []).length === 0 && !commentsLoading[post.id] && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">No comments yet</p>
                            <p className="text-xs text-gray-400">Be the first to comment!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading events...</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No events yet in this community</p>
              <p className="text-sm text-gray-400">Be the first to create an event!</p>
            </div>
          ) : (
            events.map((event) => {
              const organizerName = `${event.organizer.firstName} ${event.organizer.lastName}`
              const organizerInitials = `${event.organizer.firstName?.[0] || ''}${event.organizer.lastName?.[0] || ''}`.toUpperCase()
              const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
              const createdAt = new Date(event.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
              
              return (
            <Card key={event.id} className="border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{organizerInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{organizerName}</span>
                        <Badge className="text-xs bg-blue-100 text-blue-800">Event</Badge>
                      </div>
                      <span className="text-sm text-gray-500">Created {createdAt}</span>
                    </div>
                  </div>
                  {user && event.organizer.id !== user.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-teal-600 hover:text-teal-700"
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      {userEventParticipation[event.id] ? 'Leave Event' : 'Join Event'}
                    </Button>
                  )}
                  {user && event.organizer.id === user.id && (
                    <Badge className="bg-green-100 text-green-800">
                      Organizer
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
                <div className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed">{event.description}</div>
                
                {/* Event Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">Date:</span>
                    <span>{eventDate}</span>
                    {event.eventTime && <span>at {event.eventTime}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">Location:</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">Fee:</span>
                    <span>{event.fee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">Participants:</span>
                    <span>{event.currentParticipants}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
                  </div>
                </div>

                {/* Event Actions */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  {user && event.organizer.id !== user.id && (
                    <Button 
                      size="sm" 
                      className={userEventParticipation[event.id] 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-teal-500 hover:bg-teal-600"
                      }
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {userEventParticipation[event.id] ? 'Leave Event' : 'Join Event'}
                    </Button>
                  )}
                  {user && event.organizer.id === user.id && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">You are the organizer</span>
                    </div>
                  )}
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </CardContent>
            </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}