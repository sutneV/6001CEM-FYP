"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Heart,
  Users,
  Clock,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { petsService } from "@/lib/services/pets"
import { Pet } from "@/lib/db/schema"

const statusColors = {
  available: "bg-green-100 text-green-800",
  adopted: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pet details...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shelter/pets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">Pet Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/shelter/pets/${petId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Pet
            </Button>
          </Link>
          <Button
            variant="destructive"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pet Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Badge className={statusColors[pet.status as keyof typeof statusColors]}>
                  {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-lg capitalize">{pet.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Breed</p>
                  <p className="text-lg">{pet.breed || 'Mixed breed'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-lg capitalize">{pet.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-lg capitalize">{pet.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-lg capitalize">{pet.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p className="text-lg">{pet.color}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-base leading-relaxed">{pet.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Health & Care Information */}
          <Card>
            <CardHeader>
              <CardTitle>Health & Care Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vaccination Status</p>
                  <Badge variant={pet.vaccinated ? "default" : "secondary"}>
                    {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Spay/Neuter Status</p>
                  <Badge variant={pet.neutered ? "default" : "secondary"}>
                    {pet.neutered ? "Spayed/Neutered" : "Not Spayed/Neutered"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Microchipped</p>
                  <Badge variant={pet.microchipped ? "default" : "secondary"}>
                    {pet.microchipped ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {pet.specialNeeds && pet.specialNeedsDescription && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Special Needs</p>
                    <p className="text-base leading-relaxed">{pet.specialNeedsDescription}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Behavioral Information */}
          {(pet.story || pet.goodWithKids !== undefined || pet.goodWithDogs !== undefined || pet.goodWithCats !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.story && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Pet's Story</p>
                    <p className="text-base leading-relaxed">{pet.story}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Good with Kids</p>
                    <Badge variant={pet.goodWithKids ? "default" : "secondary"}>
                      {pet.goodWithKids ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Good with Dogs</p>
                    <Badge variant={pet.goodWithDogs ? "default" : "secondary"}>
                      {pet.goodWithDogs ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Good with Cats</p>
                    <Badge variant={pet.goodWithCats ? "default" : "secondary"}>
                      {pet.goodWithCats ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">House Trained</p>
                    <Badge variant={pet.houseTrained ? "default" : "secondary"}>
                      {pet.houseTrained ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pet Photo */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="h-48 w-48 mx-auto mb-4">
                  <AvatarImage
                    src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder.svg"}
                    alt={pet.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl">{pet.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-bold mb-2">{pet.name}</h3>
                <p className="text-muted-foreground">{pet.type} • {pet.breed || 'Mixed breed'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Added to Shelter</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pet.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pet ID</p>
                  <p className="text-sm text-muted-foreground">{pet.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pet.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/shelter/pets/${petId}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Pet Information
                </Button>
              </Link>

              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View Applications
              </Button>

              <Button className="w-full" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Add to Featured
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}