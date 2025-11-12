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
import { Search, Users, Calendar, MessageCircle, Heart, Check, ArrowRight, Loader2, AlertCircle, Plus, UserPlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCommunities, type CreateCommunityData } from "@/hooks/useCommunities"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Helper function to capitalize first letter of each word
const capitalizeCategory = (category: string) => {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function CommunitiesInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const { user } = useAuth()

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

  // Filter communities based on search, category, and tab
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || community.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesTab = activeTab === "all" || (activeTab === "joined" && community.isMember)
    return matchesSearch && matchesCategory && matchesTab
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

  // Determine the base path for links based on user role
  const getBasePath = () => {
    return user?.role === "shelter" ? "/dashboard/shelter/communities" : "/dashboard/communities"
  }

  // Get appropriate placeholder text based on user type
  const getPlaceholderText = () => {
    return user?.role === "shelter" 
      ? "Tell the community a bit about yourself and your shelter..."
      : "Tell the community a bit about yourself and your pets..."
  }

  if (loading && communities.length === 0) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Sidebar with Communities List */}
      <div className="flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold">Communities</h1>
            <Dialog open={isCreateCommunityOpen} onOpenChange={setIsCreateCommunityOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
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

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-teal-600" />
                <span className="text-lg font-bold text-teal-700">{communities.length}</span>
              </div>
              <p className="text-xs text-teal-600 mt-1">Total</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">{joinedCommunities.length}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Joined</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="joined">My Communities</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Communities List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((community) => (
                <div
                  key={community.id}
                  className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                    selectedCommunity?.id === community.id
                      ? "border-teal-500 shadow-lg bg-teal-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => setSelectedCommunity(community)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      {community.bannerImage ? (
                        <AvatarImage src={community.bannerImage} alt={community.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                          {community.name[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{community.name}</h3>
                        {community.isMember && (
                          <Badge className="bg-green-500 flex-shrink-0 ml-2">
                            <Check className="h-3 w-3 mr-1" />
                            Joined
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {community.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{community.memberCount}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {capitalizeCategory(community.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No communities found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Details Panel */}
      {selectedCommunity ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {selectedCommunity.bannerImage ? (
                    <AvatarImage src={selectedCommunity.bannerImage} alt={selectedCommunity.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-2xl">
                      {selectedCommunity.name[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCommunity.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{capitalizeCategory(selectedCommunity.category)}</Badge>
                    <span className="text-sm text-gray-500">{selectedCommunity.memberCount} members</span>
                  </div>
                </div>
              </div>
              {selectedCommunity.isMember ? (
                <Link href={`${getBasePath()}/${selectedCommunity.id}`}>
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    View Posts
                  </Button>
                </Link>
              ) : (
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => handleJoinClick(selectedCommunity)}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Community
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Details Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedCommunity.description}</p>
                </CardContent>
              </Card>

              {/* Community Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Members</span>
                    <span className="text-sm font-medium">{selectedCommunity.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Category</span>
                    <Badge variant="secondary" className="text-xs">{capitalizeCategory(selectedCommunity.category)}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedCommunity.isMember ? (
                    <>
                      <Link href={`${getBasePath()}/${selectedCommunity.id}?tab=posts`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View Posts & Discussions
                        </Button>
                      </Link>
                      <Link href={`${getBasePath()}/${selectedCommunity.id}?tab=events`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Events
                        </Button>
                      </Link>
                      <Link href={`${getBasePath()}/${selectedCommunity.id}?tab=members`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          View Members
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-3">Join this community to access posts, events, and connect with members!</p>
                      <Button
                        className="bg-teal-500 hover:bg-teal-600 w-full"
                        onClick={() => handleJoinClick(selectedCommunity)}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Community
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a community</h3>
            <p className="text-gray-600">Choose a community from the list to view details</p>
          </div>
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
              You're about to join a community of {selectedCommunity?.memberCount} pet lovers!
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
                  {selectedCommunity?.memberCount} members
                </div>
                <Badge variant="secondary" className="text-xs">
                  {capitalizeCategory(selectedCommunity?.category || '')}
                </Badge>
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
                placeholder={getPlaceholderText()}
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