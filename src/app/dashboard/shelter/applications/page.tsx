"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/contexts/AuthContext"
import { applicationsService, ApplicationWithDetails } from "@/lib/services/applications"
import { toast } from "sonner"

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

// Status and priority configurations

const getStatusConfig = (status: string) => {
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
    case "withdrawn":
      return {
        label: "Withdrawn",
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-100",
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
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await applicationsService.getApplications(user)
      setApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    reviewerNotes?: string
  ) => {
    if (!user) return

    try {
      setIsUpdating(applicationId)
      await applicationsService.updateApplicationStatus(applicationId, newStatus, reviewerNotes || null, user)
      toast.success(`Application ${newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'updated'} successfully`)
      
      // Refresh applications
      await fetchApplications()
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    } finally {
      setIsUpdating(null)
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesTab = selectedTab === "all" || app.status === selectedTab
    const matchesSearch =
      searchQuery === "" ||
      (app.adopter && `${app.adopter.firstName} ${app.adopter.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.pet.breed && app.pet.breed.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "status":
        return a.status.localeCompare(b.status)
      case "applicant_name":
        return (a.adopter ? `${a.adopter.firstName} ${a.adopter.lastName}` : "").localeCompare(b.adopter ? `${b.adopter.firstName} ${b.adopter.lastName}` : "")
      case "pet_name":
        return a.pet.name.localeCompare(b.pet.name)
      default:
        return 0
    }
  })



  const [statusUpdateDialog, setStatusUpdateDialog] = useState<{
    open: boolean
    applicationId: string
    currentStatus: string
    newStatus?: string
  } | null>(null)

  const [statusNotes, setStatusNotes] = useState("")

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view applications.</p>
        </div>
      </div>
    )
  }

  if (user.role !== 'shelter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only shelter users can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

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
              label: "Submitted",
              value: applications.filter((app) => app.status === "submitted").length,
              color: "text-purple-600",
              icon: Phone,
            },
            {
              label: "Approved",
              value: applications.filter((app) => app.status === "approved").length,
              color: "text-green-600",
              icon: CheckCircle2,
            },
            {
              label: "Rejected",
              value: applications.filter((app) => app.status === "rejected").length,
              color: "text-red-600",
              icon: XCircle,
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
                    // Remove priority config since we don't have priority in real data
                    const StatusIcon = statusConfig.icon

                    return (
                      <motion.div key={application.id} variants={popIn} whileHover={{ y: -5 }}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                              {/* Applicant Info */}
                              <div className="flex gap-4">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-teal-100 flex items-center justify-center">
                                  <span className="text-teal-700 font-semibold">
                                    {application.adopter ? `${application.adopter.firstName[0]}${application.adopter.lastName[0]}` : application.firstName[0] + application.lastName[0]}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">
                                      {application.adopter ? `${application.adopter.firstName} ${application.adopter.lastName}` : `${application.firstName} ${application.lastName}`}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-gray-500">{application.adopter?.email || application.email}</p>
                                  <p className="text-xs text-gray-400">Application ID: {application.id}</p>
                                </div>
                              </div>

                              {/* Pet Info */}
                              <div className="flex gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={application.pet.images?.[0] || "/placeholder.svg"}
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
                                    <span className="text-gray-500">{applicationsService.getProgressForStatus(application.status)}% Complete</span>
                                  </div>
                                  <Progress
                                    value={applicationsService.getProgressForStatus(application.status)}
                                    className="h-2 bg-gray-100"
                                    indicatorClassName={statusConfig.color}
                                  />
                                  <p className="text-xs text-gray-500">Current: {applicationsService.getCurrentStepForStatus(application.status)}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-4 lg:items-end">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Updated: {new Date(application.updatedAt).toLocaleDateString()}
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
                                              src={application.pet.images?.[0] || "/placeholder.svg"}
                                              alt={application.pet.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <div>
                                            <div>Application Review - {application.pet.name}</div>
                                            <DialogDescription className="text-sm font-normal text-gray-500">
                                          Applicant: {application.adopter ? `${application.adopter.firstName} ${application.adopter.lastName}` : `${application.firstName} ${application.lastName}`} • ID: {application.id}
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
                                          </div>
                                          <div className="text-right text-sm text-gray-500">
                                          <div>
                                              Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.createdAt).toLocaleDateString()}
                                            </div>
                                            <div>
                                              Last Updated: {new Date(application.updatedAt).toLocaleDateString()}
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
                                                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-teal-100 flex items-center justify-center">
                                                  <span className="text-teal-700 font-semibold text-lg">
                                                    {application.adopter ? `${application.adopter.firstName[0]}${application.adopter.lastName[0]}` : `${application.firstName[0]}${application.lastName[0]}`}
                                                  </span>
                                                </div>
                                                <div>
                                                  <h3 className="font-semibold text-lg">
                                                    {application.adopter ? `${application.adopter.firstName} ${application.adopter.lastName}` : `${application.firstName} ${application.lastName}`}
                                                  </h3>
                                                  <p className="text-gray-500">{application.address}</p>
                                                </div>
                                              </div>

                                              <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                  <Mail className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.adopter?.email || application.email}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                  <Phone className="h-4 w-4 text-gray-400" />
                                                  <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.adopter?.phone || application.phone}
                                              </p>
                                            </div>
                                          </div>

                                                <div className="flex items-center gap-3">
                                                  <Home className="h-4 w-4 text-gray-400" />
                                          <div>
                                                    <p className="text-sm font-medium">Location</p>
                                                    <p className="text-sm text-gray-600">
                                                      {application.address}
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
                                                    window.open(`mailto:${application.adopter?.email || application.email}`, "_blank")
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
                                                    window.open(`tel:${application.adopter?.phone || application.phone}`, "_blank")
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
                                                  src={application.pet.images?.[0] || "/placeholder.svg"}
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
                                            {applicationsService.getTimelineForApplication(application).map((step, index) => (
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
                                                    {index < applicationsService.getTimelineForApplication(application).length - 1 && (
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
                                                  updateApplicationStatus(
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
                                                  updateApplicationStatus(
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
                                                  updateApplicationStatus(
                                                    application.id,
                                                    "under_review",
                                                    "Application moved to under review",
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
                                                  updateApplicationStatus(
                                                    application.id,
                                                    "submitted",
                                                    "Application status updated",
                                                  )
                                                }}
                                                disabled={isUpdating === application.id}
                                              >
                                                <Heart className="mr-2 h-4 w-4" />
                                                Mark as Submitted
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
