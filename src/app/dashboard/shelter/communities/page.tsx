"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Calendar, MessageCircle, Heart, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

// Simplified mock data matching the screenshot
const mockCommunities = [
  {
    id: 1,
    name: "Dog Lovers",
    description:
      "A community for dog enthusiasts in Penang. Share tips, organize meetups, and connect with fellow dog lovers!",
    members: 247,
    tags: ["Dogs"],
    isJoined: false,
  },
  {
    id: 2,
    name: "Cat Rescue",
    description: "Dedicated to rescuing and rehoming cats in Penang. Join us in making a difference!",
    members: 147,
    tags: ["Cats", "Rescue"],
    isJoined: false,
  },
  {
    id: 3,
    name: "Exotic Pet Enthusiasts",
    description: "For owners and lovers of exotic pets - birds, reptiles, small mammals and more!",
    members: 247,
    tags: ["Pets", "Birds", "Reptiles"],
    isJoined: false,
  },
]

export default function ShelterCommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("discover")
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([])
  const [isJoining, setIsJoining] = useState(false)

  const filteredCommunities = mockCommunities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleJoinClick = (community: any) => {
    setSelectedCommunity(community)
    setIsJoinDialogOpen(true)
  }

  const handleJoinCommunity = async () => {
    if (!selectedCommunity) return

    setIsJoining(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setJoinedCommunities((prev) => [...prev, selectedCommunity.id])
    setIsJoining(false)
    setIsJoinDialogOpen(false)
    setSelectedCommunity(null)
  }

  const isJoined = (communityId: number) => joinedCommunities.includes(communityId)

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Communities</h1>
          <p className="text-gray-600">Connect with fellow pet lovers and join exciting events</p>
        </div>
        <Dialog open={isCreateCommunityOpen} onOpenChange={setIsCreateCommunityOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">Create Community</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>Start your own pet community and bring people together</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="community-name">Community Name</Label>
                <Input id="community-name" placeholder="Enter community name" />
              </div>
              <div>
                <Label htmlFor="community-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dogs">Dogs</SelectItem>
                    <SelectItem value="cats">Cats</SelectItem>
                    <SelectItem value="birds">Birds</SelectItem>
                    <SelectItem value="exotic">Exotic Pets</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="community-description">Description</Label>
                <Textarea id="community-description" placeholder="Describe your community" />
              </div>
              <Button className="w-full bg-teal-500 hover:bg-teal-600">Create Community</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="dogs">Dogs</SelectItem>
            <SelectItem value="cats">Cats</SelectItem>
            <SelectItem value="exotic">Exotic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-8 mb-8 border-b">
        <button
          onClick={() => setActiveTab("discover")}
          className={`pb-2 px-1 ${
            activeTab === "discover"
              ? "border-b-2 border-teal-500 text-teal-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab("my-communities")}
          className={`pb-2 px-1 ${
            activeTab === "my-communities"
              ? "border-b-2 border-teal-500 text-teal-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Communities
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`pb-2 px-1 ${
            activeTab === "events"
              ? "border-b-2 border-teal-500 text-teal-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Events
        </button>
      </div>

      {/* Communities Grid */}
      {activeTab === "discover" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{community.name}</CardTitle>
                  {isJoined(community.id) ? (
                    <Button size="sm" disabled className="bg-green-500 text-white">
                      <Check className="h-4 w-4 mr-1" />
                      Joined
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                      onClick={() => handleJoinClick(community)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {community.description}
                </CardDescription>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{community.members} members</span>
                  <div className="flex gap-1">
                    {community.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* View Community Button */}
                <Link href={`/dashboard/shelter/communities/${community.id}`}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Community
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* My Communities Tab */}
      {activeTab === "my-communities" && (
        <div>
          {joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCommunities
                .filter((community) => joinedCommunities.includes(community.id))
                .map((community) => (
                  <Card key={community.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium">{community.name}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Member
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {community.description}
                      </CardDescription>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">{community.members} members</span>
                        <div className="flex gap-1">
                          {community.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/shelter/communities/${community.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            View Posts
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Calendar className="h-4 w-4 mr-1" />
                          Events
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't joined any communities yet.</p>
              <Button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => setActiveTab("discover")}
              >
                Discover Communities
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="text-center py-12">
          <p className="text-gray-500">No upcoming events at the moment.</p>
          <Button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white">Create Event</Button>
        </div>
      )}

      {/* Join Community Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-teal-500" />
              Join {selectedCommunity?.name}
            </DialogTitle>
            <DialogDescription>
              You're about to join a community of {selectedCommunity?.members} pet lovers!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Community Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{selectedCommunity?.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedCommunity?.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  {selectedCommunity?.members} members
                </div>
                <div className="flex gap-1">
                  {selectedCommunity?.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Connect with fellow pet enthusiasts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Access to exclusive events and meetups
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Share tips and get advice from experts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Stay updated on pet adoption opportunities
                </li>
              </ul>
            </div>

            {/* Introduction Message */}
            <div>
              <Label htmlFor="intro-message">Introduce yourself (optional)</Label>
              <Textarea
                id="intro-message"
                placeholder="Tell the community a bit about yourself and your pets..."
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setIsJoinDialogOpen(false)}
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleJoinCommunity}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Join Community
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}