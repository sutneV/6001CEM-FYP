"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Info,
  MapPin,
  MessageSquare,
  PawPrint,
  Share2,
  Shield,
  X,
} from "lucide-react"
import { FileText } from "lucide-react" // Import FileText here

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { petsService, PetWithShelter } from "@/lib/services/pets"
import { applicationsService } from "@/lib/services/applications"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter as useNextRouter } from "next/navigation"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

// Helper functions for data transformation
const getCompatibilityText = (value: boolean | null, type: string) => {
  if (value === true) {
    switch(type) {
      case 'children': return 'Great with children of all ages'
      case 'dogs': return 'Gets along well with other dogs'
      case 'cats': return 'Can live with cats with proper introduction'
      default: return 'Yes'
    }
  } else if (value === false) {
    switch(type) {
      case 'children': return 'Not suitable for homes with young children'
      case 'dogs': return 'Prefers to be the only dog'
      case 'cats': return 'Not suitable for homes with cats'
      default: return 'No'
    }
  }
  return 'Unknown - please inquire'
}

const getPersonalityTraits = (pet: PetWithShelter) => {
  const traits = []
  if (pet.goodWithKids) traits.push('Great with children')
  if (pet.goodWithDogs) traits.push('Friendly with other dogs')
  if (pet.goodWithCats) traits.push('Gets along with cats')
  if (pet.houseTrained) traits.push('House trained')
  if (pet.vaccinated) traits.push('Up to date on vaccinations')
  return traits.length > 0 ? traits : ['Loving and affectionate', 'Ready for a new home']
}

const getRequirements = (pet: PetWithShelter) => {
  const requirements = [
    'Commitment to regular veterinary care',
    'Home visit required prior to adoption'
  ]
  
  if (pet.size === 'large' || pet.size === 'xlarge') {
    requirements.unshift('Secure fenced yard or commitment to regular exercise')
  }
  
  if (!pet.goodWithKids) {
    requirements.push('Adult-only household recommended')
  }
  
  if (pet.specialNeeds) {
    requirements.push('Experience with special needs pets preferred')
  }
  
  return requirements
}

