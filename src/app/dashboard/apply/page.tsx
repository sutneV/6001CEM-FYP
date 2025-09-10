"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Info,
  PawPrint,
  Save,
  User,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const slideIn = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.3 },
  },
}

// Form steps configuration
const formSteps = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User,
    fields: ["firstName", "lastName", "email", "phone", "dateOfBirth", "occupation"],
  },
  {
    id: "living",
    title: "Living Situation",
    description: "About your home and lifestyle",
    icon: Home,
    fields: ["housingType", "ownRent", "address", "landlordPermission", "yardType", "householdSize"],
  },
  {
    id: "experience",
    title: "Pet Experience",
    description: "Your history with pets",
    icon: PawPrint,
    fields: ["previousPets", "currentPets", "petExperience", "veterinarian"],
  },
  {
    id: "lifestyle",
    title: "Lifestyle & Preferences",
    description: "How a pet fits into your life",
    icon: Heart,
    fields: ["workSchedule", "exerciseCommitment", "travelFrequency", "petPreferences"],
  },
  {
    id: "household",
    title: "Household Members",
    description: "Who lives with you",
    icon: Users,
    fields: ["householdMembers", "allergies", "childrenAges"],
  },
  {
    id: "agreement",
    title: "Agreement & References",
    description: "Final details and consent",
    icon: FileText,
    fields: ["references", "emergencyContact", "agreements"],
  },
]

