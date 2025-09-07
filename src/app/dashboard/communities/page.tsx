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
import { Search } from "lucide-react"

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

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("discover")
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false)

  const filteredCommunities = mockCommunities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
                    Join
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {community.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{community.members} members</span>
                  <div className="flex gap-1">
                    {community.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* My Communities Tab */}
      {activeTab === "my-communities" && (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't joined any communities yet.</p>
          <Button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white">Discover Communities</Button>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="text-center py-12">
          <p className="text-gray-500">No upcoming events at the moment.</p>
          <Button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white">Create Event</Button>
        </div>
      )}
    </div>
  )
}
