"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Search,
  Globe,
  FileText,
  User
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ShelterApplication {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  city: string | null
  shelterName: string
  shelterDescription: string | null
  registrationNumber: string | null
  address: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function ShelterApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<ShelterApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ShelterApplication | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [password, setPassword] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/shelter-applications')
      const data = await response.json()
      setApplications(data.applications)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedApplication || !password || password.length < 8) {
      toast.error('Please enter a valid password (minimum 8 characters)')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/shelter-applications/${selectedApplication.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy: user?.id,
          password: password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Application approved successfully! Email sent to applicant.')
        setShowApproveDialog(false)
        setPassword('')
        fetchApplications()
      } else {
        toast.error(result.error || 'Failed to approve application')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      toast.error('An error occurred while approving the application')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/shelter-applications/${selectedApplication.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy: user?.id,
          rejectionReason: rejectionReason,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Application rejected successfully! Email sent to applicant.')
        setShowRejectDialog(false)
        setRejectionReason('')
        fetchApplications()
      } else {
        toast.error(result.error || 'Failed to reject application')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast.error('An error occurred while rejecting the application')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  const filterApplications = (apps: ShelterApplication[]) => {
    return apps.filter(app =>
      app.shelterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Sidebar with Applications List */}
      <div className="flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold mb-3">Shelter Applications</h1>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-lg font-bold text-yellow-700">{pendingApplications.length}</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">Pending</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">{approvedApplications.length}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Approved</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-lg font-bold text-red-700">{rejectedApplications.length}</span>
              </div>
              <p className="text-xs text-red-600 mt-1">Rejected</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Applications List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {activeTab === 'pending' && filterApplications(pendingApplications).map((application) => (
              <div
                key={application.id}
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                  selectedApplication?.id === application.id
                    ? "border-teal-500 shadow-lg bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-yellow-100">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-semibold">
                      {application.shelterName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{application.shelterName}</h3>
                      <Badge className="bg-yellow-500 flex-shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {application.firstName} {application.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{application.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(application.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'approved' && filterApplications(approvedApplications).map((application) => (
              <div
                key={application.id}
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                  selectedApplication?.id === application.id
                    ? "border-teal-500 shadow-lg bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-green-100">
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                      {application.shelterName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{application.shelterName}</h3>
                      <Badge className="bg-green-500 flex-shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {application.firstName} {application.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Reviewed: {application.reviewedAt ? formatDate(application.reviewedAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'rejected' && filterApplications(rejectedApplications).map((application) => (
              <div
                key={application.id}
                className={`p-3 cursor-pointer transition-all duration-200 rounded-lg border-2 shadow-sm hover:shadow-md ${
                  selectedApplication?.id === application.id
                    ? "border-teal-500 shadow-lg bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-red-100">
                    <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                      {application.shelterName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{application.shelterName}</h3>
                      <Badge className="bg-red-500 flex-shrink-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {application.firstName} {application.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Reviewed: {application.reviewedAt ? formatDate(application.reviewedAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {((activeTab === 'pending' && filterApplications(pendingApplications).length === 0) ||
              (activeTab === 'approved' && filterApplications(approvedApplications).length === 0) ||
              (activeTab === 'rejected' && filterApplications(rejectedApplications).length === 0)) && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No {activeTab} applications</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Details Panel */}
      {selectedApplication ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 bg-teal-100">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-semibold">
                    {selectedApplication.shelterName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedApplication.shelterName}</h2>
                  <p className="text-gray-600">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </p>
                  <div className="mt-2">{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{selectedApplication.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{selectedApplication.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">City</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm">{selectedApplication.city || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedApplication.website && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Website</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={selectedApplication.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:underline"
                        >
                          {selectedApplication.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shelter Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Shelter Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedApplication.registrationNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Registration Number</Label>
                      <p className="text-sm mt-1">{selectedApplication.registrationNumber}</p>
                    </div>
                  )}
                  {selectedApplication.address && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="text-sm mt-1">{selectedApplication.address}</p>
                    </div>
                  )}
                  {selectedApplication.shelterDescription && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Description</Label>
                      <p className="text-sm mt-1 text-gray-700 leading-relaxed">
                        {selectedApplication.shelterDescription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Application Submitted</p>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedApplication.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        selectedApplication.status === 'approved'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {selectedApplication.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Application {selectedApplication.status === 'approved' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedApplication.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Label className="text-sm font-medium text-red-700">Rejection Reason</Label>
                      <p className="text-sm text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an application</h3>
            <p className="text-gray-600">Choose an application from the list to view details</p>
          </div>
        </div>
      )}


      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Shelter Application</DialogTitle>
            <DialogDescription>
              This will create a shelter account and send login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Set Password for Account</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This password will be sent to the applicant via email.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing || !password || password.length < 8}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve & Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shelter Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
