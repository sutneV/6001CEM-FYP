"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, ImagePlus, Loader2, Save, X, Sparkles, PawPrint, Heart, Shield, Home, Star, Camera, Dog, Cat, Activity, Zap, Calendar, MoreHorizontal, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { imageUploadService } from "@/lib/utils/image-upload"
import { toast } from "sonner"
import Link from "next/link"
import { petsService } from "@/lib/services/pets"
import { Pet } from "@/lib/db/schema"

export default function EditPetPage() {
  const router = useRouter()
  const params = useParams()
  const petId = params.id as string

  const [activeSection, setActiveSection] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formProgress, setFormProgress] = useState(25)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isUploaded: boolean; file?: File }[]>([])
  const [isEnhancingStory, setIsEnhancingStory] = useState(false)

  // Form state
  const [petData, setPetData] = useState({
    name: "",
    type: "dog",
    breed: "",
    age: "",
    gender: "",
    size: "",
    weight: "",
    color: "",
    vaccinated: false,
    neutered: false,
    microchipped: false,
    houseTrained: false,
    goodWithKids: false,
    goodWithDogs: false,
    goodWithCats: false,
    specialNeeds: false,
    specialNeedsDescription: "",
    description: "",
    story: "",
  })

  // Fetch pet data on mount
  useEffect(() => {
    if (petId) {
      fetchPetData()
    }
  }, [petId])

  const fetchPetData = async () => {
    try {
      setIsLoading(true)
      const pet: Pet = await petsService.getPet(petId)

      // Populate form with existing pet data
      setPetData({
        name: pet.name || "",
        type: pet.type || "dog",
        breed: pet.breed || "",
        age: pet.age || "",
        gender: pet.gender || "",
        size: pet.size || "",
        weight: pet.weight ? pet.weight.toString() : "",
        color: pet.color || "",
        vaccinated: pet.vaccinated || false,
        neutered: pet.neutered || false,
        microchipped: pet.microchipped || false,
        houseTrained: pet.houseTrained || false,
        goodWithKids: pet.goodWithKids || false,
        goodWithDogs: pet.goodWithDogs || false,
        goodWithCats: pet.goodWithCats || false,
        specialNeeds: pet.specialNeeds || false,
        specialNeedsDescription: pet.specialNeedsDescription || "",
        description: pet.description || "",
        story: pet.story || "",
      })

      // Set up existing images
      if (pet.images && Array.isArray(pet.images)) {
        setImages(pet.images)
        setImagePreviews(pet.images.map(url => ({ url, isUploaded: true })))
      }

    } catch (error) {
      toast.error('Failed to fetch pet details')
      console.error('Error fetching pet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPetData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSectionChange = (value: string) => {
    setActiveSection(value)

    // Update progress based on section
    switch (value) {
      case "basic":
        setFormProgress(25)
        break
      case "physical":
        setFormProgress(50)
        break
      case "health":
        setFormProgress(75)
        break
      case "media":
        setFormProgress(100)
        break
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    // Validate images
    const validation = imageUploadService.validateImages(files)
    if (!validation.valid) {
      toast.error(validation.error!)
      return
    }

    // Check total image count
    if (imagePreviews.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setIsUploading(true)

    try {
      // Create previews immediately for better UX (don't upload yet)
      const newPreviews = await Promise.all(
        files.map(async (file) => {
          const previewUrl = await imageUploadService.createImagePreview(file)
          return { url: previewUrl, isUploaded: false, file: file } // Store the actual file
        })
      )

      setImagePreviews(prev => [...prev, ...newPreviews])
      toast.success(`${files.length} image(s) ready for upload`)
    } catch (error) {
      console.error('Preview creation failed:', error)
      toast.error('Failed to create image previews. Please try again.')
    } finally {
      setIsUploading(false)
      // Clear the input
      event.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const preview = imagePreviews[index]

    // Remove from previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))

    // If the image was already uploaded (existing image), also remove from images array
    if (preview?.isUploaded && !preview.file) {
      const imageUrl = preview.url
      setImages((prev) => prev.filter(url => url !== imageUrl))
    }

    toast.success('Image removed')
  }

  const enhanceStoryWithAI = async () => {
    if (!petData.story.trim()) {
      toast.error('Please write a short story first before enhancing it with AI')
      return
    }

    setIsEnhancingStory(true)

    try {
      const response = await fetch('/api/enhance-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petData: {
            name: petData.name,
            type: petData.type,
            breed: petData.breed,
            age: petData.age,
            gender: petData.gender,
            size: petData.size,
            description: petData.description
          },
          originalStory: petData.story
        })
      })

      if (response.ok) {
        const result = await response.json()
        setPetData(prev => ({ ...prev, story: result.enhancedStory }))
        toast.success('Story enhanced with AI successfully!')
      } else {
        throw new Error('Failed to enhance story')
      }
    } catch (error) {
      console.error('Error enhancing story:', error)
      toast.error('Failed to enhance story. Please try again.')
    } finally {
      setIsEnhancingStory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload new images first (only files that haven't been uploaded yet)
      let finalImageUrls = [...images] // Start with existing images

      const newFilesToUpload = imagePreviews
        .filter(preview => !preview.isUploaded && preview.file)
        .map(preview => preview.file!)

      if (newFilesToUpload.length > 0) {
        toast.info('Uploading new images...')
        const uploadedUrls = await imageUploadService.uploadImages(newFilesToUpload)
        finalImageUrls = [...finalImageUrls, ...uploadedUrls]
        toast.success('Images uploaded successfully')
      }

      // Prepare the data for submission
      const petSubmissionData = {
        name: petData.name,
        type: petData.type as any,
        breed: petData.breed || null,
        age: petData.age as any,
        gender: petData.gender as any,
        size: petData.size as any,
        weight: petData.weight ? parseInt(petData.weight) : null,
        color: petData.color || null,
        description: petData.description,
        story: petData.story || null,
        images: finalImageUrls, // Use the combined list of existing + new images
        vaccinated: petData.vaccinated,
        neutered: petData.neutered,
        microchipped: petData.microchipped,
        houseTrained: petData.houseTrained,
        goodWithKids: petData.goodWithKids,
        goodWithDogs: petData.goodWithDogs,
        goodWithCats: petData.goodWithCats,
        specialNeeds: petData.specialNeeds,
        specialNeedsDescription: petData.specialNeeds ? petData.specialNeedsDescription : null,
      }

      await petsService.updatePet(petId, petSubmissionData)
      setIsSubmitting(false)
      setShowSuccess(true)

      // Redirect after success message
      setTimeout(() => {
        router.push(`/dashboard/shelter/pets/${petId}`)
      }, 2000)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Error updating pet:', error)
      toast.error('Failed to update pet. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pet data...</p>
        </div>
      </div>
    )
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: PawPrint, color: "teal" },
    { id: "physical", label: "Physical", icon: Activity, color: "blue" },
    { id: "health", label: "Health", icon: Shield, color: "green" },
    { id: "behavior", label: "Behavior", icon: Home, color: "purple" },
    { id: "story", label: "Photos & Story", icon: Heart, color: "pink" }
  ]

  const getCurrentSection = () => sections.find(s => s.id === activeSection) || sections[0]

  const calculateProgress = () => {
    const totalFields = 8
    let completedFields = 0

    if (petData.name) completedFields++
    if (petData.description) completedFields++
    if (petData.age) completedFields++
    if (petData.gender) completedFields++
    if (petData.type) completedFields++
    if (petData.breed) completedFields++
    if (imagePreviews.length > 0) completedFields++ // Check previews instead of uploaded images
    if (petData.story) completedFields++

    return Math.round((completedFields / totalFields) * 100)
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-teal-500 mr-2" />
          Essential Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Pet Name *</Label>
            <Input
              id="name"
              name="name"
              value={petData.name}
              onChange={handleInputChange}
              placeholder="e.g., Buddy, Luna, Max"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">Pet Type *</Label>
            <Select value={petData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">🐕 Dog</SelectItem>
                <SelectItem value="cat">🐱 Cat</SelectItem>
                <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                <SelectItem value="bird">🐦 Bird</SelectItem>
                <SelectItem value="hamster">🐹 Hamster</SelectItem>
                <SelectItem value="guinea_pig">🐹 Guinea Pig</SelectItem>
                <SelectItem value="reptile">🦎 Reptile</SelectItem>
                <SelectItem value="fish">🐠 Fish</SelectItem>
                <SelectItem value="other">🐾 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed" className="text-sm font-medium text-gray-700">Breed</Label>
            <Input
              id="breed"
              name="breed"
              value={petData.breed}
              onChange={handleInputChange}
              placeholder="e.g., Golden Retriever, Persian, Mixed"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age *</Label>
            <Select value={petData.age} onValueChange={(value) => handleSelectChange("age", value)} required>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="puppy">🐶 Puppy/Kitten (0-1 year)</SelectItem>
                <SelectItem value="young">⚡ Young (1-3 years)</SelectItem>
                <SelectItem value="adult">🐕 Adult (3-7 years)</SelectItem>
                <SelectItem value="senior">🧓 Senior (7+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Label className="text-sm font-medium text-gray-700">Gender *</Label>
          <RadioGroup
            value={petData.gender}
            onValueChange={(value) => handleRadioChange("gender", value)}
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="text-sm text-gray-700">♂ Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="text-sm text-gray-700">♀ Female</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">Short Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={petData.description}
            onChange={handleInputChange}
            placeholder="A brief, appealing description of the pet's personality and traits..."
            rows={3}
            className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            required
          />
          <p className="text-xs text-gray-500">
            This will be the main description potential adopters see first.
          </p>
        </div>
      </div>
    </div>
  )

  const renderPhysicalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-blue-500 mr-2" />
          Physical Characteristics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">Size</Label>
            <Select value={petData.size} onValueChange={(value) => handleSelectChange("size", value)}>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (0-25 lbs)</SelectItem>
                <SelectItem value="medium">Medium (26-60 lbs)</SelectItem>
                <SelectItem value="large">Large (61-100 lbs)</SelectItem>
                <SelectItem value="extra_large">Extra Large (100+ lbs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={petData.weight}
              onChange={handleInputChange}
              placeholder="e.g., 25"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color/Markings</Label>
            <Input
              id="color"
              name="color"
              value={petData.color}
              onChange={handleInputChange}
              placeholder="e.g., Golden, Black & White, Tabby"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderHealthInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          Health Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="vaccinated"
              checked={petData.vaccinated}
              onCheckedChange={(checked) => handleCheckboxChange("vaccinated", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="vaccinated" className="text-sm font-medium text-gray-700">💉 Vaccinated</Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="neutered"
              checked={petData.neutered}
              onCheckedChange={(checked) => handleCheckboxChange("neutered", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="neutered" className="text-sm font-medium text-gray-700">✂️ Spayed/Neutered</Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="microchipped"
              checked={petData.microchipped}
              onCheckedChange={(checked) => handleCheckboxChange("microchipped", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="microchipped" className="text-sm font-medium text-gray-700">🔍 Microchipped</Label>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="specialNeeds"
              checked={petData.specialNeeds}
              onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="specialNeeds" className="text-sm font-medium text-gray-700">⚠️ This pet has special needs</Label>
          </div>

          {petData.specialNeeds && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="specialNeedsDescription" className="text-sm font-medium text-gray-700">Special Needs Description</Label>
              <Textarea
                id="specialNeedsDescription"
                name="specialNeedsDescription"
                value={petData.specialNeedsDescription}
                onChange={handleInputChange}
                placeholder="Describe any special medical needs, dietary requirements, or care instructions..."
                rows={3}
                className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderBehaviorInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Home className="h-5 w-5 text-purple-500 mr-2" />
          Behavioral Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="houseTrained"
              checked={petData.houseTrained}
              onCheckedChange={(checked) => handleCheckboxChange("houseTrained", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="houseTrained" className="text-sm font-medium text-gray-700">🏠 House Trained</Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="goodWithKids"
              checked={petData.goodWithKids}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithKids", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="goodWithKids" className="text-sm font-medium text-gray-700">👶 Good with Children</Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="goodWithDogs"
              checked={petData.goodWithDogs}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithDogs", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="goodWithDogs" className="text-sm font-medium text-gray-700">🐕 Good with Dogs</Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="goodWithCats"
              checked={petData.goodWithCats}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithCats", checked as boolean)}
              className="border-gray-300"
            />
            <Label htmlFor="goodWithCats" className="text-sm font-medium text-gray-700">🐱 Good with Cats</Label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStoryAndPhotos = () => (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Camera className="h-5 w-5 text-pink-500 mr-2" />
          Pet Photos
        </h3>

        {/* Image Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer"
          onClick={() => {
            const input = document.getElementById('image-upload') as HTMLInputElement
            input?.click()
          }}
        >
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="sr-only"
            disabled={isUploading}
          />
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-sm font-medium text-teal-600 hover:text-teal-500 mb-2">
            {isUploading ? "Uploading..." : "Click to upload photos"}
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (max 5 photos)</p>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.url}
                  alt={`Pet photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border shadow-sm"
                />
                {isUploading && !preview.isUploaded && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pet Story */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2" />
            Pet's Story
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enhanceStoryWithAI}
            disabled={isEnhancingStory || !petData.story.trim()}
            className="border-gray-300 hover:border-teal-500"
          >
            {isEnhancingStory ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance with AI
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Textarea
            id="story"
            name="story"
            value={petData.story}
            onChange={handleInputChange}
            placeholder="Share this pet's unique story, personality, likes, dislikes, and what makes them special..."
            rows={8}
            className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 resize-none"
          />
          <p className="text-xs text-gray-500">
            A compelling story helps potential adopters connect emotionally with the pet.
          </p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "basic": return renderBasicInfo()
      case "physical": return renderPhysicalInfo()
      case "health": return renderHealthInfo()
      case "behavior": return renderBehaviorInfo()
      case "story": return renderStoryAndPhotos()
      default: return renderBasicInfo()
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Left Sidebar - Navigation & Preview */}
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

        {/* Pet Preview */}
        <div className="p-4 border-b border-gray-200">
          <div className="text-center mb-4">
            <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-white shadow-lg">
              <AvatarImage
                src={imagePreviews.length > 0 ? imagePreviews[0].url : "/placeholder.svg"}
                alt={petData.name || "Edit Pet"}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-teal-100 text-teal-600">
                {petData.name ? petData.name[0] : '?'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {petData.name || "Edit Pet"}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              {petData.type === 'dog' ? (
                <Dog className="h-4 w-4 text-gray-500" />
              ) : petData.type === 'cat' ? (
                <Cat className="h-4 w-4 text-gray-500" />
              ) : (
                <PawPrint className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-gray-600 capitalize">{petData.type}</span>
              {petData.breed && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{petData.breed}</span>
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Form Progress</span>
              <span className="text-xs text-gray-500">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3">FORM SECTIONS</h3>
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-teal-50 border border-teal-200 text-teal-700 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-teal-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        {/* Submit Button */}
        <div className="p-4 border-t border-gray-200">
          {showSuccess ? (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Pet Updated Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Redirecting you to the pet details page...
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !petData.name || !petData.description}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Pet...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Pet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Right Side - Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(getCurrentSection().icon, {
                className: `h-6 w-6 text-${getCurrentSection().color}-500`
              })}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getCurrentSection().label}
                </h2>
                <p className="text-sm text-gray-500">
                  Edit your pet's {getCurrentSection().label.toLowerCase()} information
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  )
}