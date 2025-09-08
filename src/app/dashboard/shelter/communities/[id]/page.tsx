"use client"

import { useState } from "react"
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
import { Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign, Users, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock community data
const communityData: { [key: string]: any } = {
  "1": {
    id: 1,
    name: "Dog Lovers",
    description: "A community for dog enthusiasts in Penang",
    members: 247,
    tags: ["Dogs"],
  },
  "2": {
    id: 2,
    name: "Cat Rescue",
    description: "Dedicated to rescuing and rehoming cats in Penang",
    members: 147,
    tags: ["Cats", "Rescue"],
  },
  "3": {
    id: 3,
    name: "Exotic Pet Enthusiasts",
    description: "For owners and lovers of exotic pets",
    members: 247,
    tags: ["Pets", "Birds", "Reptiles"],
  },
}

// Mock posts data
const mockPosts = [
  {
    id: 1,
    title: "Multiple Stray Cats Spotted in Bayan Lepas Area!",
    content:
      "This morning, I noticed a group of about 5-6 stray cats roaming near the food court along Jalan Mahsuri in Bayan Lepas. Most of them look quite young and seem to be in need of food and shelter. A few appeared to be limping or underweight.\n\nIf anyone is from this area and interested in helping, perhaps we could coordinate feeding efforts or alert local animal welfare groups.",
    author: {
      name: "Me Lsg",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "ML",
    },
    timestamp: "May 3, 2025",
    type: "help",
    likes: 12,
    comments: 8,
    shares: 3,
    isLiked: false,
  },
  {
    id: 2,
    title: "Success Story: Buddy Found His Forever Home!",
    content:
      "I'm so happy to share that Buddy, the golden retriever we rescued last month, has found his perfect family! The adoption process went smoothly and his new family is absolutely wonderful. Thank you to everyone who shared his story and helped spread the word.",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SC",
    },
    timestamp: "May 2, 2025",
    type: "success",
    likes: 45,
    comments: 23,
    shares: 12,
    isLiked: true,
  },
  {
    id: 3,
    title: "Pet Care Workshop This Weekend",
    content:
      "Join us for a comprehensive pet care workshop covering basic health checks, grooming tips, and emergency first aid. Perfect for new pet owners or anyone wanting to learn more about proper pet care.",
    author: {
      name: "Dr. Ahmad",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DA",
    },
    timestamp: "May 1, 2025",
    type: "event",
    likes: 28,
    comments: 15,
    shares: 8,
    isLiked: false,
    eventDetails: {
      date: "May 8, 2025",
      time: "2:00 PM - 5:00 PM",
      location: "Penang SPCA Center",
      fee: "Free",
    },
  },
]

export default function CommunityPostsPage() {
  const params = useParams()
  const communityId = params.id as string
  const community = communityData[communityId]

  const [posts, setPosts] = useState(mockPosts)
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
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    const post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "YU",
      },
      timestamp: "Just now",
      type: newPost.type,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    }

    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", type: "general" })
    setIsNewPostOpen(false)
  }

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.content.trim()) return

    const event = {
      id: posts.length + 1,
      title: newEvent.title,
      content: newEvent.content,
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "YU",
      },
      timestamp: "Just now",
      type: "event",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      eventDetails: {
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        fee: newEvent.fee || "Free",
      },
    }

    setPosts([event, ...posts])
    setNewEvent({ title: "", content: "", date: "", time: "", location: "", fee: "" })
    setIsNewEventOpen(false)
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "help":
        return "bg-red-100 text-red-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-blue-100 text-blue-800"
      case "question":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "help":
        return "Help Needed"
      case "success":
        return "Success Story"
      case "event":
        return "Event"
      case "question":
        return "Question"
      default:
        return "General"
    }
  }

  if (!community) {
    return <div>Community not found</div>
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/communities">
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
            {community.members} members
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
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
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600" onClick={handleCreatePost}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
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
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600" onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author.name}</span>
                      <Badge className={`text-xs ${getPostTypeColor(post.type)}`}>{getPostTypeLabel(post.type)}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700">
                  View Discussion
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-3">{post.title}</h3>
              <div className="text-gray-700 mb-4 whitespace-pre-line leading-relaxed">{post.content}</div>

              {/* Event Details */}
              {post.type === "event" && post.eventDetails && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Event Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      {post.eventDetails.date} at {post.eventDetails.time}
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <MapPin className="h-4 w-4" />
                      {post.eventDetails.location}
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                      {post.eventDetails.fee}
                    </div>
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    post.isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                  {post.shares}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
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
