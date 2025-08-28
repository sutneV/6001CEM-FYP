"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  MoreHorizontal,
  PawPrint,
  Phone,
  MessageSquare,
  X,
  XCircle,
  Info,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

// Mock application data
const applications = [
  {
    id: "APP-123456",
    pet: {
      id: "buddy-123",
      name: "Buddy",
      breed: "Golden Retriever",
      age: "2 years",
      image: "/placeholder.svg?height=300&width=300&text=Buddy",
      location: "George Town, Penang",
    },
    status: "interview_scheduled",
    submittedDate: "2025-05-10",
    lastUpdate: "2025-05-15",
    progress: 50,
    currentStep: "Phone Interview",
    nextAction: "Phone interview scheduled for May 18, 2025 at 2:00 PM",
    timeline: [
      { step: "Application Submitted", date: "May 10, 2025", completed: true },
      { step: "Initial Review", date: "May 12, 2025", completed: true },
      { step: "Phone Interview", date: "May 18, 2025", completed: false, scheduled: true },
      { step: "Meet & Greet", date: "TBD", completed: false },
      { step: "Home Visit", date: "TBD", completed: false },
      { step: "Final Decision", date: "TBD", completed: false },
    ],
  },
  {
    id: "APP-123789",
    pet: {
      id: "whiskers-456",
      name: "Whiskers",
      breed: "Siamese Cat",
      age: "1 year",
      image: "/placeholder.svg?height=300&width=300&text=Whiskers",
      location: "Batu Ferringhi, Penang",
    },
    status: "approved",
    submittedDate: "2025-05-02",
    lastUpdate: "2025-05-14",
    progress: 100,
    currentStep: "Approved",
    nextAction: "Adoption finalization scheduled for May 20, 2025",
    timeline: [
      { step: "Application Submitted", date: "May 2, 2025", completed: true },
      { step: "Initial Review", date: "May 4, 2025", completed: true },
      { step: "Phone Interview", date: "May 6, 2025", completed: true },
      { step: "Meet & Greet", date: "May 8, 2025", completed: true },
      { step: "Home Visit", date: "May 12, 2025", completed: true },
      { step: "Final Decision", date: "May 14, 2025", completed: true },
    ],
  },
  {
    id: "APP-124567",
    pet: {
      id: "max-789",
      name: "Max",
      breed: "Labrador Retriever",
      age: "3 years",
      image: "/placeholder.svg?height=300&width=300&text=Max",
      location: "Tanjung Bungah, Penang",
    },
    status: "under_review",
    submittedDate: "2025-05-14",
    lastUpdate: "2025-05-14",
    progress: 25,
    currentStep: "Initial Review",
    nextAction: "Application is being reviewed by our adoption team",
    timeline: [
      { step: "Application Submitted", date: "May 14, 2025", completed: true },
      { step: "Initial Review", date: "In Progress", completed: false },
      { step: "Phone Interview", date: "TBD", completed: false },
      { step: "Meet & Greet", date: "TBD", completed: false },
      { step: "Home Visit", date: "TBD", completed: false },
      { step: "Final Decision", date: "TBD", completed: false },
    ],
  },
  {
    id: "APP-124890",
    pet: {
      id: "luna-101",
      name: "Luna",
      breed: "Ragdoll",
      age: "2 years",
      image: "/placeholder.svg?height=300&width=300&text=Luna",
      location: "George Town, Penang",
    },
    status: "withdrawn",
    submittedDate: "2025-04-28",
    lastUpdate: "2025-05-01",
    progress: 25,
    currentStep: "Withdrawn",
    nextAction: "Application withdrawn by applicant",
    timeline: [
      { step: "Application Submitted", date: "Apr 28, 2025", completed: true },
      { step: "Initial Review", date: "Apr 30, 2025", completed: true },
      { step: "Application Withdrawn", date: "May 1, 2025", completed: true },
    ],
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
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
        label: "Not Approved",
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-100",
        icon: XCircle,
      }
    case "withdrawn":
      return {
        label: "Withdrawn",
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-100",
        icon: X,
      }
    default:
      return {
        label: "Submitted",
        color: "bg-teal-500",
        textColor: "text-teal-700",
        bgColor: "bg-teal-100",
        icon: FileText,
      }
  }
}