export default function ApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
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
    agreements: [],
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitApplication = () => {
    // Here you would typically send the form data to your backend
    console.log("Submitting application:", formData)
    setIsSubmitted(true)
  }

  const progress = ((currentStep + 1) / formSteps.length) * 100

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
              >
                <Check className="h-8 w-8 text-green-600" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in pet adoption. We've received your application and will review it within
                2-3 business days.
              </p>
              <div className="space-y-4">
                <div className="rounded-lg bg-teal-50 p-4 text-left">
                  <h3 className="font-medium text-teal-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Application review (2-3 days)</li>
                    <li>• Phone interview if approved</li>
                    <li>• Meet & greet with your chosen pet</li>
                    <li>• Home visit (if required)</li>
                    <li>• Final approval and adoption</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">Go to Dashboard</Button>
                  </Link>
                  <Link href="/pets" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Browse More Pets
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-8">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Step {currentStep + 1} of {formSteps.length}
                </h2>
                <p className="text-gray-500">{formSteps[currentStep].description}</p>
              </div>
              <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-100">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-gray-100" indicatorClassName="bg-teal-500" />

            {/* Step Indicators */}
            <div className="flex justify-between">
              {formSteps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        index <= currentStep
                          ? "border-teal-500 bg-teal-500 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </motion.div>
                    <span className="mt-2 text-xs font-medium text-center max-w-[80px]">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = formSteps[currentStep].icon
                  return <IconComponent className="h-5 w-5 text-teal-500" />
                })()}
                {formSteps[currentStep].title}
              </CardTitle>
              <CardDescription>{formSteps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Step 1: Personal Information */}
                  {currentStep === 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateFormData("firstName", e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateFormData("lastName", e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          placeholder="+60 12-345 6789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">
                          Occupation <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => updateFormData("occupation", e.target.value)}
                          placeholder="Your job title"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Living Situation */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>
                            Housing Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.housingType}
                            onValueChange={(value) => updateFormData("housingType", value)}
                          >
                            <SelectTrigger>
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
                          <Label>
                            Do you own or rent? <span className="text-red-500">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.ownRent}
                            onValueChange={(value) => updateFormData("ownRent", value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="own" id="own" />
                              <Label htmlFor="own">Own</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rent" id="rent" />
                              <Label htmlFor="rent">Rent</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          Address <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          placeholder="Your full address in Penang"
                          rows={3}
                        />
                      </div>
                      {formData.ownRent === "rent" && (
                        <div className="space-y-2">
                          <Label>
                            Do you have landlord permission for pets? <span className="text-red-500">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.landlordPermission}
                            onValueChange={(value) => updateFormData("landlordPermission", value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="landlord-yes" />
                              <Label htmlFor="landlord-yes">Yes, I have written permission</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pending" id="landlord-pending" />
                              <Label htmlFor="landlord-pending">I will get permission before adoption</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="landlord-no" />
                              <Label htmlFor="landlord-no">No restrictions on pets</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>
                            Yard/Outdoor Space <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.yardType}
                            onValueChange={(value) => updateFormData("yardType", value)}
                          >
                            <SelectTrigger>
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
                          <Label htmlFor="householdSize">
                            Number of people in household <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="householdSize"
                            type="number"
                            min="1"
                            value={formData.householdSize}
                            onChange={(e) => updateFormData("householdSize", e.target.value)}
                            placeholder="e.g., 2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pet Experience */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>
                          Have you owned pets before? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.previousPets}
                          onValueChange={(value) => updateFormData("previousPets", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="prev-yes" />
                            <Label htmlFor="prev-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="prev-no" />
                            <Label htmlFor="prev-no">No, this will be my first pet</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {formData.previousPets === "yes" && (
                        <div className="space-y-2">
                          <Label htmlFor="petExperience">Tell us about your previous pets</Label>
                          <Textarea
                            id="petExperience"
                            value={formData.petExperience}
                            onChange={(e) => updateFormData("petExperience", e.target.value)}
                            placeholder="What types of pets have you had? How long did you care for them? What happened to them?"
                            rows={4}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>
                          Do you currently have any pets? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.currentPets}
                          onValueChange={(value) => updateFormData("currentPets", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="current-yes" />
                            <Label htmlFor="current-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="current-no" />
                            <Label htmlFor="current-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="veterinarian">
                          Do you have a veterinarian in Penang?
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
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Lifestyle & Preferences */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="workSchedule">
                          Describe your work schedule <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="workSchedule"
                          value={formData.workSchedule}
                          onChange={(e) => updateFormData("workSchedule", e.target.value)}
                          placeholder="e.g., Work from home, 9-5 office job, shift work, etc."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exerciseCommitment">
                          How much time can you dedicate to pet exercise daily? <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.exerciseCommitment}
                          onValueChange={(value) => updateFormData("exerciseCommitment", value)}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="travelFrequency">
                          How often do you travel? <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.travelFrequency}
                          onValueChange={(value) => updateFormData("travelFrequency", value)}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="petPreferences">
                          What are you looking for in a pet? <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="petPreferences"
                          value={formData.petPreferences}
                          onChange={(e) => updateFormData("petPreferences", e.target.value)}
                          placeholder="Describe your ideal pet's personality, energy level, size, etc."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Household Members */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="householdMembers">
                          Tell us about everyone who lives in your home <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="householdMembers"
                          value={formData.householdMembers}
                          onChange={(e) => updateFormData("householdMembers", e.target.value)}
                          placeholder="Ages and relationship to you (e.g., spouse, children, roommates, etc.)"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Does anyone in your household have pet allergies? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.allergies}
                          onValueChange={(value) => updateFormData("allergies", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="allergies-no" />
                            <Label htmlFor="allergies-no">No allergies</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mild" id="allergies-mild" />
                            <Label htmlFor="allergies-mild">Mild allergies (manageable)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="severe" id="allergies-severe" />
                            <Label htmlFor="allergies-severe">Severe allergies</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="childrenAges">If you have children, what are their ages?</Label>
                        <Input
                          id="childrenAges"
                          value={formData.childrenAges}
                          onChange={(e) => updateFormData("childrenAges", e.target.value)}
                          placeholder="e.g., 5, 8, 12 years old or 'No children'"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 6: Agreement & References */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="references">
                          Personal References <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="references"
                          value={formData.references}
                          onChange={(e) => updateFormData("references", e.target.value)}
                          placeholder="Please provide 2 personal references (name, relationship, phone number)"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">
                          Emergency Contact <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                          placeholder="Name, relationship, and phone number of someone who can care for your pet in emergencies"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          Please read and agree to the following: <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-3">
                          {[
                            "I understand that pet adoption is a lifetime commitment (10-15+ years)",
                            "I agree to provide proper veterinary care, including annual check-ups and vaccinations",
                            "I will not declaw cats or crop ears/tails of dogs",
                            "I agree to return the pet to Penang Pet Pals if I can no longer care for them",
                            "I understand that a home visit may be required before adoption",
                            "All information provided in this application is true and accurate",
                          ].map((agreement, index) => (
                            <div key={index} className="flex items-start space-x-2">
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
                              />
                              <Label htmlFor={`agreement-${index}`} className="text-sm leading-5">
                                {agreement}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="gap-2 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              {currentStep === formSteps.length - 1 ? (
                <Button
                  onClick={submitApplication}
                  className="bg-teal-500 hover:bg-teal-600 gap-2"
                  disabled={formData.agreements.length < 6}
                >
                  Submit Application
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={nextStep} className="bg-teal-500 hover:bg-teal-600 gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
