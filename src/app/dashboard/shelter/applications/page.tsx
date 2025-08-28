"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Heart,
  Home,
  Mail,
  MessageSquare,
  MoreHorizontal,
  PawPrint,
  Phone,
  Search,
  XCircle,
  Info,
  UserCheck,
  AlertCircle,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"

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

// Mock application data for shelter
const initialApplications = [
  {
    id: "APP-123456",
    applicant: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+60 12-345-6789",
      location: "George Town, Penang",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    },
    pet: {
      id: "buddy-123",
      name: "Buddy",
      breed: "Golden Retriever",
      age: "2 years",
      image: "/placeholder.svg?height=300&width=300&text=Buddy",
    },
    status: "interview_scheduled",
    submittedDate: "2025-05-10",
    lastUpdate: "2025-05-15",
    progress: 50,
    currentStep: "Phone Interview",
    priority: "high",
    notes: "Experienced dog owner, has references from previous vet",
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
    applicant: {
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+60 16-789-0123",
      location: "Batu Ferringhi, Penang",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
    },
    pet: {
      id: "whiskers-456",
      name: "Whiskers",
      breed: "Siamese Cat",
      age: "1 year",
      image: "/placeholder.svg?height=300&width=300&text=Whiskers",
    },
    status: "pending_approval",
    submittedDate: "2025-05-02",
    lastUpdate: "2025-05-14",
    progress: 90,
    currentStep: "Final Decision",
    priority: "medium",
    notes: "All checks completed successfully, ready for final approval",
    timeline: [
      { step: "Application Submitted", date: "May 2, 2025", completed: true },
      { step: "Initial Review", date: "May 4, 2025", completed: true },
      { step: "Phone Interview", date: "May 6, 2025", completed: true },
      { step: "Meet & Greet", date: "May 8, 2025", completed: true },
      { step: "Home Visit", date: "May 12, 2025", completed: true },
      { step: "Final Decision", date: "Pending", completed: false },
    ],
  },
  {
    id: "APP-124567",
    applicant: {
      name: "Emily Wong",
      email: "emily.wong@email.com",
      phone: "+60 19-456-7890",
      location: "Tanjung Bungah, Penang",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
    },
    pet: {
      id: "max-789",
      name: "Max",
      breed: "Labrador Retriever",
      age: "3 years",
      image: "/placeholder.svg?height=300&width=300&text=Max",
    },
    status: "under_review",
    submittedDate: "2025-05-14",
    lastUpdate: "2025-05-14",
    progress: 25,
    currentStep: "Initial Review",
    priority: "low",
    notes: "New application, requires initial screening",
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
    applicant: {
      name: "David Lim",
      email: "david.lim@email.com",
      phone: "+60 17-234-5678",
      location: "Gurney Drive, Penang",
      avatar: "/placeholder.svg?height=40&width=40&text=DL",
    },
    pet: {
      id: "luna-101",
      name: "Luna",
      breed: "Ragdoll",
      age: "2 years",
      image: "/placeholder.svg?height=300&width=300&text=Luna",
    },
    status: "rejected",
    submittedDate: "2025-04-28",
    lastUpdate: "2025-05-01",
    progress: 25,
    currentStep: "Application Rejected",
    priority: "low",
    notes: "Housing situation not suitable for pet requirements",
    timeline: [
      { step: "Application Submitted", date: "Apr 28, 2025", completed: true },
      { step: "Initial Review", date: "Apr 30, 2025", completed: true },
      { step: "Application Rejected", date: "May 1, 2025", completed: true },
    ],
  },
  {
    id: "APP-125123",
    applicant: {
      name: "Lisa Tan",
      email: "lisa.tan@email.com",
      phone: "+60 12-987-6543",
      location: "Jelutong, Penang",
      avatar: "/placeholder.svg?height=40&width=40&text=LT",
    },
    pet: {
      id: "charlie-202",
      name: "Charlie",
      breed: "Beagle",
      age: "4 years",
      image: "/placeholder.svg?height=300&width=300&text=Charlie",
    },
    status: "meet_greet_scheduled",
    submittedDate: "2025-05-08",
    lastUpdate: "2025-05-16",
    progress: 60,
    currentStep: "Meet & Greet",
    priority: "high",
    notes: "Great interview, excited to meet the pet",
    timeline: [
      { step: "Application Submitted", date: "May 8, 2025", completed: true },
      { step: "Initial Review", date: "May 10, 2025", completed: true },
      { step: "Phone Interview", date: "May 14, 2025", completed: true },
      { step: "Meet & Greet", date: "May 20, 2025", completed: false, scheduled: true },
      { step: "Home Visit", date: "TBD", completed: false },
      { step: "Final Decision", date: "TBD", completed: false },
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
        label: "Submitted",
        color: "bg-teal-500",
        textColor: "text-teal-700",
        bgColor: "bg-teal-100",
        icon: FileText,
      }
  }
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "high":
      return { label: "High", color: "bg-red-100 text-red-700" }
    case "medium":
      return { label: "Medium", color: "bg-yellow-100 text-yellow-700" }
    case "low":
      return { label: "Low", color: "bg-green-100 text-green-700" }
    default:
      return { label: "Normal", color: "bg-gray-100 text-gray-700" }
  }
}

