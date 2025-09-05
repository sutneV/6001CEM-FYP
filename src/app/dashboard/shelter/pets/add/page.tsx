"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function AddPetPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to enhance story')
      }

      const { enhancedStory } = await response.json()
      
      setPetData(prev => ({ ...prev, story: enhancedStory }))
      toast.success('Story enhanced successfully!')
    } catch (error) {
      console.error('Error enhancing story:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to enhance story. Please try again.')
    } finally {
      setIsEnhancingStory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
      // Import toast dynamically to show error
      const { toast } = await import('sonner')
      toast.error('Failed to create pet. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Add New Pet</h1>
          <p className="text-muted-foreground">Add a new pet to your shelter for adoption</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {showSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Pet has been successfully added to your shelter. Redirecting to pets list...
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Pet Information</CardTitle>
              <CardDescription>Fill out the details below to add a new pet for adoption</CardDescription>
              <div className="mt-2">
                <Progress value={formProgress} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Basic Info</span>
                  <span>Physical</span>
                  <span>Health & Behavior</span>
                  <span>Photos & Story</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="physical">Physical</TabsTrigger>
                <TabsTrigger value="health">Health & Behavior</TabsTrigger>
                <TabsTrigger value="media">Photos & Story</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the basic details about the pet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Pet Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter pet name"
                          value={petData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Pet Type <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          defaultValue={petData.type}
                          onValueChange={(value) => handleRadioChange("type", value)}
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dog" id="dog" />
                            <Label htmlFor="dog">Dog</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cat" id="cat" />
                            <Label htmlFor="cat">Cat</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rabbit" id="rabbit" />
                            <Label htmlFor="rabbit">Rabbit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bird" id="bird" />
                            <Label htmlFor="bird">Bird</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="breed">Breed</Label>
                        <Input
                          id="breed"
                          name="breed"
                          placeholder="Enter breed"
                          value={petData.breed}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">
                          Age <span className="text-red-500">*</span>
                        </Label>
                        <Select onValueChange={(value) => handleSelectChange("age", value)} defaultValue={petData.age}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baby">Baby (0-6 months)</SelectItem>
                            <SelectItem value="young">Young (6 months-2 years)</SelectItem>
                            <SelectItem value="adult">Adult (2-8 years)</SelectItem>
                            <SelectItem value="senior">Senior (8+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        defaultValue={petData.gender}
                        onValueChange={(value) => handleRadioChange("gender", value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unknown" id="unknown" />
                          <Label htmlFor="unknown">Unknown</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleTabChange("physical")}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="physical">
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Characteristics</CardTitle>
                    <CardDescription>Describe the physical attributes of the pet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Select
                          onValueChange={(value) => handleSelectChange("size", value)}
                          defaultValue={petData.size}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="xlarge">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          placeholder="Enter weight in kg"
                          value={petData.weight}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        name="color"
                        placeholder="Enter color(s)"
                        value={petData.color}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="specialNeeds"
                          checked={petData.specialNeeds}
                          onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", checked as boolean)}
                        />
                        <Label htmlFor="specialNeeds">This pet has special needs</Label>
                      </div>

                      {petData.specialNeeds && (
                        <div className="mt-2">
                          <Label htmlFor="specialNeedsDescription">Special Needs Description</Label>
                          <Textarea
                            id="specialNeedsDescription"
                            name="specialNeedsDescription"
                            placeholder="Describe special needs or requirements"
                            value={petData.specialNeedsDescription}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleTabChange("basic")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => handleTabChange("health")}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="health">
                <Card>
                  <CardHeader>
                    <CardTitle>Health & Behavior</CardTitle>
                    <CardDescription>Provide information about the pet's health and behavior</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Medical Information</Label>
                          <div className="space-y-2">
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
                        </div>

                        <div className="space-y-2">
                          <Label>Behavior & Training</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="houseTrained"
                                checked={petData.houseTrained}
                                onCheckedChange={(checked) => handleCheckboxChange("houseTrained", checked as boolean)}
                              />
                              <Label htmlFor="houseTrained">House Trained</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Good With</Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="goodWithKids"
                              checked={petData.goodWithKids}
                              onCheckedChange={(checked) => handleCheckboxChange("goodWithKids", checked as boolean)}
                            />
                            <Label htmlFor="goodWithKids">Kids</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="goodWithDogs"
                              checked={petData.goodWithDogs}
                              onCheckedChange={(checked) => handleCheckboxChange("goodWithDogs", checked as boolean)}
                            />
                            <Label htmlFor="goodWithDogs">Dogs</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="goodWithCats"
                              checked={petData.goodWithCats}
                              onCheckedChange={(checked) => handleCheckboxChange("goodWithCats", checked as boolean)}
                            />
                            <Label htmlFor="goodWithCats">Cats</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleTabChange("physical")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={() => handleTabChange("media")}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Photos & Story</CardTitle>
                    <CardDescription>Upload photos and share the pet's story</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pet Photos</Label>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative rounded-md overflow-hidden border h-40">
                            <img
                              src={preview.url}
                              alt={`Pet image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {!preview.isUploaded && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeImage(index)}
                              disabled={!preview.isUploaded}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {imagePreviews.length < 5 && (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={isUploading}
                            />
                            <div className="border border-dashed rounded-md flex flex-col items-center justify-center h-40 hover:bg-muted/50 transition-colors">
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
                                  <p className="text-sm text-muted-foreground">Uploading...</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground">Click to upload photos</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Upload up to 5 photos (JPG, PNG, WEBP). Max 5MB each. First photo will be the main display image.
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {imagePreviews.length}/5 photos
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Short Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description for listings (max 150 characters)"
                        value={petData.description}
                        onChange={handleInputChange}
                        maxLength={150}
                        required
                      />
                      <div className="text-xs text-right text-muted-foreground">{petData.description.length}/150</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="story">Pet's Story</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={enhanceStoryWithAI}
                          disabled={isEnhancingStory || !petData.story.trim()}
                          className="text-xs"
                        >
                          {isEnhancingStory ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-1 h-3 w-3" />
                              Enhance with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="story"
                        name="story"
                        placeholder="Share this pet's background, personality, and any special stories. Write a short story and click 'Enhance with AI' to make it more engaging!"
                        value={petData.story}
                        onChange={handleInputChange}
                        className="min-h-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Write a brief story about the pet, then use AI to make it more engaging and heartwarming for potential adopters.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleTabChange("health")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Pet
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </>
      )}
    </div>
  )
}
