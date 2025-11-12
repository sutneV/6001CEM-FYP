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
import { interviewsService } from "@/lib/services/interviews"
import { format } from "date-fns"

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
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

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

  const fetchUpcomingEvents = useCallback(async () => {
    if (!user) return
    try {
      setEventsLoading(true)
      const today = new Date()
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 2)

      const events = await interviewsService.getCalendarEvents(user, {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(futureDate, 'yyyy-MM-dd'),
      })

      // Filter and sort upcoming events, limit to 4
      const upcoming = events
        .filter(event => new Date(event.event_date) >= today)
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 4)

      setUpcomingEvents(upcoming)
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    } finally {
      setEventsLoading(false)
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      setNotificationsLoading(true)
      const data = await interviewsService.getNotifications(user, { limit: 4 })
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRecentApplications()
  }, [fetchRecentApplications])

  useEffect(() => {
    fetchRecommendedPets()
  }, [fetchRecommendedPets])

  useEffect(() => {
    fetchUpcomingEvents()
  }, [fetchUpcomingEvents])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-teal-100 text-teal-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled':
      case 'meet_greet_scheduled':
      case 'home_visit_scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'submitted':
        return 'Submitted'
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
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'withdrawn':
        return 'Withdrawn'
      default:
        return 'Unknown'
    }
  }

  const getProgressValue = (status) => {
    switch (status) {
      case 'draft':
        return 0
      case 'submitted':
        return 20
      case 'under_review':
        return 40
      case 'interview_scheduled':
        return 50
      case 'meet_greet_scheduled':
        return 65
      case 'home_visit_scheduled':
        return 80
      case 'pending_approval':
        return 90
      case 'approved':
        return 100
      case 'rejected':
        return 40
      case 'withdrawn':
        return 20
      default:
        return 0
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500'
      case 'submitted':
        return 'bg-teal-500'
      case 'under_review':
        return 'bg-yellow-500'
      case 'interview_scheduled':
      case 'meet_greet_scheduled':
      case 'home_visit_scheduled':
        return 'bg-blue-500'
      case 'pending_approval':
        return 'bg-orange-500'
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'withdrawn':
        return 'bg-gray-500'
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

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'interview': return 'Interview'
      case 'meet_greet': return 'Meet & Greet'
      case 'home_visit': return 'Home Visit'
      default: return 'Event'
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interview_scheduled':
        return { icon: Calendar, color: 'bg-blue-100 text-blue-700' }
      case 'interview_response':
        return { icon: MessageSquare, color: 'bg-green-100 text-green-700' }
      case 'interview_reminder':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-700' }
      default:
        return { icon: FileText, color: 'bg-gray-100 text-gray-700' }
    }
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
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled appointments and events</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading events...</p>
                  </div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-500">Your schedule is clear for now</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      variants={popIn}
                      whileHover={{ y: -2 }}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.event_date), 'MMM d, yyyy')} • {format(new Date(`${event.event_date}T${event.event_time}`), 'h:mm a')}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-400">{event.location}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <Link
                href="/dashboard/calendar"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View calendar
              </Link>
            </CardFooter>
          </Card>
        </motion.section>

        {/* Notifications */}
        <motion.section variants={fadeIn}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {notifications.map((notification, index) => {
                    const { icon: NotifIcon, color } = getNotificationIcon(notification.type)
                    const timeDiff = Math.floor((new Date().getTime() - new Date(notification.createdAt).getTime()) / 1000 / 60)
                    const timeAgo =
                      timeDiff < 60 ? `${timeDiff} min ago` :
                      timeDiff < 1440 ? `${Math.floor(timeDiff / 60)} hours ago` :
                      `${Math.floor(timeDiff / 1440)} days ago`

                    return (
                      <motion.div
                        key={notification.id}
                        variants={popIn}
                        whileHover={{ y: -2 }}
                        className="flex gap-4 rounded-lg border p-3"
                      >
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${color}`}>
                          <NotifIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400">{timeAgo}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
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
    </motion.div>
  )
}