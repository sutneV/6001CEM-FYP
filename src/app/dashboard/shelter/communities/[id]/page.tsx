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
import { Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign, Users, ArrowLeft, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCommunities, type Community } from "@/hooks/useCommunities"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function CommunityPostsPage() {
  const params = useParams()
  const communityId = params.id as string
  const { user } = useAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  const [posts, setPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
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
    fee: "",
  })

  const handleLike = (postId: number) => {
    // TODO: Implement real like functionality with API
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

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.content.trim()) return
    // TODO: Implement event creation with real API
    toast.info('Event creation coming soon!')
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
      } else {
        console.error('Failed to fetch posts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setPostsLoading(false)
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

        const data = await response.json()

        if (data.success) {
          setCommunity(data.data)
          // Fetch posts after community is loaded
          await fetchPosts()
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
          <DialogContent className="max-w-2xl">
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
              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  placeholder="Where will this event take place?"
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

      {/* Posts Feed */}
      <div className="space-y-6">
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
                  onClick={() => {/* TODO: Implement real like functionality */}}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  {post.likesCount}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentsCount}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                  0
                </button>
              </div>
            </CardContent>
          </Card>
            )
          })
        )}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" className="bg-transparent">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}