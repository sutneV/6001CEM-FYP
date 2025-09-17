"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, ImagePlus, Loader2, Save, X, Upload, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { imageUploadService } from "@/lib/utils/image-upload"
import { toast } from "sonner"
import Link from "next/link"
import { petsService } from "@/lib/services/pets"
import { Pet } from "@/lib/db/schema"

export default function EditPetPage() {
  const router = useRouter()
  const params = useParams()
  const petId = params.id as string

  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formProgress, setFormProgress] = useState(25)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isUploaded: boolean }[]>([])
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

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update progress based on tab
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
      // Create previews immediately for better UX
      const newPreviews = await Promise.all(
        files.map(async (file) => {
          const previewUrl = await imageUploadService.createImagePreview(file)
          return { url: previewUrl, isUploaded: false }
        })
      )

      setImagePreviews(prev => [...prev, ...newPreviews])

      // Upload images to server
      const uploadedUrls = await imageUploadService.uploadImages(files)

      // Update images state with uploaded URLs
      setImages(prev => [...prev, ...uploadedUrls])

      // Update previews to mark as uploaded
      setImagePreviews(prev => {
        const updated = [...prev]
        let uploadIndex = 0
        for (let i = updated.length - newPreviews.length; i < updated.length; i++) {
          if (!updated[i].isUploaded) {
            updated[i] = { url: uploadedUrls[uploadIndex], isUploaded: true }
            uploadIndex++
          }
        }
        return updated
      })

      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload images. Please try again.')

      // Remove failed previews
      setImagePreviews(prev => prev.slice(0, prev.length - files.length))
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

    // If the image was uploaded, also remove from images array
    if (preview?.isUploaded) {
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
        images: images,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shelter/pets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Pet</h1>
            <p className="text-muted-foreground">Update pet information and details</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Form Progress</span>
              <span className="text-sm text-muted-foreground">{formProgress}% Complete</span>
            </div>
            <Progress value={formProgress} className="h-2 [&>div]:bg-teal-500" />
          </div>
        </CardContent>
      </Card>

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Pet Updated Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            The pet information has been updated. Redirecting you to the pet details page...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="health">Health & Behavior</TabsTrigger>
            <TabsTrigger value="media">Photos & Story</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the pet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={petData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Buddy, Luna, Max"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Pet Type *</Label>
                    <Select value={petData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="hamster">Hamster</SelectItem>
                        <SelectItem value="guinea_pig">Guinea Pig</SelectItem>
                        <SelectItem value="reptile">Reptile</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      name="breed"
                      value={petData.breed}
                      onChange={handleInputChange}
                      placeholder="e.g., Golden Retriever, Persian, Mixed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Select value={petData.age} onValueChange={(value) => handleSelectChange("age", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="puppy">Puppy/Kitten (0-1 year)</SelectItem>
                        <SelectItem value="young">Young (1-3 years)</SelectItem>
                        <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                        <SelectItem value="senior">Senior (7+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={petData.gender}
                    onValueChange={(value) => handleRadioChange("gender", value)}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={petData.description}
                    onChange={handleInputChange}
                    placeholder="A brief, appealing description of the pet's personality and traits..."
                    rows={3}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be the main description potential adopters see first.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Characteristics Tab */}
          <TabsContent value="physical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Physical Characteristics</CardTitle>
                <CardDescription>Details about the pet's appearance and size</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Select value={petData.size} onValueChange={(value) => handleSelectChange("size", value)}>
                      <SelectTrigger>
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
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={petData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color/Markings</Label>
                    <Input
                      id="color"
                      name="color"
                      value={petData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., Golden, Black & White, Tabby"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health & Behavior Tab */}
          <TabsContent value="health" className="space-y-4">
            {/* Health Information */}
            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
                <CardDescription>Medical status and health details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaccinated"
                      checked={petData.vaccinated}
                      onCheckedChange={(checked) => handleCheckboxChange("vaccinated", checked as boolean)}
                    />
                    <Label htmlFor="vaccinated">Vaccinated</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="neutered"
                      checked={petData.neutered}
                      onCheckedChange={(checked) => handleCheckboxChange("neutered", checked as boolean)}
                    />
                    <Label htmlFor="neutered">Spayed/Neutered</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="microchipped"
                      checked={petData.microchipped}
                      onCheckedChange={(checked) => handleCheckboxChange("microchipped", checked as boolean)}
                    />
                    <Label htmlFor="microchipped">Microchipped</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Information */}
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Information</CardTitle>
                <CardDescription>Temperament and compatibility details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="houseTrained"
                      checked={petData.houseTrained}
                      onCheckedChange={(checked) => handleCheckboxChange("houseTrained", checked as boolean)}
                    />
                    <Label htmlFor="houseTrained">House Trained</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithKids"
                      checked={petData.goodWithKids}
                      onCheckedChange={(checked) => handleCheckboxChange("goodWithKids", checked as boolean)}
                    />
                    <Label htmlFor="goodWithKids">Good with Children</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithDogs"
                      checked={petData.goodWithDogs}
                      onCheckedChange={(checked) => handleCheckboxChange("goodWithDogs", checked as boolean)}
                    />
                    <Label htmlFor="goodWithDogs">Good with Dogs</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="goodWithCats"
                      checked={petData.goodWithCats}
                      onCheckedChange={(checked) => handleCheckboxChange("goodWithCats", checked as boolean)}
                    />
                    <Label htmlFor="goodWithCats">Good with Cats</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Special Needs</CardTitle>
                <CardDescription>Any special requirements or medical conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="specialNeeds"
                    checked={petData.specialNeeds}
                    onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", checked as boolean)}
                  />
                  <Label htmlFor="specialNeeds">This pet has special needs</Label>
                </div>

                {petData.specialNeeds && (
                  <div className="space-y-2">
                    <Label htmlFor="specialNeedsDescription">Special Needs Description</Label>
                    <Textarea
                      id="specialNeedsDescription"
                      name="specialNeedsDescription"
                      value={petData.specialNeedsDescription}
                      onChange={handleInputChange}
                      placeholder="Describe any special medical needs, dietary requirements, or care instructions..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media & Story Tab */}
          <TabsContent value="media" className="space-y-4">
            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Pet Photos</CardTitle>
                <CardDescription>Upload up to 5 high-quality photos of the pet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          {isUploading ? "Uploading..." : "Click to upload photos"}
                        </span>
                        <Input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          disabled={isUploading}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`Pet photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {!preview.isUploaded && (
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
              </CardContent>
            </Card>

            {/* Pet Story */}
            <Card>
              <CardHeader>
                <CardTitle>Pet's Story</CardTitle>
                <CardDescription>Tell potential adopters about this pet's background and personality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="story">Pet's Story</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={enhanceStoryWithAI}
                      disabled={isEnhancingStory || !petData.story.trim()}
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
                  <Textarea
                    id="story"
                    name="story"
                    value={petData.story}
                    onChange={handleInputChange}
                    placeholder="Share this pet's unique story, personality, likes, dislikes, and what makes them special..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    A compelling story helps potential adopters connect emotionally with the pet.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/dashboard/shelter/pets">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  const tabs = ["basic", "physical", "health", "media"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex > 0) {
                    handleTabChange(tabs[currentIndex - 1])
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}

            {activeTab === "media" ? (
              <Button type="submit" disabled={isSubmitting}>
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
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  const tabs = ["basic", "physical", "health", "media"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    handleTabChange(tabs[currentIndex + 1])
                  }
                }}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}