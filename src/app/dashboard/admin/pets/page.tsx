"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MoreVertical, ArrowLeft, Heart, Eye, Ban, CheckCircle, PawPrint, MapPin, Calendar, Ruler, Weight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface PetData {
  id: string
  name: string
  type: string
  breed?: string
  age: string
  gender: string
  size?: string
  weight?: number
  color?: string
  description: string
  story?: string
  images: string[]
  status: string
  vaccinated: boolean
  neutered: boolean
  microchipped: boolean
  houseTrained: boolean
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean
  specialNeeds: boolean
  specialNeedsDescription?: string
  createdAt: string
  updatedAt: string
  shelter: {
    id: string
    name: string
    userId: string
  }
  stats?: {
    views: number
    favorites: number
    applications: number
  }
}

export default function PetsPage() {
  const { user } = useAuth()
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobilePets, setShowMobilePets] = useState(false)
  const [pets, setPets] = useState<PetData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPetDetails, setLoadingPetDetails] = useState(false)
  const [petDetails, setPetDetails] = useState<PetData | null>(null)

  const fetchPets = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/pets', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pets')
      }

      const data = await response.json()
      setPets(data.pets || [])
    } catch (error) {
      console.error('Error fetching pets:', error)
      toast.error('Failed to load pets')
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchPetDetails = useCallback(async (petId: string) => {
    if (!user) return

    try {
      setLoadingPetDetails(true)
      const response = await fetch(`/api/admin/pets/${petId}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pet details')
      }

      const data = await response.json()
      setPetDetails(data.pet)
    } catch (error) {
      console.error('Error fetching pet details:', error)
      toast.error('Failed to load pet details')
    } finally {
      setLoadingPetDetails(false)
    }
  }, [user])

  const handlePetSelect = (petId: string) => {
    setSelectedPet(petId)
    fetchPetDetails(petId)
    setShowMobilePets(false)
  }

  const handlePetAction = async (petId: string, action: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/pets/${petId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} pet`)
      }

      toast.success(`Pet ${action}ed successfully`)
      fetchPets()
      if (selectedPet === petId) {
        fetchPetDetails(petId)
      }
    } catch (error) {
      console.error(`Error ${action}ing pet:`, error)
      toast.error(`Failed to ${action} pet`)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'adopted':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'dog':
        return '🐕'
      case 'cat':
        return '🐱'
      case 'rabbit':
        return '🐰'
      case 'bird':
        return '🐦'
      default:
        return '🐾'
    }
  }

  const filteredPets = pets.filter((pet) => {
    return (
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.shelter.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const selectedPetData = pets.find((pet) => pet.id === selectedPet) || petDetails

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Mobile Pets Overlay */}
      {showMobilePets && (
        <div className="absolute inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Pets</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobilePets(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search pets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredPets.map((pet) => (
                  <Card
                    key={pet.id}
                    className={`mb-6 mx-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 border-2 ${
                      selectedPet === pet.id
                        ? "border-teal-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                    onClick={() => handlePetSelect(pet.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          {pet.images.length > 0 ? (
                            <img
                              src={pet.images[0]}
                              alt={pet.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                              {getTypeIcon(pet.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-sm truncate flex-1">{pet.name}</h3>
                            <Badge className={`${getStatusColor(pet.status)} text-white text-xs`}>
                              {pet.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 capitalize">{pet.type} {pet.breed && `• ${pet.breed}`}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pet.shelter.name}
                          </p>
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

      {/* Desktop Pets List */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Pets</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pets */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                    selectedPet === pet.id
                      ? "border-teal-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => handlePetSelect(pet.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      {pet.images.length > 0 ? (
                        <img
                          src={pet.images[0]}
                          alt={pet.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                          {getTypeIcon(pet.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate max-w-[140px]">{pet.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {loadingPetDetails && selectedPet === pet.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-teal-500 border-t-transparent"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 truncate max-w-[180px] capitalize">
                        {pet.type} {pet.breed && `• ${pet.breed}`} • {pet.age}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          {pet.shelter.name}
                        </p>
                        <Badge className={`${getStatusColor(pet.status)} text-white text-xs h-4 w-auto px-2 flex items-center justify-center rounded-full flex-shrink-0`}>
                          {pet.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No pets found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Pet Details Area */}
      {selectedPetData ? (
        <div className="flex-1 flex flex-col">
          {/* Pet Details Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowMobilePets(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative h-16 w-16">
                  {selectedPetData.images.length > 0 ? (
                    <img
                      src={selectedPetData.images[0]}
                      alt={selectedPetData.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-3xl">
                      {getTypeIcon(selectedPetData.type)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{selectedPetData.name}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedPetData.type} {selectedPetData.breed && `• ${selectedPetData.breed}`}
                    </p>
                    <Badge className={`${getStatusColor(selectedPetData.status)} text-white text-xs`}>
                      {selectedPetData.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pet Details Content */}
          <ScrollArea className="flex-1 p-6">
            {loadingPetDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading pet details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistics Cards */}
                {selectedPetData.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedPetData.stats.views}</p>
                            <p className="text-sm text-gray-500">Views</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedPetData.stats.favorites}</p>
                            <p className="text-sm text-gray-500">Favorites</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedPetData.stats.applications}</p>
                            <p className="text-sm text-gray-500">Applications</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Pet Images */}
                {selectedPetData.images.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPetData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${selectedPetData.name} ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Basic Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">{selectedPetData.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-sm capitalize">{selectedPetData.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Breed</label>
                        <p className="text-sm">{selectedPetData.breed || 'Mixed'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p className="text-sm capitalize">{selectedPetData.age}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Gender</label>
                        <p className="text-sm capitalize">{selectedPetData.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Size</label>
                        <p className="text-sm capitalize">{selectedPetData.size || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Weight</label>
                        <p className="text-sm">{selectedPetData.weight ? `${selectedPetData.weight} kg` : 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Color</label>
                        <p className="text-sm">{selectedPetData.color || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Description</h3>
                    <p className="text-sm text-gray-700">{selectedPetData.description}</p>
                    {selectedPetData.story && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Story</h4>
                        <p className="text-sm text-gray-700">{selectedPetData.story}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Health & Behavior */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Health & Behavior</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.vaccinated ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Vaccinated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.neutered ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Neutered/Spayed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.microchipped ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Microchipped</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.houseTrained ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">House Trained</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.goodWithKids ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Good with Kids</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.goodWithDogs ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Good with Dogs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.goodWithCats ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Good with Cats</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${selectedPetData.specialNeeds ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Special Needs</span>
                      </div>
                    </div>
                    {selectedPetData.specialNeeds && selectedPetData.specialNeedsDescription && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Special Needs Description</h4>
                        <p className="text-sm text-gray-700">{selectedPetData.specialNeedsDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shelter Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Shelter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Shelter Name</label>
                        <p className="text-sm">{selectedPetData.shelter.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Added Date</label>
                        <p className="text-sm">{formatTime(selectedPetData.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm">{formatTime(selectedPetData.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedPetData.status === 'available' ? (
                        <Button
                          variant="outline"
                          onClick={() => handlePetAction(selectedPetData.id, 'remove')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Remove Listing
                        </Button>
                      ) : selectedPetData.status === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handlePetAction(selectedPetData.id, 'approve-adoption')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Adoption
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handlePetAction(selectedPetData.id, 'make-available')}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Make Available
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handlePetAction(selectedPetData.id, 'make-available')}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Make Available
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handlePetAction(selectedPetData.id, 'feature')}
                      >
                        Feature Pet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a pet</h3>
            <p className="text-gray-600">Choose a pet from the list to view their details</p>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mt-4"
              onClick={() => setShowMobilePets(true)}
            >
              View Pets
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}