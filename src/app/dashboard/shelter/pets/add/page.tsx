"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle,
  ImagePlus,
  Loader2,
  Save,
  X,
  Sparkles,
  PawPrint,
  Heart,
  Shield,
  Home,
  Star,
  Camera,
  Dog,
  Cat,
  Activity,
  Zap,
  Calendar,
  MoreHorizontal
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { imageUploadService } from "@/lib/utils/image-upload"
import { toast } from "sonner"
import Link from "next/link"

export default function AddPetPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const sections = [
    { id: "basic", label: "Basic Info", icon: PawPrint, color: "teal" },
    { id: "physical", label: "Physical", icon: Activity, color: "blue" },
    { id: "health", label: "Health", icon: Shield, color: "green" },
    { id: "behavior", label: "Behavior", icon: Home, color: "purple" },
    { id: "story", label: "Photos & Story", icon: Heart, color: "pink" }
  ]

  const getCurrentSection = () => sections.find(s => s.id === activeSection) || sections[0]

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
    // Remove from previews (no need to delete from storage since we haven't uploaded yet)
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
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

    // Basic validation
    if (!petData.name || !petData.description || !petData.age || !petData.gender) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images first (only now when creating the pet)
      let uploadedImageUrls: string[] = []

      if (imagePreviews.length > 0) {
        toast.info('Uploading images...')

        // Get files from previews that haven't been uploaded yet
        const filesToUpload = imagePreviews
          .filter(preview => !preview.isUploaded && preview.file)
          .map(preview => preview.file!)

        if (filesToUpload.length > 0) {
          uploadedImageUrls = await imageUploadService.uploadImages(filesToUpload)
          toast.success('Images uploaded successfully')
        }
      }

      // Import the pets service
      const { petsService } = await import('@/lib/services/pets')

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
        images: uploadedImageUrls, // Use the newly uploaded URLs
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

      await petsService.createPet(petSubmissionData)
      setIsSubmitting(false)
      setShowSuccess(true)

      // Redirect after success message
      setTimeout(() => {
        router.push("/dashboard/shelter/pets")
      }, 2000)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Error creating pet:', error)
      toast.error('Failed to create pet. Please try again.')
    }
  }

  const getFormProgress = () => {
    const totalFields = 8 // Essential fields
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
                <SelectItem value="baby">🐶 Baby/Puppy/Kitten (0-1 year)</SelectItem>
                <SelectItem value="young">🐕 Young (1-3 years)</SelectItem>
                <SelectItem value="adult">🐕‍🦺 Adult (3-7 years)</SelectItem>
                <SelectItem value="senior">🐕‍🦺 Senior (7+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <Label className="text-sm font-medium text-gray-700">Gender *</Label>
          <RadioGroup
            value={petData.gender}
            onValueChange={(value) => handleRadioChange("gender", value)}
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" className="text-teal-500" />
              <Label htmlFor="male" className="text-sm text-gray-700">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" className="text-teal-500" />
              <Label htmlFor="female" className="text-sm text-gray-700">Female</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2 mt-6">
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
                <SelectItem value="xlarge">Extra Large (100+ lbs)</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="vaccinated"
              checked={petData.vaccinated}
              onCheckedChange={(checked) => handleCheckboxChange("vaccinated", checked as boolean)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <Label htmlFor="vaccinated" className="text-sm font-medium text-gray-700">Vaccinated</Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="neutered"
              checked={petData.neutered}
              onCheckedChange={(checked) => handleCheckboxChange("neutered", checked as boolean)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <Label htmlFor="neutered" className="text-sm font-medium text-gray-700">Spayed/Neutered</Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="microchipped"
              checked={petData.microchipped}
              onCheckedChange={(checked) => handleCheckboxChange("microchipped", checked as boolean)}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <Label htmlFor="microchipped" className="text-sm font-medium text-gray-700">Microchipped</Label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Checkbox
              id="specialNeeds"
              checked={petData.specialNeeds}
              onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", checked as boolean)}
              className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <Label htmlFor="specialNeeds" className="text-sm font-medium text-gray-700">This pet has special needs</Label>
          </div>

          {petData.specialNeeds && (
            <div className="space-y-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="houseTrained"
              checked={petData.houseTrained}
              onCheckedChange={(checked) => handleCheckboxChange("houseTrained", checked as boolean)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="houseTrained" className="text-sm font-medium text-gray-700">House Trained</Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="goodWithKids"
              checked={petData.goodWithKids}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithKids", checked as boolean)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="goodWithKids" className="text-sm font-medium text-gray-700">Good with Children</Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="goodWithDogs"
              checked={petData.goodWithDogs}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithDogs", checked as boolean)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="goodWithDogs" className="text-sm font-medium text-gray-700">Good with Dogs</Label>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Checkbox
              id="goodWithCats"
              checked={petData.goodWithCats}
              onCheckedChange={(checked) => handleCheckboxChange("goodWithCats", checked as boolean)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <Label htmlFor="goodWithCats" className="text-sm font-medium text-gray-700">Good with Cats</Label>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={preview.url}
                    alt={`Pet photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isUploading && !preview.isUploaded && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
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
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
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
            rows={6}
            className="resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500"
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
                alt={petData.name || "New Pet"}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-teal-100 text-teal-600">
                {petData.name ? petData.name[0] : '?'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {petData.name || "New Pet"}
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
              <span className="text-xs text-gray-500">{getFormProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getFormProgress()}%` }}
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
              <AlertTitle className="text-green-800">Pet Added Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Redirecting you to the pets page...
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
                  Adding Pet...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Pet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(getCurrentSection().icon, {
                className: `h-6 w-6 text-${getCurrentSection().color}-500`
              })}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getCurrentSection().label}</h2>
                <p className="text-gray-600">
                  {activeSection === "basic" && "Essential information about the pet"}
                  {activeSection === "physical" && "Physical characteristics and appearance"}
                  {activeSection === "health" && "Health status and medical information"}
                  {activeSection === "behavior" && "Behavioral traits and compatibility"}
                  {activeSection === "story" && "Photos and personal story"}
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