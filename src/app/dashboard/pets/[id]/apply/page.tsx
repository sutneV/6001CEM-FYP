"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle,
  FileText,
  Heart,
  Home,
  Info,
  Loader2,
  MoreHorizontal,
  PawPrint,
  Save,
  User,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { petsService, PetWithShelter } from "@/lib/services/pets"
import { applicationsService } from "@/lib/services/applications"

export default function PetApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const petId = params.id as string

  const [pet, setPet] = useState<PetWithShelter | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const hasShownDuplicateError = useRef(false)
  const hasLoadedDraft = useRef(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: undefined as Date | undefined,
    occupation: "",

    // Living Situation
    housingType: "",
    ownRent: "",
    address: "",
    landlordPermission: "",
    yardType: "",
    householdSize: "",

    // Pet Experience
    previousPets: "",
    currentPets: "",
    petExperience: "",
    veterinarian: "",

    // Lifestyle
    workSchedule: "",
    exerciseCommitment: "",
    travelFrequency: "",
    petPreferences: "",

    // Household
    householdMembers: "",
    allergies: "",
    childrenAges: "",

    // Agreement
    references: "",
    emergencyContact: "",
    agreements: [] as number[],
  })

  const sections = [
    { id: "personal", label: "Personal Info", icon: User, color: "teal" },
    { id: "living", label: "Living Situation", icon: Home, color: "blue" },
    { id: "experience", label: "Pet Experience", icon: PawPrint, color: "amber" },
    { id: "lifestyle", label: "Lifestyle", icon: Heart, color: "pink" },
    { id: "household", label: "Household", icon: Users, color: "indigo" },
    { id: "agreement", label: "Agreement", icon: FileText, color: "emerald" }
  ]

  const getCurrentSection = () => sections.find(s => s.id === activeSection) || sections[0]

  // Pre-populate user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [user])

  useEffect(() => {
    if (petId) {
      fetchPet(petId)
    }
  }, [petId])

  const fetchPet = async (id: string) => {
    try {
      setLoading(true)
      const data = await petsService.getPetById(id)
      setPet(data)

      // Check if user already has an application for this pet
      if (user) {
        const userApplications = await applicationsService.getApplications(user)

        // Check for active application (not draft, not withdrawn)
        const activeApplication = userApplications.find(
          app => app.pet.id === id && app.status !== 'withdrawn' && app.status !== 'draft'
        )

        if (activeApplication && !hasShownDuplicateError.current) {
          hasShownDuplicateError.current = true
          toast.error('You already have an active application for this pet')
          router.push('/dashboard/applications')
          return
        }

        // Load existing draft if available
        const draftApplication = userApplications.find(
          app => app.pet.id === id && app.status === 'draft'
        )

        if (draftApplication && !hasLoadedDraft.current) {
          hasLoadedDraft.current = true
          // Pre-fill form with draft data
          setFormData({
            firstName: draftApplication.firstName || "",
            lastName: draftApplication.lastName || "",
            email: draftApplication.email || "",
            phone: draftApplication.phone || "",
            dateOfBirth: draftApplication.dateOfBirth ? new Date(draftApplication.dateOfBirth) : undefined,
            occupation: draftApplication.occupation || "",
            housingType: draftApplication.housingType || "",
            ownRent: draftApplication.ownRent || "",
            address: draftApplication.address || "",
            landlordPermission: draftApplication.landlordPermission || "",
            yardType: draftApplication.yardType || "",
            householdSize: draftApplication.householdSize?.toString() || "",
            previousPets: draftApplication.previousPets || "",
            currentPets: draftApplication.currentPets || "",
            petExperience: draftApplication.petExperience || "",
            veterinarian: draftApplication.veterinarian || "",
            workSchedule: draftApplication.workSchedule || "",
            exerciseCommitment: draftApplication.exerciseCommitment || "",
            travelFrequency: draftApplication.travelFrequency || "",
            petPreferences: draftApplication.petPreferences || "",
            householdMembers: draftApplication.householdMembers || "",
            allergies: draftApplication.allergies || "",
            childrenAges: draftApplication.childrenAges || "",
            references: draftApplication.references || "",
            emergencyContact: draftApplication.emergencyContact || "",
            agreements: draftApplication.agreements || [],
          })
          toast.success('Draft application loaded. Continue where you left off!')
        }
      }
    } catch (error) {
      console.error('Error fetching pet:', error)
      toast.error('Failed to load pet information')
      router.push('/dashboard/pets')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Helper functions for form validation
  const isFieldFilled = (field: string) => {
    const value = formData[field as keyof typeof formData]
    if (field === 'dateOfBirth') {
      return !!value
    }
    if (field === 'agreements') {
      return Array.isArray(value) && value.length >= 6
    }
    return value !== undefined && value !== null && value.toString().trim() !== ''
  }

  const getSectionProgress = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return 0

    let fields: string[] = []
    switch (sectionId) {
      case "personal":
        fields = ["firstName", "lastName", "email", "phone", "dateOfBirth", "occupation"]
        break
      case "living":
        fields = ["housingType", "ownRent", "address", "yardType", "householdSize"]
        if (formData.ownRent === "rent") {
          fields.push("landlordPermission")
        }
        break
      case "experience":
        fields = ["previousPets", "currentPets", "veterinarian"]
        break
      case "lifestyle":
        fields = ["workSchedule", "exerciseCommitment", "travelFrequency", "petPreferences"]
        break
      case "household":
        fields = ["householdMembers", "allergies"]
        break
      case "agreement":
        fields = ["references", "emergencyContact", "agreements"]
        break
    }

    const filledFields = fields.filter(field => isFieldFilled(field))
    return fields.length > 0 ? (filledFields.length / fields.length) * 100 : 0
  }

  const getFormProgress = () => {
    const totalSections = sections.length
    let completedSections = 0

    sections.forEach(section => {
      if (getSectionProgress(section.id) === 100) {
        completedSections++
      }
    })

    return Math.round((completedSections / totalSections) * 100)
  }

  const canSubmit = sections.every(section => getSectionProgress(section.id) === 100)

  const submitApplication = async () => {
    if (!user) {
      toast.error("Please log in to submit an application")
      return
    }

    if (!pet) {
      toast.error("Pet information not loaded")
      return
    }

    if (!canSubmit) {
      toast.error("Please complete all sections before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      await applicationsService.submitApplication(
        {
          petId: pet.id,
          ...formData,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
          householdSize: parseInt(formData.householdSize) || 0,
        },
        user
      )

      toast.success('Application submitted successfully!')
      setShowSuccess(true)

      // Redirect after success message
      setTimeout(() => {
        router.push("/dashboard/applications")
      }, 2000)
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDraft = async () => {
    if (!user || !pet) return

    try {
      await applicationsService.saveDraft(
        {
          petId: pet.id,
          ...formData,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
          householdSize: parseInt(formData.householdSize) || 0,
        },
        user
      )
      toast.success('Draft saved successfully')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 text-teal-500 mr-2" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="Enter your first name"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Enter your last name"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="your.email@example.com"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              placeholder="+60 12-345 6789"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth *</Label>
            <DatePicker
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(date) => updateFormData("dateOfBirth", date)}
              placeholder="Select your date of birth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation *</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => updateFormData("occupation", e.target.value)}
              placeholder="Your job title"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderLivingSituation = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Home className="h-5 w-5 text-blue-500 mr-2" />
          Living Situation
        </h3>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Housing Type *</Label>
              <Select
                value={formData.housingType}
                onValueChange={(value) => updateFormData("housingType", value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment/Condo</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Do you own or rent? *</Label>
              <RadioGroup
                value={formData.ownRent}
                onValueChange={(value) => updateFormData("ownRent", value)}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="own" id="own" className="text-teal-500" />
                  <Label htmlFor="own" className="text-sm text-gray-700">Own</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rent" id="rent" className="text-teal-500" />
                  <Label htmlFor="rent" className="text-sm text-gray-700">Rent</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              placeholder="Your full address in Penang"
              rows={3}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          {formData.ownRent === "rent" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Do you have landlord permission for pets? *</Label>
              <RadioGroup
                value={formData.landlordPermission}
                onValueChange={(value) => updateFormData("landlordPermission", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="landlord-yes" className="text-teal-500" />
                  <Label htmlFor="landlord-yes" className="text-sm text-gray-700">Yes, I have written permission</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="landlord-pending" className="text-teal-500" />
                  <Label htmlFor="landlord-pending" className="text-sm text-gray-700">I will get permission before adoption</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="landlord-no" className="text-teal-500" />
                  <Label htmlFor="landlord-no" className="text-sm text-gray-700">No restrictions on pets</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Yard/Outdoor Space *</Label>
              <Select
                value={formData.yardType}
                onValueChange={(value) => updateFormData("yardType", value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                  <SelectValue placeholder="Select yard type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fenced-large">Large fenced yard</SelectItem>
                  <SelectItem value="fenced-small">Small fenced yard</SelectItem>
                  <SelectItem value="unfenced">Unfenced yard</SelectItem>
                  <SelectItem value="balcony">Balcony only</SelectItem>
                  <SelectItem value="none">No outdoor space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="householdSize" className="text-sm font-medium text-gray-700">Number of people in household *</Label>
              <Input
                id="householdSize"
                type="number"
                min="1"
                value={formData.householdSize}
                onChange={(e) => updateFormData("householdSize", e.target.value)}
                placeholder="e.g., 2"
                className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPetExperience = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <PawPrint className="h-5 w-5 text-amber-500 mr-2" />
          Pet Experience
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Have you owned pets before? *</Label>
            <RadioGroup
              value={formData.previousPets}
              onValueChange={(value) => updateFormData("previousPets", value)}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="prev-yes" className="text-teal-500" />
                <Label htmlFor="prev-yes" className="text-sm text-gray-700">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="prev-no" className="text-teal-500" />
                <Label htmlFor="prev-no" className="text-sm text-gray-700">No, this will be my first pet</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.previousPets === "yes" && (
            <div className="space-y-2">
              <Label htmlFor="petExperience" className="text-sm font-medium text-gray-700">Tell us about your previous pets</Label>
              <Textarea
                id="petExperience"
                value={formData.petExperience}
                onChange={(e) => updateFormData("petExperience", e.target.value)}
                placeholder="What types of pets have you had? How long did you care for them? What happened to them?"
                rows={4}
                className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Do you currently have any pets? *</Label>
            <RadioGroup
              value={formData.currentPets}
              onValueChange={(value) => updateFormData("currentPets", value)}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="current-yes" className="text-teal-500" />
                <Label htmlFor="current-yes" className="text-sm text-gray-700">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="current-no" className="text-teal-500" />
                <Label htmlFor="current-no" className="text-sm text-gray-700">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veterinarian" className="text-sm font-medium text-gray-700">
              Do you have a veterinarian in Penang? *
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-4 w-4 inline text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>We can recommend local vets if you don't have one yet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Textarea
              id="veterinarian"
              value={formData.veterinarian}
              onChange={(e) => updateFormData("veterinarian", e.target.value)}
              placeholder="Vet clinic name and location, or 'No, please recommend one'"
              rows={2}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderLifestyle = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          Lifestyle & Preferences
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workSchedule" className="text-sm font-medium text-gray-700">Describe your work schedule *</Label>
            <Textarea
              id="workSchedule"
              value={formData.workSchedule}
              onChange={(e) => updateFormData("workSchedule", e.target.value)}
              placeholder="e.g., Work from home, 9-5 office job, shift work, etc."
              rows={3}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">How much time can you dedicate to pet exercise daily? *</Label>
            <Select
              value={formData.exerciseCommitment}
              onValueChange={(value) => updateFormData("exerciseCommitment", value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Select exercise commitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30min">Less than 30 minutes</SelectItem>
                <SelectItem value="1hour">30 minutes to 1 hour</SelectItem>
                <SelectItem value="2hours">1-2 hours</SelectItem>
                <SelectItem value="more">More than 2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">How often do you travel? *</Label>
            <Select
              value={formData.travelFrequency}
              onValueChange={(value) => updateFormData("travelFrequency", value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Select travel frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarely">Rarely (few times a year)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="frequently">Very frequently</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="petPreferences" className="text-sm font-medium text-gray-700">
              What are you looking for in {pet?.name}? *
            </Label>
            <Textarea
              id="petPreferences"
              value={formData.petPreferences}
              onChange={(e) => updateFormData("petPreferences", e.target.value)}
              placeholder={`Why are you interested in adopting ${pet?.name}? What drew you to this specific pet?`}
              rows={4}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderHousehold = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-indigo-500 mr-2" />
          Household Members
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="householdMembers" className="text-sm font-medium text-gray-700">
              Tell us about everyone who lives in your home *
            </Label>
            <Textarea
              id="householdMembers"
              value={formData.householdMembers}
              onChange={(e) => updateFormData("householdMembers", e.target.value)}
              placeholder="Ages and relationship to you (e.g., spouse, children, roommates, etc.)"
              rows={3}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Does anyone in your household have pet allergies? *</Label>
            <RadioGroup
              value={formData.allergies}
              onValueChange={(value) => updateFormData("allergies", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="allergies-no" className="text-teal-500" />
                <Label htmlFor="allergies-no" className="text-sm text-gray-700">No allergies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mild" id="allergies-mild" className="text-teal-500" />
                <Label htmlFor="allergies-mild" className="text-sm text-gray-700">Mild allergies (manageable)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="severe" id="allergies-severe" className="text-teal-500" />
                <Label htmlFor="allergies-severe" className="text-sm text-gray-700">Severe allergies</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="childrenAges" className="text-sm font-medium text-gray-700">If you have children, what are their ages?</Label>
            <Input
              id="childrenAges"
              value={formData.childrenAges}
              onChange={(e) => updateFormData("childrenAges", e.target.value)}
              placeholder="e.g., 5, 8, 12 years old or 'No children'"
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAgreement = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-emerald-500 mr-2" />
          References & Agreement
        </h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="references" className="text-sm font-medium text-gray-700">Personal References *</Label>
            <Textarea
              id="references"
              value={formData.references}
              onChange={(e) => updateFormData("references", e.target.value)}
              placeholder="Please provide 2 personal references (name, relationship, phone number)"
              rows={4}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">Emergency Contact *</Label>
            <Textarea
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => updateFormData("emergencyContact", e.target.value)}
              placeholder="Name, relationship, and phone number of someone who can care for your pet in emergencies"
              rows={3}
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-700">Please read and agree to the following: *</Label>
            <div className="space-y-3">
              {[
                "I understand that pet adoption is a lifetime commitment (10-15+ years)",
                "I agree to provide proper veterinary care, including annual check-ups and vaccinations",
                "I will not declaw cats or crop ears/tails of dogs",
                "I agree to return the pet to the shelter if I can no longer care for them",
                "I understand that a home visit may be required before adoption",
                "All information provided in this application is true and accurate",
              ].map((agreement, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <Checkbox
                    id={`agreement-${index}`}
                    checked={formData.agreements.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("agreements", [...formData.agreements, index])
                      } else {
                        updateFormData(
                          "agreements",
                          formData.agreements.filter((i: number) => i !== index),
                        )
                      }
                    }}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <Label htmlFor={`agreement-${index}`} className="text-sm leading-5 text-gray-700">
                    {agreement}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "personal": return renderPersonalInfo()
      case "living": return renderLivingSituation()
      case "experience": return renderPetExperience()
      case "lifestyle": return renderLifestyle()
      case "household": return renderHousehold()
      case "agreement": return renderAgreement()
      default: return renderPersonalInfo()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-600 mb-6">
              Please log in to submit an adoption application.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full bg-teal-500 hover:bg-teal-600">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application form...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h1>
            <p className="text-gray-600 mb-6">
              The pet you're trying to apply for doesn't exist or may have been adopted.
            </p>
            <Link href="/dashboard/pets">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Left Sidebar - Navigation & Preview */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link href={`/dashboard/pets/${pet.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {pet.name}
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
                src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder.svg"}
                alt={pet.name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-teal-100 text-teal-600">
                {pet.name[0]}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Adopting {pet.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <PawPrint className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 capitalize">{pet.type}</span>
              {pet.breed && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{pet.breed}</span>
                </>
              )}
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              {pet.shelter.name}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600">Application Progress</span>
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
            <h3 className="text-sm font-medium text-gray-500 mb-3">APPLICATION SECTIONS</h3>
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              const progress = getSectionProgress(section.id)
              const isComplete = progress === 100

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
                  <div className={`p-1 rounded ${
                    isComplete
                      ? 'bg-green-100 text-green-600'
                      : isActive
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{section.label}</div>
                    <div className="text-xs text-gray-500">
                      {isComplete ? "Complete" : `${Math.round(progress)}% complete`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200">
          {showSuccess ? (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Application Submitted!</AlertTitle>
              <AlertDescription className="text-green-700">
                Redirecting you to your applications...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={saveDraft}
                variant="outline"
                className="w-full gap-2"
                size="sm"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={submitApplication}
                disabled={!canSubmit || isSubmitting}
                className="w-full gap-2 bg-teal-500 hover:bg-teal-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
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
                  {activeSection === "personal" && "Tell us about yourself"}
                  {activeSection === "living" && "About your home and lifestyle"}
                  {activeSection === "experience" && "Your history with pets"}
                  {activeSection === "lifestyle" && "How a pet fits into your life"}
                  {activeSection === "household" && "Who lives with you"}
                  {activeSection === "agreement" && "Final details and consent"}
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