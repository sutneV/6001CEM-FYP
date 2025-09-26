"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import {
  FileText,
  CheckCircle2,
  ClipboardList,
  Plus,
  Edit,
  Eye,
  Users,
  Camera,
  PawPrint,
  Clock,
  Phone,
  Heart,
  Home,
  AlertCircle,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

export default function ShelterDashboardPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [isLoadingPets, setIsLoadingPets] = useState(true)
  const [applications, setApplications] = useState([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRecentPets()
      fetchRecentApplications()
    }
  }, [user])

  const fetchRecentPets = async () => {
    try {
      setIsLoadingPets(true)

      // Fetch all pets and filter by shelter on the client side
      // since the shelter pets API uses different auth
      const [petsResponse, applicationsResponse] = await Promise.all([
        fetch('/api/pets', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        }),
        fetch('/api/applications', {
          headers: {
            'x-user-data': JSON.stringify(user),
          },
        })
      ])

      if (petsResponse.ok) {
        const allPets = await petsResponse.json()

        // Filter pets by the user's shelter
        const shelterPets = user?.shelter?.id
          ? allPets.filter(pet => pet.shelter?.id === user.shelter.id)
          : []

        const recentPets = shelterPets.slice(0, 4)

        // Count applications per pet
        let applicationCounts = {}
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json()

          applicationCounts = applications.reduce((counts, app) => {
            // Check for different possible property names
            const petId = app.petId || app.pet_id || app.pet?.id

            if (petId) {
              counts[petId] = (counts[petId] || 0) + 1
            }
            return counts
          }, {})
        }

        // Add application counts to pets
        const petsWithCounts = recentPets.map(pet => ({
          ...pet,
          applicationCount: applicationCounts[pet.id] || 0
        }))

        setPets(petsWithCounts)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setIsLoadingPets(false)
    }
  }

  const fetchRecentApplications = async () => {
    try {
      setIsLoadingApplications(true)
      const response = await fetch('/api/applications', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Limit to 4 most recent applications
        setApplications(data.slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoadingApplications(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'adopted':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'pending':
        return 'Pending'
      case 'adopted':
        return 'Adopted'
      default:
        return status
    }
  }

  const getApplicationStatusConfig = (status) => {
    switch (status) {
      case "draft":
        return {
          label: "Draft",
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-100",
          icon: FileText,
        }
      case "submitted":
        return {
          label: "Submitted",
          color: "bg-teal-500",
          textColor: "text-teal-700",
          bgColor: "bg-teal-100",
          icon: FileText,
        }
      case "under_review":
        return {
          label: "Under Review",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-100",
          icon: Clock,
        }
      case "interview_scheduled":
        return {
          label: "Interview Scheduled",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-100",
          icon: Phone,
        }
      case "meet_greet_scheduled":
        return {
          label: "Meet & Greet Scheduled",
          color: "bg-purple-500",
          textColor: "text-purple-700",
          bgColor: "bg-purple-100",
          icon: Heart,
        }
      case "home_visit_scheduled":
        return {
          label: "Home Visit Scheduled",
          color: "bg-indigo-500",
          textColor: "text-indigo-700",
          bgColor: "bg-indigo-100",
          icon: Home,
        }
      case "pending_approval":
        return {
          label: "Pending Approval",
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-100",
          icon: AlertCircle,
        }
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-100",
          icon: CheckCircle2,
        }
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-100",
          icon: XCircle,
        }
      default:
        return {
          label: status,
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-100",
          icon: FileText,
        }
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
                  Welcome back, {user?.shelterName || user?.firstName ? (user.shelterName || `${user.firstName} ${user.lastName}`) : 'Shelter Admin'}!
                </h2>
                <p className="text-gray-500">Manage your pets and adoption applications</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-teal-500 hover:bg-teal-600">
                  Add New Pet
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Shelter Stats */}
      <motion.section variants={fadeIn}>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Available Pets", value: "23", change: "+3", icon: PawPrint, color: "text-blue-600" },
            {
              label: "Pending Applications",
              value: "12",
              change: "+5",
              icon: ClipboardList,
              color: "text-orange-600",
            },
            {
              label: "Successful Adoptions",
              value: "87",
              change: "+8",
              icon: CheckCircle2,
              color: "text-green-600",
            },
            { label: "Active Adopters", value: "156", change: "+12", icon: Users, color: "text-purple-600" },
          ].map((stat, index) => (
            <motion.div key={index} variants={popIn}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change} this month</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <stat.icon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recent Applications and Pet Management */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Applications */}
        <motion.section variants={fadeIn}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest adoption applications for your pets</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoadingApplications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading applications...</p>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-500">Applications will appear here when adopters apply for your pets</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {applications.map((application, index) => {
                    const statusConfig = getApplicationStatusConfig(application.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <motion.div
                        key={application.id}
                        variants={popIn}
                        whileHover={{ y: -2 }}
                        className="flex gap-4 rounded-lg border p-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {application.firstName?.charAt(0)}{application.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {application.firstName} {application.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {application.pet?.name} ({application.pet?.breed})
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(application.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <Link
                href="/dashboard/shelter/applications"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View all applications
              </Link>
            </CardFooter>
          </Card>
        </motion.section>

        {/* Pet Management */}
        <motion.section variants={fadeIn}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Your Pets</CardTitle>
              <CardDescription>Manage your available pets</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoadingPets ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading your pets...</p>
                  </div>
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first pet to the system</p>
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    Add New Pet
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {pets.map((pet, index) => (
                    <motion.div
                      key={pet.id}
                      variants={popIn}
                      whileHover={{ y: -2 }}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {pet.images && pet.images.length > 0 ? (
                          <Image
                            src={pet.images[0]}
                            alt={pet.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <PawPrint className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{pet.name}</h4>
                        <p className="text-sm text-gray-500">
                          {pet.breed} • {pet.age}
                        </p>
                        <p className="text-xs text-gray-400">
                          {pet.applicationCount || 0} applications
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={pet.status === "available" ? "default" : "secondary"}
                          className={getStatusColor(pet.status)}
                        >
                          {getStatusLabel(pet.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Pet
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Camera className="mr-2 h-4 w-4" />
                              Update Photos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <Link
                href="/dashboard/shelter/pets"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Manage all pets
              </Link>
            </CardFooter>
          </Card>
        </motion.section>
      </div>

      {/* Adoption Statistics */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Adoption Statistics</CardTitle>
            <CardDescription>Track your shelter's adoption performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="breeds">By Breed</TabsTrigger>
                <TabsTrigger value="age">By Age</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Adoption Rate</p>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Average Days to Adopt</p>
                    <p className="text-2xl font-bold text-blue-600">14</p>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Return Rate</p>
                    <p className="text-2xl font-bold text-red-600">3%</p>
                    <Progress value={3} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Last Month</p>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Growth</p>
                    <p className="text-2xl font-bold text-purple-600">+50%</p>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="breeds" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dogs</p>
                    <p className="text-2xl font-bold text-blue-600">65%</p>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cats</p>
                    <p className="text-2xl font-bold text-purple-600">30%</p>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Others</p>
                    <p className="text-2xl font-bold text-green-600">5%</p>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="age" className="mt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Puppies/Kittens</p>
                    <p className="text-2xl font-bold text-green-600">45%</p>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Young Adults</p>
                    <p className="text-2xl font-bold text-blue-600">35%</p>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Seniors</p>
                    <p className="text-2xl font-bold text-purple-600">20%</p>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for shelter management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/dashboard/shelter/pets/add">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Pet
                </Button>
              </Link>
              <Link href="/dashboard/shelter/applications">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Review Applications
                </Button>
              </Link>
              <Link href="/dashboard/shelter/pets">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <PawPrint className="h-4 w-4" />
                  Manage Pets
                </Button>
              </Link>
              <Link href="/dashboard/shelter/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}