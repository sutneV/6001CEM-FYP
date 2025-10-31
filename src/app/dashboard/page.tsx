"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import {
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  PawPrint,
  FileText,
  CheckCircle2,
  MessageSquare,
  MapPin,
  Home,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"

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
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommendedPets, setRecommendedPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState("all")

  const fetchRecentApplications = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const response = await fetch('/api/applications?limit=2&orderBy=updatedAt', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Limit to 2 most recent applications
        setApplications(data.slice(0, 2))
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const fetchRecommendedPets = useCallback(async () => {
    if (!user) return
    try {
      setPetsLoading(true)
      const typeFilter = currentTab === 'all' ? '' : `type=${currentTab === 'dogs' ? 'dog' : currentTab === 'cats' ? 'cat' : 'other'}`
      const params = typeFilter ? `?${typeFilter}&limit=4` : '?limit=4'
      const response = await fetch(`/api/pets/recommended${params}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendedPets(data)
      }
    } catch (error) {
      console.error('Error fetching recommended pets:', error)
    } finally {
      setPetsLoading(false)
    }
  }, [user, currentTab])

  useEffect(() => {
    fetchRecentApplications()
  }, [fetchRecentApplications])

  useEffect(() => {
    fetchRecommendedPets()
  }, [fetchRecommendedPets])

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled':
      case 'meet_greet_scheduled':
      case 'home_visit_scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'under_review':
        return 'In Review'
      case 'interview_scheduled':
        return 'Interview Scheduled'
      case 'meet_greet_scheduled':
        return 'Meet & Greet Scheduled'
      case 'home_visit_scheduled':
        return 'Home Visit Scheduled'
      case 'pending_approval':
        return 'Pending Approval'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Draft'
    }
  }

  const getProgressValue = (status) => {
    switch (status) {
      case 'submitted':
        return 25
      case 'under_review':
        return 50
      case 'interview_scheduled':
      case 'meet_greet_scheduled':
      case 'home_visit_scheduled':
        return 75
      case 'approved':
        return 100
      default:
        return 0
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'interview_scheduled':
      case 'meet_greet_scheduled':
      case 'home_visit_scheduled':
        return 'bg-blue-500'
      case 'pending_approval':
        return 'bg-orange-500'
      case 'under_review':
        return 'bg-yellow-500'
      default:
        return 'bg-teal-500'
    }
  }

  const getProgressSteps = (status) => {
    const allSteps = ['Application Submitted', 'Initial Review', 'Interview Process', 'Final Approval']
    const progressValue = getProgressValue(status)

    return allSteps.map((step, index) => {
      const stepProgress = (index + 1) * 25
      return {
        label: step,
        completed: stepProgress <= progressValue,
        current: stepProgress === progressValue + 25 && progressValue < 100
      }
    })
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
      {/* Welcome Section */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Pet Adopter'}!
                </h2>
                <p className="text-gray-500">Here's what's happening with your adoption journey.</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard/pets">
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    Browse Pets
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Application Status */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Your Adoption Applications</CardTitle>
            <CardDescription>Track the status of your pet adoption applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Loading your applications...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">Start your adoption journey by browsing available pets</p>
                <Link href="/dashboard/pets">
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    Browse Pets
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application, index) => (
                  <div key={application.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                          {application.pet?.images && application.pet.images.length > 0 ? (
                            <Image
                              src={application.pet.images[0]}
                              alt={application.pet.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <PawPrint className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {application.pet?.name} - {application.pet?.breed}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Application #{application.id.slice(-8).toUpperCase()}</span>
                            <span>•</span>
                            <span>
                              Updated {new Date(application.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Application Progress</span>
                        <span className="font-medium">
                          {getProgressSteps(application.status).filter(step => step.completed).length} of 4 steps completed
                        </span>
                      </div>
                      <Progress
                        value={getProgressValue(application.status)}
                        className="h-2 bg-gray-100"
                        indicatorClassName={getProgressColor(application.status)}
                      />
                      <div className="grid grid-cols-4 text-xs">
                        {getProgressSteps(application.status).map((step, stepIndex) => (
                          <div key={stepIndex} className="flex flex-col items-center">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              step.completed
                                ? `${getProgressColor(application.status)} text-white`
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {step.completed ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </div>
                            <span className="mt-1 text-center">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {index < applications.length - 1 && <hr className="border-gray-200" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-6 py-3">
            <Link
              href="/dashboard/applications"
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View all applications
            </Link>
          </CardFooter>
        </Card>
      </motion.section>

      {/* Upcoming Events and Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <motion.section variants={fadeIn}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled appointments and events</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {[
                  {
                    title: "Meet & Greet with Buddy",
                    date: "May 18, 2025",
                    time: "10:00 AM",
                    location: "Penang Pet Pals Center, George Town",
                  },
                  {
                    title: "Home Visit Assessment",
                    date: "May 20, 2025",
                    time: "2:00 PM",
                    location: "Your Home Address",
                  },
                  {
                    title: "Pet Care Workshop",
                    date: "May 25, 2025",
                    time: "11:00 AM",
                    location: "Penang Pet Pals Center, George Town",
                  },
                ].map((event, index) => (
                  <motion.div
                    key={index}
                    variants={popIn}
                    whileHover={{ y: -5 }}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <Link
                href="/dashboard/appointments"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View all appointments
              </Link>
            </CardFooter>
          </Card>
        </motion.section>

        {/* Notifications */}
        <motion.section variants={fadeIn}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {[
                  {
                    title: "Application Update",
                    description: "Your application for Buddy has moved to the next stage.",
                    time: "2 hours ago",
                    icon: FileText,
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    title: "Appointment Reminder",
                    description: "You have a meet & greet with Buddy tomorrow at 10:00 AM.",
                    time: "5 hours ago",
                    icon: Calendar,
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  {
                    title: "Application Approved",
                    description: "Your application for Whiskers has been approved!",
                    time: "1 day ago",
                    icon: CheckCircle2,
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    title: "New Message",
                    description: "You have a new message from the adoption coordinator.",
                    time: "2 days ago",
                    icon: MessageSquare,
                    color: "bg-purple-100 text-purple-700",
                  },
                ].map((notification, index) => (
                  <motion.div
                    key={index}
                    variants={popIn}
                    whileHover={{ x: 5 }}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${notification.color}`}
                    >
                      <notification.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="mt-1 text-xs text-gray-500">{notification.description}</p>
                      <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <Link
                href="/dashboard/notifications"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View all notifications
              </Link>
            </CardFooter>
          </Card>
        </motion.section>
      </div>

      {/* Recommended Pets */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Recommended Pets</CardTitle>
            <CardDescription>Based on your preferences and previous interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Pets</TabsTrigger>
                <TabsTrigger value="dogs">Dogs</TabsTrigger>
                <TabsTrigger value="cats">Cats</TabsTrigger>
                <TabsTrigger value="others">Others</TabsTrigger>
              </TabsList>
              <TabsContent value={currentTab} className="mt-0">
                {petsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-500">Finding perfect matches for you...</p>
                    </div>
                  </div>
                ) : recommendedPets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <PawPrint className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pets found</h3>
                    <p className="text-gray-500 mb-4">
                      {currentTab === 'all'
                        ? "There are no available pets at the moment."
                        : `There are no ${currentTab} available at the moment.`}
                    </p>
                    <Link href="/dashboard/pets">
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        Browse All Pets
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  >
                    {recommendedPets.map((pet, index) => (
                      <motion.div
                        key={pet.id}
                        variants={popIn}
                        whileHover={{ y: -10 }}
                        className="overflow-hidden rounded-lg border"
                      >
                        <div className="relative aspect-square">
                          {pet.images && pet.images.length > 0 ? (
                            <Image
                              src={pet.images[0]}
                              alt={pet.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                              <PawPrint className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{pet.name}</h3>
                            <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-100 capitalize">
                              {pet.type}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>
                              {pet.breed} • {pet.age}
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{pet.shelter.address || pet.shelter.name}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                              <Link href={`/dashboard/pets/${pet.id}`}>
                                <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                                  View
                                </Button>
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-6 py-3">
            <Link href="/pets" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              Browse all available pets
            </Link>
          </CardFooter>
        </Card>
      </motion.section>

      {/* Resources and Tips */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Resources for New Pet Parents</CardTitle>
            <CardDescription>Helpful guides and tips for your adoption journey</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  title: "Preparing Your Home",
                  description: "Essential tips for pet-proofing your home before adoption.",
                  icon: Home,
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  title: "First 30 Days Guide",
                  description: "What to expect during the first month with your new pet.",
                  icon: Calendar,
                  color: "bg-purple-100 text-purple-700",
                },
                {
                  title: "Local Vet Recommendations",
                  description: "Top-rated veterinarians in Penang for your new companion.",
                  icon: MapPin,
                  color: "bg-green-100 text-green-700",
                },
              ].map((resource, index) => (
                <motion.div key={index} variants={popIn} whileHover={{ y: -5 }} className="rounded-lg border">
                  <div className="flex items-start gap-4 p-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${resource.color}`}
                    >
                      <resource.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                    </div>
                  </div>
                  <div className="border-t p-3">
                    <Link href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                      Read more
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-6 py-3">
            <Link href="/dashboard/resources" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all resources
            </Link>
          </CardFooter>
        </Card>
      </motion.section>
    </motion.div>
  )
}