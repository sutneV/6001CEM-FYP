"use client"

import { useState, useEffect } from "react"
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
import { Search, Users, Calendar, MessageCircle, Heart, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCommunities, type CreateCommunityData } from "@/hooks/useCommunities"
import { toast } from "sonner"

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("discover")
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Community creation form state
  const [newCommunity, setNewCommunity] = useState<CreateCommunityData>({
    name: "",
    description: "",
    category: "",
    bannerImage: "",
    isPublic: true,
  })

  const {
    communities,
    joinedCommunities,
    loading,
    error,
    fetchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    setError,
  } = useCommunities()

  // Filter communities based on search and category
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || community.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const handleSearch = () => {
    fetchCommunities(selectedCategory, searchTerm)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory])

  const handleJoinClick = (community: any) => {
    // Prevent joining if already a member
    if (isJoined(community.id)) {
      return
    }
    setSelectedCommunity(community)
    setIsJoinDialogOpen(true)
  }

  const handleJoinCommunity = async () => {
    if (!selectedCommunity) return

    setIsJoining(true)
    try {
      if (selectedCommunity.isMember) {
        await leaveCommunity(selectedCommunity.id)
        toast.success("Left community successfully!")
      } else {
        await joinCommunity(selectedCommunity.id)
        toast.success("Joined community successfully!")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsJoining(false)
      setIsJoinDialogOpen(false)
      setSelectedCommunity(null)
    }
  }

  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description || !newCommunity.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreating(true)
    try {
      await createCommunity(newCommunity)
      toast.success("Community created successfully!")
      setIsCreateCommunityOpen(false)
      setNewCommunity({
        name: "",
        description: "",
        category: "",
        bannerImage: "",
        isPublic: true,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create community")
    } finally {
      setIsCreating(false)
    }
  }

  const isJoined = (communityId: string) => communities.find(c => c.id === communityId)?.isMember || false

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
                <Input
                  id="community-name"
                  placeholder="Enter community name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="community-category">Category</Label>
                <Select
                  value={newCommunity.category}
                  onValueChange={(value) => setNewCommunity(prev => ({ ...prev, category: value }))}
                >
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
                <Textarea
                  id="community-description"
                  placeholder="Describe your community"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="banner-image">Banner Image URL (optional)</Label>
                <Input
                  id="banner-image"
                  placeholder="https://example.com/banner.jpg"
                  value={newCommunity.bannerImage}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, bannerImage: e.target.value }))}
                />
              </div>
              <Button
                className="w-full bg-teal-500 hover:bg-teal-600"
                onClick={handleCreateCommunity}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Community'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
            ×
          </Button>
        </div>
      )}

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
            <SelectItem value="birds">Birds</SelectItem>
            <SelectItem value="exotic">Exotic Pets</SelectItem>
            <SelectItem value="general">General</SelectItem>
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
        <>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              <span className="ml-2 text-gray-600">Loading communities...</span>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No communities found matching your criteria.</p>
              <Button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => setIsCreateCommunityOpen(true)}
              >
                Create Your First Community
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                  {/* Banner Image */}
                  <div className="relative h-32 w-full bg-gray-200">
                    {community.bannerImage ? (
                      <Image
                        src={community.bannerImage}
                        alt={`${community.name} community banner`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal-400 to-teal-600">
                        <Users className="h-12 w-12 text-white opacity-60" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{community.name}</CardTitle>
                      {isJoined(community.id) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 border-green-200 text-green-700 cursor-default"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Joined
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-teal-500 hover:bg-teal-600 text-white"
                          onClick={() => handleJoinClick(community)}
                          disabled={isJoining}
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
                      <span className="text-sm text-gray-500">{community.memberCount} members</span>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {community.category}
                      </Badge>
                    </div>
                    {/* View Community Button */}
                    <Link href={`/dashboard/communities/${community.id}`}>
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
        </>
      )}

      {/* My Communities Tab */}
      {activeTab === "my-communities" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              <span className="ml-2 text-gray-600">Loading your communities...</span>
            </div>
          ) : joinedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedCommunities.map((community) => (
                <Card key={community.id} className="border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                  {/* Banner Image */}
                  <div className="relative h-32 w-full bg-gray-200">
                    {community.bannerImage ? (
                      <Image
                        src={community.bannerImage}
                        alt={`${community.name} community banner`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal-400 to-teal-600">
                        <Users className="h-12 w-12 text-white opacity-60" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{community.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        {community.memberRole === 'owner' ? 'Owner' : 'Member'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {community.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">{community.memberCount} members</span>
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {community.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/communities/${community.id}`} className="flex-1">
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