export default function ApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const filteredApplications = applications.filter((app) => {
    const matchesTab = selectedTab === "all" || app.status === selectedTab
    const matchesSearch =
      searchQuery === "" ||
      app.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
      case "oldest":
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime()
      case "status":
        return a.status.localeCompare(b.status)
      case "pet_name":
        return a.pet.name.localeCompare(b.pet.name)
      default:
        return 0
    }
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeIn} className="space-y-2">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-500">Track the status of your pet adoption applications</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Applications", value: applications.length, color: "text-blue-600" },
          {
            label: "Under Review",
            value: applications.filter((app) => app.status === "under_review").length,
            color: "text-yellow-600",
          },
          {
            label: "Approved",
            value: applications.filter((app) => app.status === "approved").length,
            color: "text-green-600",
          },
          {
            label: "In Progress",
            value: applications.filter((app) =>
              ["interview_scheduled", "meet_greet_scheduled", "home_visit_scheduled"].includes(app.status),
            ).length,
            color: "text-purple-600",
          },
        ].map((stat, index) => (
          <motion.div key={index} variants={popIn}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <PawPrint className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="pet_name">Pet Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Applications Tabs */}
      <motion.div variants={fadeIn}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="under_review">Review</TabsTrigger>
            <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <motion.div variants={staggerContainer} className="space-y-4">
              {sortedApplications.length === 0 ? (
                <motion.div variants={popIn}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <PawPrint className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="mt-4 font-medium">No applications found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery
                          ? "Try adjusting your search criteria"
                          : "You haven't submitted any applications yet"}
                      </p>
                      {!searchQuery && (
                        <Link href="/pets">
                          <Button className="mt-4 bg-teal-500 hover:bg-teal-600">Browse Available Pets</Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                sortedApplications.map((application) => {
                  const statusConfig = getStatusConfig(application.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <motion.div key={application.id} variants={popIn} whileHover={{ y: -5 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                            {/* Pet Info */}
                            <div className="flex gap-4">
                              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={application.pet.image || "/placeholder.svg"}
                                  alt={application.pet.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold">{application.pet.name}</h3>
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {application.pet.breed} • {application.pet.age}
                                </p>
                                <p className="text-xs text-gray-400">Application ID: {application.id}</p>
                              </div>
                            </div>

                            {/* Progress Section */}
                            <div className="flex-1">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">Progress</span>
                                  <span className="text-gray-500">{application.progress}% Complete</span>
                                </div>
                                <Progress
                                  value={application.progress}
                                  className="h-2 bg-gray-100"
                                  indicatorClassName={statusConfig.color}
                                />
                                <p className="text-xs text-gray-500">Current: {application.currentStep}</p>
                              </div>
                            </div>

                            {/* Dates and Actions */}
                            <div className="flex flex-col gap-4 lg:items-end">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Updated: {new Date(application.lastUpdate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Application Details - {application.pet.name}</DialogTitle>
                                      <DialogDescription>Application ID: {application.id}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      {/* Pet Info in Modal */}
                                      <div className="flex gap-4">
                                        <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                                          <Image
                                            src={application.pet.image || "/placeholder.svg"}
                                            alt={application.pet.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div>
                                          <h3 className="text-xl font-semibold">{application.pet.name}</h3>
                                          <p className="text-gray-500">
                                            {application.pet.breed} • {application.pet.age}
                                          </p>
                                          <p className="text-sm text-gray-500">{application.pet.location}</p>
                                        </div>
                                      </div>

                                      {/* Timeline */}
                                      <div>
                                        <h4 className="font-medium mb-4">Application Timeline</h4>
                                        <div className="space-y-4">
                                          {application.timeline.map((step, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                              <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                  step.completed
                                                    ? "bg-green-100 text-green-700"
                                                    : step.scheduled
                                                      ? "bg-blue-100 text-blue-700"
                                                      : "bg-gray-100 text-gray-400"
                                                }`}
                                              >
                                                {step.completed ? (
                                                  <Check className="h-4 w-4" />
                                                ) : step.scheduled ? (
                                                  <Calendar className="h-4 w-4" />
                                                ) : (
                                                  <Clock className="h-4 w-4" />
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium">{step.step}</p>
                                                <p className="text-sm text-gray-500">{step.date}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Next Action */}
                                      <div className="rounded-lg bg-teal-50 p-4">
                                        <h4 className="font-medium text-teal-900">Next Action</h4>
                                        <p className="text-sm text-teal-700">{application.nextAction}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Contact Coordinator
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Schedule Appointment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Download Application
                                    </DropdownMenuItem>
                                    {application.status !== "withdrawn" &&
                                      application.status !== "approved" &&
                                      application.status !== "rejected" && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600">
                                            <X className="mr-2 h-4 w-4" />
                                            Withdraw Application
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          {/* Next Action Banner */}
                          {application.status !== "withdrawn" &&
                            application.status !== "rejected" &&
                            application.nextAction && (
                              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-teal-500" />
                                  <p className="text-sm font-medium">Next Step:</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{application.nextAction}</p>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/pets">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <PawPrint className="h-4 w-4" />
                  Browse Available Pets
                </Button>
              </Link>
              <Link href="/apply">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Submit New Application
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}