"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MoreVertical, ArrowLeft, Mail, Phone, Ban, CheckCircle, XCircle, Building, MapPin, Users, PawPrint } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface ShelterData {
  id: string
  name: string
  email: string
  phone?: string
  address: string
  city: string
  state: string
  zipCode: string
  status: string
  createdAt: string
  updatedAt: string
  licenseNumber?: string
  capacity?: number
  currentPets?: number
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    lastLoginAt?: string
  }
  stats?: {
    totalPets: number
    adoptedPets: number
    applications: number
  }
}

export default function SheltersPage() {
  const { user } = useAuth()
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileShelters, setShowMobileShelters] = useState(false)
  const [shelters, setShelters] = useState<ShelterData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingShelterDetails, setLoadingShelterDetails] = useState(false)
  const [shelterDetails, setShelterDetails] = useState<ShelterData | null>(null)

  const fetchShelters = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/shelters', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shelters')
      }

      const data = await response.json()
      setShelters(data.shelters || [])
    } catch (error) {
      console.error('Error fetching shelters:', error)
      toast.error('Failed to load shelters')
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchShelterDetails = useCallback(async (shelterId: string) => {
    if (!user) return

    try {
      setLoadingShelterDetails(true)
      const response = await fetch(`/api/admin/shelters/${shelterId}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shelter details')
      }

      const data = await response.json()
      setShelterDetails(data.shelter)
    } catch (error) {
      console.error('Error fetching shelter details:', error)
      toast.error('Failed to load shelter details')
    } finally {
      setLoadingShelterDetails(false)
    }
  }, [user])

  const handleShelterSelect = (shelterId: string) => {
    setSelectedShelter(shelterId)
    fetchShelterDetails(shelterId)
    setShowMobileShelters(false)
  }

  const handleShelterAction = async (shelterId: string, action: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/shelters/${shelterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} shelter`)
      }

      toast.success(`Shelter ${action}ed successfully`)
      fetchShelters()
      if (selectedShelter === shelterId) {
        fetchShelterDetails(shelterId)
      }
    } catch (error) {
      console.error(`Error ${action}ing shelter:`, error)
      toast.error(`Failed to ${action} shelter`)
    }
  }

  useEffect(() => {
    fetchShelters()
  }, [fetchShelters])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'suspended':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'under_review':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCapacityColor = (current: number, total: number) => {
    const percentage = (current / total) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredShelters = shelters.filter((shelter) => {
    return (
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const selectedShelterData = shelters.find((shelter) => shelter.id === selectedShelter) || shelterDetails

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shelters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Mobile Shelters Overlay */}
      {showMobileShelters && (
        <div className="absolute inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Shelters</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileShelters(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search shelters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredShelters.map((shelter) => (
                  <Card
                    key={shelter.id}
                    className={`mb-6 mx-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 border-2 ${
                      selectedShelter === shelter.id
                        ? "border-teal-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                    onClick={() => handleShelterSelect(shelter.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex space-x-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={(shelter as any).userAvatar || undefined} />
                          <AvatarFallback>
                            <Building className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-medium text-sm truncate flex-1">{shelter.name}</h3>
                            <Badge className={`${getStatusColor(shelter.status)} text-white text-xs`}>
                              {shelter.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{shelter.email}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shelter.city}, {shelter.state}
                          </p>
                          {shelter.capacity && shelter.currentPets !== undefined && (
                            <p className={`text-xs ${getCapacityColor(shelter.currentPets, shelter.capacity)}`}>
                              {shelter.currentPets}/{shelter.capacity} pets
                            </p>
                          )}
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

      {/* Desktop Shelters List */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Shelters</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shelters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Shelters */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {filteredShelters.length > 0 ? (
              filteredShelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                    selectedShelter === shelter.id
                      ? "border-teal-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => handleShelterSelect(shelter.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={(shelter as any).userAvatar || undefined} />
                      <AvatarFallback>
                        <Building className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate max-w-[140px]">{shelter.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {loadingShelterDetails && selectedShelter === shelter.id && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-teal-500 border-t-transparent"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{shelter.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shelter.city}, {shelter.state}
                        </p>
                        <Badge className={`${getStatusColor(shelter.status)} text-white text-xs h-4 w-auto px-2 flex items-center justify-center rounded-full flex-shrink-0`}>
                          {shelter.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {shelter.capacity && shelter.currentPets !== undefined && (
                        <p className={`text-xs mt-1 ${getCapacityColor(shelter.currentPets, shelter.capacity)}`}>
                          <PawPrint className="h-3 w-3 inline mr-1" />
                          {shelter.currentPets}/{shelter.capacity} pets
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No shelters found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Shelter Details Area */}
      {selectedShelterData ? (
        <div className="flex-1 flex flex-col">
          {/* Shelter Details Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowMobileShelters(true)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(selectedShelterData as any).userAvatar || undefined} />
                  <AvatarFallback>
                    <Building className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{selectedShelterData.name}</h2>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{selectedShelterData.city}, {selectedShelterData.state}</p>
                    <Badge className={`${getStatusColor(selectedShelterData.status)} text-white text-xs`}>
                      {selectedShelterData.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Shelter Details Content */}
          <ScrollArea className="flex-1 p-6">
            {loadingShelterDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading shelter details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistics Cards */}
                {selectedShelterData.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <PawPrint className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedShelterData.stats.totalPets}</p>
                            <p className="text-sm text-gray-500">Total Pets</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedShelterData.stats.adoptedPets}</p>
                            <p className="text-sm text-gray-500">Adopted</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-2xl font-bold">{selectedShelterData.stats.applications}</p>
                            <p className="text-sm text-gray-500">Applications</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Basic Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Shelter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Shelter Name</label>
                        <p className="text-sm">{selectedShelterData.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedShelterData.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm">{selectedShelterData.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-sm capitalize">{selectedShelterData.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">License Number</label>
                        <p className="text-sm">{selectedShelterData.licenseNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Capacity</label>
                        <p className="text-sm">
                          {selectedShelterData.capacity ?
                            `${selectedShelterData.currentPets || 0} / ${selectedShelterData.capacity} pets` :
                            'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Street Address</label>
                        <p className="text-sm">{selectedShelterData.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-sm">{selectedShelterData.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">State</label>
                        <p className="text-sm">{selectedShelterData.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">ZIP Code</label>
                        <p className="text-sm">{selectedShelterData.zipCode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Person */}
                {selectedShelterData.user && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Contact Person</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-sm">{selectedShelterData.user.firstName} {selectedShelterData.user.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-sm">{selectedShelterData.user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Login</label>
                          <p className="text-sm">{selectedShelterData.user.lastLoginAt ? formatTime(selectedShelterData.user.lastLoginAt) : 'Never'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created At</label>
                        <p className="text-sm">{formatTime(selectedShelterData.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm">{formatTime(selectedShelterData.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedShelterData.status === 'active' ? (
                        <Button
                          variant="outline"
                          onClick={() => handleShelterAction(selectedShelterData.id, 'suspend')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Shelter
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleShelterAction(selectedShelterData.id, 'activate')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate Shelter
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleShelterAction(selectedShelterData.id, 'verify')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Verify License
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShelterAction(selectedShelterData.id, 'send-email')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
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
              <Building className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a shelter</h3>
            <p className="text-gray-600">Choose a shelter from the list to view their details</p>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mt-4"
              onClick={() => setShowMobileShelters(true)}
            >
              View Shelters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}