export default function PetProfilePage() {
  const params = useParams()
  const router = useRouter()
  const nextRouter = useNextRouter()
  const { user } = useAuth()
  const petId = params.id as string
  
  const [pet, setPet] = useState<PetWithShelter | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarPets, setSimilarPets] = useState<PetWithShelter[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [hasActiveApplication, setHasActiveApplication] = useState(false)

  useEffect(() => {
    if (petId) {
      fetchPet(petId)
      fetchSimilarPets()
    }
  }, [petId])

  const fetchPet = async (id: string) => {
    try {
      setLoading(true)
      console.log('Fetching pet with ID:', id)
      const data = await petsService.getPetById(id)
      console.log('Pet data received:', data)
      console.log('Pet images array:', data.images)
      setPet(data)

      // Check if pet is in favorites
      const favorites = JSON.parse(localStorage.getItem('petFavorites') || '[]')
      setIsFavorite(favorites.includes(id))

      // Check if user already has an active application for this pet
      if (user) {
        try {
          const userApplications = await applicationsService.getApplications(user)
          const existingApplication = userApplications.find(
            app => app.pet.id === id && app.status !== 'withdrawn'
          )
          setHasActiveApplication(!!existingApplication)
        } catch (error) {
          console.error('Error checking applications:', error)
          // Don't block the page if application check fails
        }
      }
    } catch (error) {
      console.error('Error fetching pet:', error)
      toast.error(`Failed to load pet profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarPets = async () => {
    try {
      const data = await petsService.getAllPets({ status: 'available' })
      // Get random 3 pets excluding current pet
      const filtered = data.filter(p => p.id !== petId).slice(0, 3)
      setSimilarPets(filtered)
    } catch (error) {
      console.error('Error fetching similar pets:', error)
    }
  }

  const toggleFavorite = () => {
    if (!pet) return
    
    const favorites = JSON.parse(localStorage.getItem('petFavorites') || '[]')
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== pet.id)
      localStorage.setItem('petFavorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
      toast.success('Removed from favorites')
    } else {
      const newFavorites = [...favorites, pet.id]
      localStorage.setItem('petFavorites', JSON.stringify(newFavorites))
      setIsFavorite(true)
      toast.success('Added to favorites')
    }
  }

  const nextImage = () => {
    const images = pet?.images || []
    const newIndex = (currentImageIndex + 1) % Math.max(images.length, 1)
    setCurrentImageIndex(newIndex)
    console.log('Navigated to next image, index:', newIndex)
  }

  const prevImage = () => {
    const images = pet?.images || []
    const newIndex = (currentImageIndex - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1)
    setCurrentImageIndex(newIndex)
    console.log('Navigated to previous image, index:', newIndex)
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setShowGalleryModal(true)
    document.body.style.overflow = "hidden"
  }

  const closeGallery = () => {
    setShowGalleryModal(false)
    document.body.style.overflow = "auto"
  }

  const handleImageError = useCallback((imageUrl: string) => {
    console.error('Image failed to load:', imageUrl)
    setImageErrors(prev => new Set([...prev, imageUrl]))
  }, [])

  const getImageSrc = useCallback((imageUrl: string, fallbackText?: string) => {
    console.log('getImageSrc called with:', imageUrl, 'errors:', imageErrors.has(imageUrl))
    if (imageErrors.has(imageUrl)) {
      const fallback = fallbackText ? 
        `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(fallbackText)}` :
        '/placeholder.svg?height=600&width=800&text=Pet+Photo'
      console.log('Using fallback due to error:', fallback)
      return fallback
    }
    console.log('Returning original URL:', imageUrl)
    return imageUrl
  }, [imageErrors])

  const nextGalleryImage = () => {
    const images = pet?.images || []
    setGalleryIndex((prev) => (prev + 1) % Math.max(images.length, 1))
  }

  const prevGalleryImage = () => {
    const images = pet?.images || []
    setGalleryIndex((prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
  }

  const handleAskQuestion = async () => {
    if (!user) {
      toast.error('Please log in to ask a question')
      nextRouter.push('/auth/signin')
      return
    }

    if (user.role !== 'adopter') {
      toast.error('Only adopters can ask questions about pets')
      return
    }

    if (!pet) return

    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          shelterId: pet.shelterId,
          petId: pet.id,
          message: `Hi! I'm interested in ${pet.name} and would like to know more. Could you tell me more about their personality and care requirements?`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation')
      }

      toast.success('Message sent! Check your messages for the conversation.')
      nextRouter.push('/dashboard/messages')
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start conversation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pet profile...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Pet Not Found</h2>
          <p className="text-muted-foreground mb-4">The pet you're looking for doesn't exist or may have been adopted.</p>
          <Button onClick={() => router.push('/dashboard/pets')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pets
          </Button>
        </div>
      </div>
    )
  }

  // Helper function to ensure proper image URLs
  const processImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      const fallback = `/placeholder.svg?height=600&width=800&text=${pet.name}+Photo`
      console.log('No image URL provided, using fallback:', fallback)
      return fallback
    }
    
    // If it's already a full URL or starts with http/https, use as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/placeholder.svg')) {
      console.log('Using URL as-is:', imageUrl)
      return imageUrl
    }
    
    // If it starts with /uploads/, use as is
    if (imageUrl.startsWith('/uploads/')) {
      console.log('Using uploads URL as-is:', imageUrl)
      return imageUrl
    }
    
    // If it doesn't start with /, add it
    const processed = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
    console.log('Processed URL:', imageUrl, '->', processed)
    return processed
  }

  // Transform real data to match UI expectations
  const processedImages = pet.images && pet.images.length > 0 
    ? pet.images.map(processImageUrl)
    : [processImageUrl('')]
  
  console.log('Original images:', pet.images)
  console.log('Processed images:', processedImages)
  console.log('Current image index:', currentImageIndex)
  console.log('Current image URL:', processedImages[currentImageIndex])
  
  const petData = {
    id: pet.id,
    name: pet.name,
    type: pet.type.charAt(0).toUpperCase() + pet.type.slice(1),
    breed: pet.breed || 'Mixed breed',
    age: pet.age,
    gender: pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1),
    size: pet.size?.charAt(0).toUpperCase() + pet.size?.slice(1) || 'Medium',
    color: pet.color || 'Mixed',
    location: pet.shelter.name + ', Penang',
    status: pet.status === 'available' ? 'Available for Adoption' : pet.status.charAt(0).toUpperCase() + pet.status.slice(1),
    description: pet.description || 'This lovely pet is looking for a forever home.',
    personality: getPersonalityTraits(pet),
    healthInfo: {
      vaccinated: pet.vaccinated,
      microchipped: pet.microchipped,
      spayedNeutered: pet.neutered,
      specialNeeds: pet.specialNeeds,
      specialNeedsDetails: pet.specialNeedsDescription || '',
    },
    compatibility: {
      children: getCompatibilityText(pet.goodWithKids, 'children'),
      dogs: getCompatibilityText(pet.goodWithDogs, 'dogs'),
      cats: getCompatibilityText(pet.goodWithCats, 'cats'),
      apartments: pet.size === 'small' || pet.size === 'medium' ? 'Suitable for apartments' : 'Best with a yard',
    },
    adoptionFee: 'Please inquire',
    images: processedImages,
    fosterParent: {
      name: pet.shelter.name,
      image: `/placeholder.svg?height=40&width=40&text=${pet.shelter.name.charAt(0)}`,
      since: 'Contact for details',
    },
    story: pet.story || `${pet.name} is a wonderful ${pet.type} looking for a loving forever home. This ${pet.age} ${pet.gender} has so much love to give and would make a perfect addition to the right family.`,
    requirements: getRequirements(pet),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Left Column - Images */}
          <motion.div variants={fadeIn} className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image - Clean Working Version */}
              <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                <img
                  key={`main-image-${currentImageIndex}`}
                  src={petData.images[currentImageIndex]}
                  alt={`${petData.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openGallery(currentImageIndex)}
                  onError={(e) => {
                    console.error('Main image failed:', petData.images[currentImageIndex])
                    e.currentTarget.src = `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(petData.name)}`
                  }}
                  onLoad={() => {
                    console.log('Main image loaded:', petData.images[currentImageIndex])
                  }}
                />
                
                {/* Navigation buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 text-gray-800 shadow-sm hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 text-gray-800 shadow-sm hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
                
                {/* Image indicators */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {petData.images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-1.5 rounded-full ${
                        index === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Dot clicked, setting index to:', index)
                        setCurrentImageIndex(index)
                      }}
                    >
                      <span className="sr-only">Go to image {index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>


              {/* Thumbnail Gallery */}
              <div className="flex overflow-x-auto pb-2 pt-2 gap-2.5 mx-0 pl-2 pr-2">
                {petData.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square h-20 flex-shrink-0 overflow-hidden rounded-md ${
                      index === currentImageIndex ? "ring-2 ring-teal-500 ring-offset-2" : ""
                    }`}
                    onClick={() => {
                      console.log('Thumbnail clicked, setting index to:', index)
                      console.log('Thumbnail image URL:', image)
                      setCurrentImageIndex(index)
                    }}
                  >
                    <img
                      src={getImageSrc(image || "/placeholder.svg", `${petData.name} ${index + 1}`)}
                      alt={`${petData.name} - Thumbnail ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Thumbnail IMG error:', image)
                        handleImageError(image)
                        e.currentTarget.src = `/placeholder.svg?height=80&width=80&text=${index + 1}`
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Pet Details Tabs */}
              <Card className="mt-6">
                <Tabs defaultValue="about">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="about"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="health"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Health
                    </TabsTrigger>
                    <TabsTrigger
                      value="adoption"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-teal-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Adoption
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="about" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold">About {petData.name}</h2>
                        <p className="mt-2 text-gray-600">{petData.description}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Personality</h3>
                        <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {petData.personality.map((trait, index) => (
                            <motion.li
                              key={index}
                              variants={popIn}
                              className="flex items-center gap-2 text-gray-600"
                              whileHover={{ x: 5 }}
                            >
                              <Check className="h-4 w-4 text-teal-500" />
                              <span>{trait}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium">Compatibility</h3>
                        <div className="mt-2 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <PawPrint className="h-4 w-4 text-blue-700" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Other Dogs</h4>
                                <p className="text-xs text-gray-500">{petData.compatibility.dogs}</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                <PawPrint className="h-4 w-4 text-purple-700" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Cats</h4>
                                <p className="text-xs text-gray-500">{petData.compatibility.cats}</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <Home className="h-4 w-4 text-green-700" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Living Situation</h4>
                                <p className="text-xs text-gray-500">{petData.compatibility.apartments}</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                <div className="text-yellow-700">👨‍👩‍👧‍👦</div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Children</h4>
                                <p className="text-xs text-gray-500">{petData.compatibility.children}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{petData.name}'s Story</h3>
                        <p className="mt-2 text-gray-600">{petData.story}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="details" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold">Pet Details</h2>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-medium">{petData.type}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Breed</p>
                            <p className="font-medium">{petData.breed}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-medium">{petData.age}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="font-medium">{petData.gender}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="font-medium">{petData.size}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Color</p>
                            <p className="font-medium">{petData.color}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{petData.location}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="font-medium">{petData.status}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Foster Information</h3>
                        <div className="mt-2 flex items-center gap-3 rounded-lg border p-4">
                          <Avatar>
                            <AvatarImage
                              src={petData.fosterParent.image || "/placeholder.svg"}
                              alt={petData.fosterParent.name}
                            />
                            <AvatarFallback>
                              {petData.fosterParent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{petData.fosterParent.name}</p>
                            <p className="text-sm text-gray-500">
                              Foster parent for {petData.name} for {petData.fosterParent.since}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="ml-auto">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <div className="mt-2 overflow-hidden rounded-lg border">
                          <div className="aspect-video relative bg-gray-100">
                            <Image
                              src="/placeholder.svg?height=300&width=600&text=Map+of+George+Town,+Penang"
                              alt="Map showing pet location"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-teal-500" />
                              <span className="font-medium">{petData.location}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {petData.name} is currently in foster care at this location
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="health" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold">Health Information</h2>
                        <p className="mt-2 text-gray-600">
                          {petData.name} is in excellent health and has received all necessary medical care.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <Shield className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                              <h3 className="font-medium">Vaccinations</h3>
                              <p className="text-sm text-gray-500">
                                {petData.healthInfo.vaccinated
                                  ? "Up to date on all vaccinations"
                                  : "Vaccination status unknown"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <div className="text-blue-700">💉</div>
                            </div>
                            <div>
                              <h3 className="font-medium">Microchipped</h3>
                              <p className="text-sm text-gray-500">
                                {petData.healthInfo.microchipped
                                  ? "Yes, has a microchip for identification"
                                  : "Not microchipped"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                              <div className="text-purple-700">⚕️</div>
                            </div>
                            <div>
                              <h3 className="font-medium">Spayed/Neutered</h3>
                              <p className="text-sm text-gray-500">
                                {petData.healthInfo.spayedNeutered
                                  ? `Yes, ${petData.gender === "Male" ? "neutered" : "spayed"}`
                                  : `Not ${petData.gender === "Male" ? "neutered" : "spayed"} yet`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                              <Info className="h-5 w-5 text-yellow-700" />
                            </div>
                            <div>
                              <h3 className="font-medium">Special Needs</h3>
                              <p className="text-sm text-gray-500">
                                {petData.healthInfo.specialNeeds
                                  ? petData.healthInfo.specialNeedsDetails
                                  : "No special needs or medical conditions"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Veterinary Records</h3>
                        <div className="mt-2 rounded-lg border p-4">
                          <p className="text-sm text-gray-600">
                            Complete veterinary records will be provided to the adopter. {petData.name} has been
                            examined by our partner veterinarians and is in good health.
                          </p>
                          <div className="mt-4 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Last vet check: May 1, 2025</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="adoption" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold">Adoption Information</h2>
                        <p className="mt-2 text-gray-600">
                          Interested in adopting {petData.name}? Here's what you need to know about the adoption process
                          and requirements.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Adoption Fee</h3>
                        <div className="mt-2 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{petData.adoptionFee}</p>
                              <p className="text-sm text-gray-500">
                                Covers vaccinations, microchipping, spay/neuter, and care costs
                              </p>
                            </div>
                            <Badge className="bg-teal-100 text-teal-700">Fee</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Adoption Requirements</h3>
                        <ul className="mt-2 space-y-2">
                          {petData.requirements.map((requirement, index) => (
                            <motion.li
                              key={index}
                              variants={popIn}
                              className="flex items-start gap-2 rounded-lg border p-3"
                              whileHover={{ x: 5 }}
                            >
                              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-500" />
                              <span className="text-sm text-gray-600">{requirement}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium">Adoption Process</h3>
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Process Steps</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              {[
                                { label: "Application", icon: <FileText className="h-3 w-3" /> },
                                { label: "Interview", icon: <MessageSquare className="h-3 w-3" /> },
                                { label: "Meet & Greet", icon: <PawPrint className="h-3 w-3" /> },
                                { label: "Home Visit", icon: <Home className="h-3 w-3" /> },
                              ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                    {step.icon}
                                  </div>
                                  <span className="mt-1 text-center">{step.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h4 className="font-medium">Timeline</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              The adoption process typically takes 1-2 weeks from application to bringing your new pet
                              home. This ensures we find the best match for both you and {petData.name}.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </motion.div>

          {/* Right Column - Adoption Info */}
          <motion.div variants={fadeIn} className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{petData.name}</h1>
                      <p className="text-gray-500">
                        {petData.breed} • {petData.age}
                      </p>
                    </div>
                    <Badge className="bg-teal-500">{petData.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{petData.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium">{petData.gender}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Size</p>
                      <p className="font-medium">{petData.size}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Color</p>
                      <p className="font-medium">{petData.color}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-medium">{petData.status}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Adoption Compatibility</span>
                      <span className="font-medium">95% Match</span>
                    </div>
                    <Progress value={95} className="h-2 bg-gray-100" indicatorClassName="bg-teal-500" />
                  </div>
                  <motion.div whileHover={{ scale: hasActiveApplication ? 1 : 1.03 }} whileTap={{ scale: hasActiveApplication ? 1 : 0.97 }}>
                    {hasActiveApplication ? (
                      <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                        <FileText className="mr-2 h-4 w-4" />
                        Application Already Submitted
                      </Button>
                    ) : (
                      <Link href={`/dashboard/pets/${petData.id}/apply`}>
                        <Button className="w-full bg-teal-500 hover:bg-teal-600">Apply to Adopt {petData.name}</Button>
                      </Link>
                    )}
                  </motion.div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Meet & Greet
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button variant="outline" className="w-full" onClick={handleAskQuestion}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Ask a Question
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Pets */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Similar Pets</h2>
                <p className="text-sm text-gray-500">You might also like these pets</p>
                <div className="mt-4 space-y-4">
                  {similarPets.map((pet, index) => (
                    <motion.div
                      key={index}
                      variants={popIn}
                      whileHover={{ y: -5 }}
                      className="flex gap-3 rounded-lg border p-3"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={pet.images?.[0] || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-xs text-gray-500">
                          {pet.breed} • {pet.age}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{pet.shelter.name}, Penang</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/pets/${pet.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adoption Support */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Need Help?</h2>
                <p className="text-sm text-gray-500">Our adoption counselors are here to assist you</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                      <MessageSquare className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Chat with an Adoption Counselor</h3>
                      <p className="text-xs text-gray-500">Get answers to your questions about {petData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                      <Calendar className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Book a Video Call</h3>
                      <p className="text-xs text-gray-500">See {petData.name} virtually before visiting</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                      <Info className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Adoption Resources</h3>
                      <p className="text-xs text-gray-500">Helpful guides for new pet parents</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Similar Pets Section (Mobile Only) */}
        <motion.section variants={fadeIn} className="mt-8 lg:hidden">
          <h2 className="text-xl font-semibold">Similar Pets</h2>
          <p className="text-gray-500">You might also like these pets</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {similarPets.map((pet, index) => (
              <motion.div
                key={index}
                variants={popIn}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-lg border"
              >
                <div className="relative aspect-square">
                  <Image src={pet.images?.[0] || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{pet.name}</h3>
                    <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-100">
                      {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {pet.breed} • {pet.age}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{pet.shelter.name}, Penang</span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/dashboard/pets/${pet.id}`}>
                      <Button className="w-full bg-teal-500 hover:bg-teal-600">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={closeGallery}
          >
            <motion.button
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={closeGallery}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            <div className="relative h-full max-h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={`gallery-${galleryIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full"
              >
                <Image
                  src={petData.images[galleryIndex] || "/placeholder.svg"}
                  alt={`${petData.name} - Gallery image ${galleryIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  prevGalleryImage()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  nextGalleryImage()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {petData.images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full ${index === galleryIndex ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setGalleryIndex(index)
                    }}
                  >
                    <span className="sr-only">Go to image {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
