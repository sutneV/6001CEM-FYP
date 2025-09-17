"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Heart,
  Users,
  Clock,
  Loader2,
  Phone,
  Mail,
  PawPrint,
  Activity,
  Shield,
  Home,
  Baby,
  Dog,
  Cat,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  MoreHorizontal,
  Camera
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { petsService } from "@/lib/services/pets"
import { Pet } from "@/lib/db/schema"

const statusColors = {
  available: "bg-green-500 text-white",
  adopted: "bg-blue-500 text-white",
  pending: "bg-yellow-500 text-white",
}

export default function PetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (petId) {
      fetchPetDetails()
    }
  }, [petId])

  const fetchPetDetails = async () => {
    try {
      setLoading(true)
      const data = await petsService.getPet(petId)
      setPet(data)
    } catch (error) {
      toast.error('Failed to fetch pet details')
      console.error('Error fetching pet details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePet = async () => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await petsService.deletePet(petId)
      toast.success('Pet deleted successfully')
      router.push('/dashboard/shelter/pets')
    } catch (error) {
      toast.error('Failed to delete pet')
      console.error('Error deleting pet:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pet details...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Pet not found</p>
          <p className="text-muted-foreground mb-4">The pet you're looking for doesn't exist.</p>
          <Link href="/dashboard/shelter/pets">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Left Sidebar - Pet Gallery & Quick Actions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard/shelter/pets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pets
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pet Photo & Basic Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-center mb-4">
            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage
                src={pet.images && Array.isArray(pet.images) && pet.images.length > 0 ? pet.images[0] : "/placeholder.svg"}
                alt={pet.name}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl bg-teal-100 text-teal-600">{pet.name[0]}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{pet.name}</h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              {pet.type === 'dog' ? (
                <Dog className="h-4 w-4 text-gray-500" />
              ) : (
                <Cat className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-gray-600 capitalize">{pet.type}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{pet.breed || 'Mixed breed'}</span>
            </div>
            <Badge className={`${statusColors[pet.status as keyof typeof statusColors]} rounded-full px-4 py-1`}>
              <CheckCircle className="h-3 w-3 mr-1" />
              {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-teal-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Age</p>
                <p className="text-gray-500 capitalize">{pet.age}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Activity className="h-4 w-4 text-teal-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Gender</p>
                <p className="text-gray-500 capitalize">{pet.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <PawPrint className="h-4 w-4 text-teal-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Size</p>
                <p className="text-gray-500 capitalize">{pet.size || 'Not specified'}</p>
              </div>
            </div>
            {pet.weight && (
              <div className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Weight</p>
                  <p className="text-gray-500">{pet.weight} kg</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
          <div className="space-y-2">
            <Link href={`/dashboard/shelter/pets/${petId}/edit`} className="block">
              <Button className="w-full justify-start bg-teal-500 hover:bg-teal-600 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit Pet Information
              </Button>
            </Link>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View Applications
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Add to Featured
            </Button>
            <Button
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              variant="outline"
              onClick={handleDeletePet}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Pet
            </Button>
          </div>
        </div>

        {/* Timestamps */}
        <div className="p-4 text-xs text-gray-500 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Added {new Date(pet.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span>Updated {new Date(pet.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Pet Information</h2>
              <p className="text-gray-600">Complete details and characteristics</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Description Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-5 w-5 text-teal-500 mr-2" />
                About {pet.name}
              </h3>
              <p className="text-gray-700 leading-relaxed">{pet.description}</p>
            </div>

            {/* Pet's Story */}
            {pet.story && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Heart className="h-5 w-5 text-teal-500 mr-2" />
                  {pet.name}'s Story
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{pet.story}</p>
              </div>
            )}

            {/* Physical Characteristics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <PawPrint className="h-5 w-5 text-teal-500 mr-2" />
                Physical Characteristics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Color</p>
                  <p className="text-gray-900">{pet.color || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Size Category</p>
                  <p className="text-gray-900 capitalize">{pet.size || 'Not specified'}</p>
                </div>
                {pet.weight && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Weight</p>
                    <p className="text-gray-900">{pet.weight} kg</p>
                  </div>
                )}
              </div>
            </div>

            {/* Health Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-teal-500 mr-2" />
                Health Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-lg p-4 border-2 ${pet.vaccinated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Vaccinated</span>
                    {pet.vaccinated ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.vaccinated ? 'text-green-600' : 'text-gray-500'}`}>
                    {pet.vaccinated ? 'Up to date' : 'Not vaccinated'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border-2 ${pet.neutered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Spayed/Neutered</span>
                    {pet.neutered ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.neutered ? 'text-green-600' : 'text-gray-500'}`}>
                    {pet.neutered ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border-2 ${pet.microchipped ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Microchipped</span>
                    {pet.microchipped ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.microchipped ? 'text-green-600' : 'text-gray-500'}`}>
                    {pet.microchipped ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Behavioral Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 text-teal-500 mr-2" />
                Behavioral Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg p-4 border-2 ${pet.goodWithKids ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Good with Kids</span>
                    {pet.goodWithKids ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.goodWithKids ? 'text-green-600' : 'text-red-600'}`}>
                    {pet.goodWithKids ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border-2 ${pet.goodWithDogs ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Good with Dogs</span>
                    {pet.goodWithDogs ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.goodWithDogs ? 'text-green-600' : 'text-red-600'}`}>
                    {pet.goodWithDogs ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border-2 ${pet.goodWithCats ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Good with Cats</span>
                    {pet.goodWithCats ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.goodWithCats ? 'text-green-600' : 'text-red-600'}`}>
                    {pet.goodWithCats ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className={`rounded-lg p-4 border-2 ${pet.houseTrained ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">House Trained</span>
                    {pet.houseTrained ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${pet.houseTrained ? 'text-green-600' : 'text-red-600'}`}>
                    {pet.houseTrained ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Needs */}
            {pet.specialNeeds && pet.specialNeedsDescription && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Baby className="h-5 w-5 text-amber-500 mr-2" />
                  Special Needs
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{pet.specialNeedsDescription}</p>
              </div>
            )}

            {/* Image Gallery */}
            {pet.images && Array.isArray(pet.images) && pet.images.length > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 text-teal-500 mr-2" />
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pet.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={image}
                        alt={`${pet.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}