export default function ShelterApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [applications, setApplications] = useState(initialApplications)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const filteredApplications = applications.filter((app) => {
    const matchesTab = selectedTab === "all" || app.status === selectedTab
    const matchesSearch =
      searchQuery === "" ||
      app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return (
          priorityOrder[b.priority as keyof typeof priorityOrder] -
          priorityOrder[a.priority as keyof typeof priorityOrder]
        )
      case "status":
        return a.status.localeCompare(b.status)
      case "applicant_name":
        return a.applicant.name.localeCompare(b.applicant.name)
      case "pet_name":
        return a.pet.name.localeCompare(b.pet.name)
      default:
        return 0
    }
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    setIsUpdating(applicationId)

    try {
    // In a real app, this would make an API call
      // await updateApplicationStatus(applicationId, newStatus, notes)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: newStatus,
                lastUpdate: new Date().toISOString().split("T")[0],
                progress: getProgressForStatus(newStatus),
                currentStep: getCurrentStepForStatus(newStatus),
                ...(notes && { notes: notes }),
              }
            : app,
        ),
      )

      // Show success message (you could use a toast here)
      console.log(`Application ${applicationId} updated to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update application status:", error)
      // Show error message
    } finally {
      setIsUpdating(null)
    }
  }

  const getProgressForStatus = (status: string): number => {
    switch (status) {
      case "under_review":
        return 25
      case "interview_scheduled":
        return 40
      case "meet_greet_scheduled":
        return 60
      case "home_visit_scheduled":
        return 80
      case "pending_approval":
        return 90
      case "approved":
        return 100
      case "rejected":
        return 25
      default:
        return 0
    }
  }

  const getCurrentStepForStatus = (status: string): string => {
    switch (status) {
      case "under_review":
        return "Initial Review"
      case "interview_scheduled":
        return "Phone Interview"
      case "meet_greet_scheduled":
        return "Meet & Greet"
      case "home_visit_scheduled":
        return "Home Visit"
      case "pending_approval":
        return "Final Decision"
      case "approved":
        return "Application Approved"
      case "rejected":
        return "Application Rejected"
      default:
        return "Application Submitted"
    }
  }

  const handleBulkStatusUpdate = async (applicationIds: string[], newStatus: string) => {
    for (const id of applicationIds) {
      await handleStatusUpdate(id, newStatus)
    }
  }

  const [statusUpdateDialog, setStatusUpdateDialog] = useState<{
    open: boolean
    applicationId: string
    currentStatus: string
    newStatus?: string
  } | null>(null)

  const [statusNotes, setStatusNotes] = useState("")

  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
        {/* Stats Cards */}
        <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-5">
          {[
            { label: "Total Applications", value: applications.length, color: "text-blue-600", icon: FileText },
            {
              label: "Under Review",
              value: applications.filter((app) => app.status === "under_review").length,
              color: "text-yellow-600",
              icon: Clock,
            },
            {
              label: "Interviews Scheduled",
              value: applications.filter((app) => app.status === "interview_scheduled").length,
              color: "text-purple-600",
              icon: Phone,
            },
            {
              label: "Pending Approval",
              value: applications.filter((app) => app.status === "pending_approval").length,
              color: "text-orange-600",
              icon: AlertCircle,
            },
            {
              label: "High Priority",
              value: applications.filter((app) => app.priority === "high").length,
              color: "text-red-600",
              icon: UserCheck,
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div key={index} variants={popIn}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <IconComponent className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="applicant_name">Applicant Name</SelectItem>
                <SelectItem value="pet_name">Pet Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Applications Tabs */}
        <motion.div variants={fadeIn}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="under_review">Review</TabsTrigger>
              <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
              <TabsTrigger value="meet_greet_scheduled">Meet & Greet</TabsTrigger>
              <TabsTrigger value="pending_approval">Approval</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                            : "No applications match the selected filter"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  sortedApplications.map((application) => {
                    const statusConfig = getStatusConfig(application.status)
                    const priorityConfig = getPriorityConfig(application.priority)
                    const StatusIcon = statusConfig.icon

                    return (
                      <motion.div key={application.id} variants={popIn} whileHover={{ y: -5 }}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                              {/* Applicant Info */}
                              <div className="flex gap-4">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                                  <Image
                                    src={application.applicant.avatar || "/placeholder.svg"}
                                    alt={application.applicant.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{application.applicant.name}</h3>
                                    <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">{application.applicant.email}</p>
                                  <p className="text-xs text-gray-400">Application ID: {application.id}</p>
                                </div>
                              </div>

                              {/* Pet Info */}
                              <div className="flex gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={application.pet.image || "/placeholder.svg"}
                                    alt={application.pet.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{application.pet.name}</h4>
                                    <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                      <StatusIcon className="mr-1 h-3 w-3" />
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {application.pet.breed} • {application.pet.age}
                                  </p>
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

                              {/* Actions */}
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
                                        Review
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3">
                                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                            <Image
                                              src={application.pet.image || "/placeholder.svg"}
                                              alt={application.pet.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <div>
                                            <div>Application Review - {application.pet.name}</div>
                                            <DialogDescription className="text-sm font-normal text-gray-500">
                                          Applicant: {application.applicant.name} • ID: {application.id}
                                        </DialogDescription>
                                          </div>
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="space-y-6">
                                        {/* Status Overview */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                          <div className="flex items-center gap-3">
                                            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                              <StatusIcon className="mr-1 h-3 w-3" />
                                              {statusConfig.label}
                                            </Badge>
                                            <Badge className={priorityConfig.color}>
                                              {priorityConfig.label} Priority
                                            </Badge>
                                          </div>
                                          <div className="text-right text-sm text-gray-500">
                                          <div>
                                              Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                              Last Updated: {new Date(application.lastUpdate).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Application Progress</span>
                                            <span className="text-gray-500">{application.progress}% Complete</span>
                                          </div>
                                          <Progress value={application.progress} className="h-3 bg-gray-100" />
                                          <p className="text-sm text-gray-500">
                                            Current Step: {application.currentStep}
                                          </p>
                                        </div>

                                        {/* Main Content Grid */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                          {/* Applicant Information */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5" />
                                                Applicant Information
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                                                  <Image
                                                    src={application.applicant.avatar || "/placeholder.svg"}
                                                    alt={application.applicant.name}
                                                    fill
                                                    className="object-cover"
                                                  />
                                                </div>
                                                <div>
                                                  <h3 className="font-semibold text-lg">
                                                    {application.applicant.name}
                                                  </h3>
                                                  <p className="text-gray-500">{application.applicant.location}</p>
                                                </div>
                                              </div>

                                              <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                  <Mail className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.applicant.email}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                  <Phone className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.applicant.phone}
                                              </p>
                                            </div>
                                          </div>

                                                <div className="flex items-center gap-3">
                                                  <Home className="h-4 w-4 text-gray-400" />
                                          <div>
                                                    <p className="text-sm font-medium">Location</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.applicant.location}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Quick Contact Actions */}
                                              <div className="flex gap-2 pt-4 border-t">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="flex-1"
                                                  onClick={() =>
                                                    window.open(`mailto:${application.applicant.email}`, "_blank")
                                                  }
                                                >
                                                  <Mail className="mr-2 h-4 w-4" />
                                                  Email
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="flex-1"
                                                  onClick={() =>
                                                    window.open(`tel:${application.applicant.phone}`, "_blank")
                                                  }
                                                >
                                                  <Phone className="mr-2 h-4 w-4" />
                                                  Call
                                                </Button>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Pet Information */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-5 w-5" />
                                                Pet Information
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              <div className="flex items-center gap-4">
                                                <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                                                <Image
                                                  src={application.pet.image || "/placeholder.svg"}
                                                  alt={application.pet.name}
                                                  fill
                                                  className="object-cover"
                                                />
                                              </div>
                                                <div>
                                                  <h3 className="font-semibold text-lg">{application.pet.name}</h3>
                                                  <p className="text-gray-500">{application.pet.breed}</p>
                                                  <p className="text-sm text-gray-400">{application.pet.age}</p>
                                              </div>
                                            </div>

                                              <div className="space-y-3">
                                                <div className="flex justify-between">
                                                  <span className="text-sm font-medium">Pet ID:</span>
                                                  <span className="text-sm text-gray-600">{application.pet.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm font-medium">Breed:</span>
                                                  <span className="text-sm text-gray-600">{application.pet.breed}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-sm font-medium">Age:</span>
                                                  <span className="text-sm text-gray-600">{application.pet.age}</span>
                                          </div>
                                        </div>

                                              {/* Pet Actions */}
                                              <div className="pt-4 border-t">
                                                <Button variant="outline" size="sm" className="w-full">
                                                  <Eye className="mr-2 h-4 w-4" />
                                                  View Pet Profile
                                                </Button>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>

                                        {/* Application Notes */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <FileText className="h-5 w-5" />
                                              Application Notes
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                              <p className="text-sm text-gray-700 leading-relaxed">
                                                {application.notes || "No additional notes provided."}
                                          </p>
                                        </div>
                                          </CardContent>
                                        </Card>

                                        {/* Application Timeline */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                              <Clock className="h-5 w-5" />
                                              Application Timeline
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                          <div className="space-y-4">
                                            {application.timeline.map((step, index) => (
                                                <div key={index} className="flex items-start gap-4">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                    step.completed
                                                        ? "bg-green-100 border-green-200 text-green-700"
                                                      : step.scheduled
                                                          ? "bg-blue-100 border-blue-200 text-blue-700"
                                                          : "bg-gray-100 border-gray-200 text-gray-400"
                                                  }`}
                                                >
                                                  {step.completed ? (
                                                      <CheckCircle2 className="h-5 w-5" />
                                                  ) : step.scheduled ? (
                                                      <Calendar className="h-5 w-5" />
                                                  ) : (
                                                      <Clock className="h-5 w-5" />
                                                  )}
                                                </div>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                      <p
                                                        className={`font-medium ${step.completed ? "text-green-700" : step.scheduled ? "text-blue-700" : "text-gray-500"}`}
                                                      >
                                                        {step.step}
                                                      </p>
                                                      {step.scheduled && (
                                                        <Badge variant="outline" className="text-xs">
                                                          Scheduled
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                                                    {index < application.timeline.length - 1 && (
                                                      <div
                                                        className={`w-0.5 h-6 mt-2 ml-4 ${step.completed ? "bg-green-200" : "bg-gray-200"}`}
                                                      />
                                                    )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          </CardContent>
                                        </Card>

                                        {/* Action Buttons */}
                                        <Card>
                                          <CardHeader>
                                            <CardTitle>Application Actions</CardTitle>
                                            <CardDescription>Take action on this application</CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                          <Button
                                            className="bg-green-600 hover:bg-green-700"
                                                onClick={() => {
                                                  handleStatusUpdate(
                                                    application.id,
                                                    "approved",
                                                    "Application approved by shelter staff",
                                                  )
                                                }}
                                                disabled={isUpdating === application.id}
                                          >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                {isUpdating === application.id ? "Updating..." : "Approve"}
                                          </Button>

                                          <Button
                                            variant="destructive"
                                                onClick={() => {
                                                  handleStatusUpdate(
                                                    application.id,
                                                    "rejected",
                                                    "Application rejected by shelter staff",
                                                  )
                                                }}
                                                disabled={isUpdating === application.id}
                                          >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>

                                              <Button
                                                variant="outline"
                                                onClick={() => {
                                                  handleStatusUpdate(
                                                    application.id,
                                                    "interview_scheduled",
                                                    "Interview scheduled by shelter staff",
                                                  )
                                                }}
                                                disabled={isUpdating === application.id}
                                              >
                                                <Phone className="mr-2 h-4 w-4" />
                                            Schedule Interview
                                          </Button>

                                              <Button
                                                variant="outline"
                                                onClick={() => {
                                                  handleStatusUpdate(
                                                    application.id,
                                                    "meet_greet_scheduled",
                                                    "Meet & Greet scheduled by shelter staff",
                                                  )
                                                }}
                                                disabled={isUpdating === application.id}
                                              >
                                                <Heart className="mr-2 h-4 w-4" />
                                                Schedule Meet & Greet
                                          </Button>
                                        </div>

                                            {/* Additional Actions */}
                                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                              <Button variant="outline" size="sm">
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Add Note
                                              </Button>
                                              <Button variant="outline" size="sm">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Print Application
                                              </Button>
                                              <Button variant="outline" size="sm">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Schedule Home Visit
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" disabled={isUpdating === application.id}>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            application.id,
                                            "interview_scheduled",
                                            "Interview scheduled by shelter staff",
                                          )
                                        }
                                        disabled={isUpdating === application.id}
                                      >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Schedule Interview
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            application.id,
                                            "meet_greet_scheduled",
                                            "Meet & Greet scheduled by shelter staff",
                                          )
                                        }
                                        disabled={isUpdating === application.id}
                                      >
                                        <Heart className="mr-2 h-4 w-4" />
                                        Schedule Meet & Greet
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            application.id,
                                            "home_visit_scheduled",
                                            "Home visit scheduled by shelter staff",
                                          )
                                        }
                                        disabled={isUpdating === application.id}
                                      >
                                        <Home className="mr-2 h-4 w-4" />
                                        Schedule Home Visit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => window.open(`mailto:${application.applicant.email}`, "_blank")}
                                      >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Email
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => window.open(`tel:${application.applicant.phone}`, "_blank")}
                                      >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Call Applicant
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-green-600"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            application.id,
                                            "approved",
                                            "Application approved by shelter staff",
                                          )
                                        }
                                        disabled={isUpdating === application.id}
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approve Application
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            application.id,
                                            "rejected",
                                            "Application rejected by shelter staff",
                                          )
                                        }
                                        disabled={isUpdating === application.id}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Application
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setStatusUpdateDialog({
                                            open: true,
                                            applicationId: application.id,
                                            currentStatus: application.status,
                                          })
                                        }
                                      >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Update Status
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Notes Section */}
                            {application.notes && (
                              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-teal-500" />
                                  <p className="text-sm font-medium">Notes:</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{application.notes}</p>
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
              <CardDescription>Common tasks for managing applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  Review Pending
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Interviews
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  Send Bulk Emails
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <Dialog open={statusUpdateDialog?.open || false} onOpenChange={(open) => !open && setStatusUpdateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>Change the status of this application and add notes if needed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select
                onValueChange={(value) =>
                  setStatusUpdateDialog((prev) => (prev ? { ...prev, newStatus: value } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="meet_greet_scheduled">Meet & Greet Scheduled</SelectItem>
                  <SelectItem value="home_visit_scheduled">Home Visit Scheduled</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (statusUpdateDialog && "newStatus" in statusUpdateDialog && statusUpdateDialog.newStatus) {
                    handleStatusUpdate(statusUpdateDialog.applicationId, statusUpdateDialog.newStatus, statusNotes)
                    setStatusUpdateDialog(null)
                    setStatusNotes("")
                  }
                }}
                disabled={isUpdating === statusUpdateDialog?.applicationId}
              >
                {isUpdating === statusUpdateDialog?.applicationId ? "Updating..." : "Update Status"}
              </Button>
              <Button variant="outline" onClick={() => setStatusUpdateDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
